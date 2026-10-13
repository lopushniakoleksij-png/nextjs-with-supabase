/* P3.3 real, local Supabase Auth + Next.js browser acceptance.
 * CI only. NEVER supply a remote URL or production credential.
 * Uses ephemeral local service-role key solely to provision synthetic users.
 */
const { chromium } = require("playwright");
const { createClient } = require("@supabase/supabase-js");

const API = process.env.NEXT_PUBLIC_SUPABASE_URL;
const LOCAL_SERVICE_KEY = process.env.P3_CI_LOCAL_SERVICE_ROLE_KEY;
const PUBLIC_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const WEB = "http://127.0.0.1:3333";

if (API !== "http://127.0.0.1:54321" || !LOCAL_SERVICE_KEY ||
    !PUBLIC_ANON_KEY || process.env.CI !== "true") {
  throw new Error("P3.3 test refuses non-local Supabase or non-CI runtime");
}

const admin = createClient(API, LOCAL_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});
const pass = "Only-P3-CI-Local-Password-2026!";

async function pause(ms = 400) { return new Promise(r => setTimeout(r, ms)); }
async function check(condition, message) {
  if (!condition) throw new Error("FAIL: " + message);
  console.log("PASS: " + message);
}
async function retry(fn, label, attempts = 30) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try { const result = await fn(); if (result) return result; }
    catch (err) { last = err; }
    await pause(600);
  }
  throw new Error("Timed out: " + label + (last ? ": " + last.message : ""));
}
async function createUser(email, isAdmin = false) {
  const { data, error } = await admin.auth.admin.createUser({
    email, password: pass, email_confirm: true,
  });
  if (error || !data.user) throw new Error("Could not create local CI user: " + (error?.message || ""));
  const id = data.user.id;
  const profile = await retry(async () => {
    const r = await admin.from("profiles").select("role").eq("id", id).maybeSingle();
    if (r.error) throw r.error;
    return r.data;
  }, "GoTrue profile trigger");
  if (isAdmin) {
    const u = await admin.from("profiles").update({ role: "admin" }).eq("id", id);
    if (u.error) throw u.error;
  }
  return { id, email, role: isAdmin ? "admin" : profile.role };
}
async function newLogin(browser, email, expectedPath) {
  const context = await browser.newContext({ baseURL: WEB });
  const page = await context.newPage();
  await page.goto("/auth/login");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(pass);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(url => url.pathname === expectedPath, { timeout: 25000 });
  return { context, page };
}
async function getOrg(name) {
  return retry(async () => {
    const r = await admin.from("merchant_organizations")
      .select("id,name,status").eq("name", name).maybeSingle();
    if (r.error) throw r.error;
    return r.data;
  }, "admin-approved " + name);
}

