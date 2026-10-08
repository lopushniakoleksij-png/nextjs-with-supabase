#!/usr/bin/env node
// Safe smoke test for an authorised public or protected-preview session.
// No valid votes, click IDs, store insertions, or merchant orders are made.
const target = process.argv[2] || process.env.PROMO_SMOKE_BASE_URL;
if (!target) {
  process.stderr.write("Usage: node scripts/smoke-public.mjs https://preview-host\n");
  process.exit(2);
}

let origin;
try {
  origin = new URL(target);
  if (!["https:", "http:"].includes(origin.protocol)) throw new Error("Not HTTP");
  if (origin.protocol === "http:" && !["localhost", "127.0.0.1"].includes(origin.hostname)) {
    throw new Error("HTTP only allowed for localhost testing");
  }
} catch {
  throw new Error("Supply a valid HTTPS origin (or localhost HTTP)");
}

async function probe(path, options = {}) {
  const url = new URL(path, origin);
  const response = await fetch(url, {
    ...options,
    redirect: "manual",
    signal: AbortSignal.timeout(12000),
    headers: { Accept: "text/html,application/json", ...(options.headers || {}) },
  });
  if (response.status === 401 || response.status === 403) {
    throw new Error(path + " preview protection / forbidden: secure Vercel access required");
  }
  return response;
}

let checks = 0;
for (const [path, text] of [
  ["/", "Good deals."],
  ["/stores", "Browse UK stores."],
  ["/saved", "Your saved deals."],
  ["/about", "Better savings need better information."],
]) {
  const response = await probe(path);
  const body = await response.text();
  if (response.status !== 200 || !body.includes(text)) {
    throw new Error(path + " failed: HTTP " + response.status + ", expected heading " + text);
  }
  process.stdout.write("PASS GET " + path + " (200)\n");
  checks++;
}

const missingStore = await probe("/store/qa-nonexistent-merchant-" + Date.now());
if (missingStore.status !== 404) {
  throw new Error("Missing store must be 404, got " + missingStore.status);
}
process.stdout.write("PASS unknown store (404)\n");
checks++;

const malformedRedirect = await probe("/go/not-a-uuid");
if (![307, 308].includes(malformedRedirect.status)) {
  throw new Error("Invalid redirect ID should redirect home, got " + malformedRedirect.status);
}
const destination = new URL(malformedRedirect.headers.get("location") || "", origin);
if (destination.origin !== origin.origin || destination.pathname !== "/") {
  throw new Error("Invalid promo ID redirected somewhere other than the app home");
}
process.stdout.write("PASS invalid outbound ID (safe home redirect)\n");
checks++;

const badVote = await probe("/api/vote", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ promoId: "invalid", voteType: "worked", fingerprint: "smoketest" }),
});
if (badVote.status !== 400) {
  throw new Error("Malformed vote payload must fail with 400, got " + badVote.status);
}
process.stdout.write("PASS malformed vote (400, no write)\n");
checks++;
process.stdout.write("PASS all " + checks + " HTTP smoke checks; no real clicks or votes written.\n");