(async () => {
  console.log("P3.3: real local GoTrue auth sessions and Next.js server-action flow");
  const merchantA = await createUser("merchant-a@p3-ci.invalid");
  const merchantB = await createUser("merchant-b@p3-ci.invalid");
  const adminUser = await createUser("review-admin@p3-ci.invalid", true);
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const contexts = [];

  try {
    // Visitor cannot open merchant private office.
    const publicContext = await browser.newContext({ baseURL: WEB });
    contexts.push(publicContext);
    const visitor = await publicContext.newPage();
    await visitor.goto("/merchant");
    await visitor.waitForURL(url => url.pathname === "/auth/login");
    await check(true, "Anonymous browser gets merchant login gate");

    const a = await newLogin(browser, merchantA.email, "/merchant");
    contexts.push(a.context);
    await check((await a.page.locator("body").innerText()).includes("Merchant Office"),
      "Real merchant A session lands at private office");
    await a.page.goto("/merchant/apply");
    await a.page.locator("#organization_name").fill("P3 Local Company A");
    await a.page.locator("#organization_type").selectOption("company");
    await a.page.locator("#contact_email").fill("contact-a@p3-ci.invalid");
    await a.page.getByRole("button", { name: "Submit for verification" }).click();
    await a.page.waitForURL(url => url.pathname === "/merchant" &&
      url.searchParams.get("application") === "submitted", { timeout: 25000 });
    await check(true, "Real merchant form creates pending business application");

    const b = await newLogin(browser, merchantB.email, "/merchant");
    contexts.push(b.context);
    await b.page.goto("/merchant/apply");
    await b.page.locator("#organization_name").fill("P3 Local Company B");
    await b.page.locator("#organization_type").selectOption("shop");
    await b.page.locator("#contact_email").fill("contact-b@p3-ci.invalid");
    await b.page.getByRole("button", { name: "Submit for verification" }).click();
    await b.page.waitForURL(url => url.pathname === "/merchant", { timeout: 25000 });

    const appState = await admin.from("merchant_applications")
      .select("applicant_user_id,status").eq("status", "pending");
    if (appState.error) throw appState.error;
    await check(appState.data.length === 2, "Two real GoTrue identities created separate pending applications");

    // Merchant B cannot see A's pending applicant record.
    const bJwt = createClient(API, PUBLIC_ANON_KEY);
    const signin = await bJwt.auth.signInWithPassword({email: merchantB.email,password:pass});
    if (signin.error) throw signin.error;
    const others = await bJwt.from("merchant_applications")
      .select("id").eq("applicant_user_id", merchantA.id);
    if (others.error) throw others.error;
    await check(others.data.length === 0, "Merchant B cannot read A application through real JWT and RLS");

    // Platform administrator account still routes to admin dashboard.
    const root = await newLogin(browser, adminUser.email, "/dashboard");
    contexts.push(root.context);
    await root.page.goto("/admin/merchants");
    await check((await root.page.locator("body").innerText()).includes("P3 Local Company A"),
      "Administrator sees pending A application");

    // Approve A and B using real Next.js server-action forms, not service-role.
    for (const name of ["P3 Local Company A", "P3 Local Company B"]) {
      await root.page.goto("/admin/merchants");
      const card = root.page.locator("article").filter({ hasText: name }).first();
      await card.getByRole("button", { name: "Verify and approve" }).click();
      await getOrg(name);
    }
    const orgA = await getOrg("P3 Local Company A");
    const orgB = await getOrg("P3 Local Company B");
    await check(orgA.status === "verified" && orgB.status === "verified",
      "Admin approval atomically verified both businesses");

    await a.page.goto("/merchant/business/" + orgA.id);
    await check((await a.page.locator("body").innerText()).includes("P3 Local Company A"),
      "Verified owner A sees company-scoped dashboard");
    await b.page.goto("/merchant/business/" + orgA.id);
    await check((await b.page.locator("body").innerText()).includes("404") ||
      (await b.page.locator("body").innerText()).includes("not be found"),
      "Merchant B cannot enter A's private business page");

    // Real merchant action: create branch then product then pending offer.
    await a.page.goto("/merchant/business/" + orgA.id);
    await a.page.locator("#branch-name").fill("Company A Main Store");
    await a.page.locator("#branch-slug").fill("p33-company-a-main");
    await a.page.getByRole("button", { name: "Add branch" }).click();
    const store = await retry(async () => {
      const q = await admin.from("stores").select("id,merchant_organization_id")
        .eq("slug","p33-company-a-main").maybeSingle();
      if (q.error) throw q.error;
      return q.data;
    },"merchant branch creation");
    await check(store.merchant_organization_id === orgA.id, "Branch belongs only to merchant A");

    await a.page.goto("/merchant/business/" + orgA.id);
    await a.page.locator("#item-name").fill("A Kitchen Installation");
    await a.page.locator("#item-type").selectOption("service");
    await a.page.getByRole("button", { name: "Add item" }).click();
    const item = await retry(async () => {
      const q = await admin.from("merchant_items").select("id,store_id")
        .eq("name","A Kitchen Installation").maybeSingle();
      if (q.error) throw q.error;
      return q.data;
    }, "merchant service creation");
    await check(item.store_id === store.id, "Service tied to the correct company branch");

    await a.page.goto("/merchant/business/" + orgA.id);
    await a.page.locator("#promo-item").selectOption(item.id);
    await a.page.locator("#promo-code").fill("P33REALAUTH20");
    await a.page.locator("#promo-url").fill("https://example.invalid/merchant-a");
    await a.page.getByRole("button", { name: "Submit for approval" }).click();
    const promo = await retry(async () => {
      const q = await admin.from("promo_codes")
        .select("id,approved,store_id,submitted_by")
        .eq("code","P33REALAUTH20").maybeSingle();
      if (q.error) throw q.error;
      return q.data;
    }, "pending merchant offer");
    await check(promo.approved === false && promo.store_id === store.id &&
      promo.submitted_by === merchantA.id,
      "Merchant's real form creates only a pending offer");

    const crossStore = await bJwt.rpc("merchant_create_item", {
      p_organization_id: orgA.id,
      p_store_id: store.id,
      p_item_type: "product",
      p_name: "Cross company attempt",
      p_description: null,
      p_destination_url: null,
    });
    await check(Boolean(crossStore.error),
      "Real B auth token cannot write into A's merchant database");

    // Admin promotes actual pending promo through existing legacy action.
    await root.page.goto("/dashboard");
    await check((await root.page.locator("body").innerText()).includes("P33REALAUTH20"),
      "Existing admin dashboard receives merchant pending promotion");
    const card = root.page.locator("div.rounded-xl").filter({ hasText: "P33REALAUTH20" }).last();
    await card.getByRole("button", { name: "Approve", exact: true }).click();
    await retry(async () => {
      const q = await admin.from("promo_codes").select("approved")
        .eq("id",promo.id).maybeSingle();
      return q.data?.approved === true;
    }, "admin publishes merchant offer");
    await check(true, "Legacy platform admin authorizes final promo publication");
    console.log("P3.3 REAL AUTH + NEXT.JS SERVER ACTION E2E: PASS");
  } finally {
    await Promise.allSettled(contexts.map(x => x.close()));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
