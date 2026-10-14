import assert from "node:assert/strict";
import test from "node:test";
import { evidenceScore, findPromos, promoStore, voteCounts } from "../lib/promo-discovery.ts";
import { SAVED_EVENT, SAVED_KEY, changeSavedId, readSavedIds } from "../lib/saved-deals.ts";

const TEST_ID_A = "8be4d2a0-b96f-4bd9-8a98-723edaa338bc";
const TEST_ID_B = "467b3e53-88f7-436e-ae84-77b31f703f8e";

function promo(id, overrides = {}) {
  return {
    id, code: "WELCOME10", title: "Welcome discount", description: "Save on checkout",
    expires_at: null, created_at: "2026-10-07T15:00:00.000Z",
    worked_count: 0, failed_count: 0, click_count: 0,
    stores: { name: "Example Shop", slug: "example-shop" }, ...overrides,
  };
}

test("search is trimmed, case-insensitive, and covers merchant/title/code/description", () => {
  const items = [promo(TEST_ID_A), promo(TEST_ID_B, {
    code: "AUTUMN20", title: "Autumn offer", description: "Seasonal",
    stores: { name: "Another Shop", slug: "another-shop" },
  })];
  for (const term of [" EXAMPLE ", "welcome10", "checkout"]) {
    assert.deepEqual(findPromos(items, term).map((x) => x.id), [TEST_ID_A]);
  }
  assert.deepEqual(findPromos(items, "AUTUMN20").map((x) => x.id), [TEST_ID_B]);
  assert.deepEqual(findPromos(items, "does not exist"), []);
  assert.equal(findPromos([], "").length, 0);
});

test("sorting never mutates its source and handles nested Supabase stores", () => {
  const older = promo(TEST_ID_A, { created_at: "2026-09-01T00:00:00.000Z", stores: [{ name: "Array Store", slug: "array-store" }] });
  const newer = promo(TEST_ID_B, { created_at: "2026-10-08T00:00:00.000Z" });
  const items = [older, newer];
  assert.equal(promoStore(older)?.name, "Array Store");
  assert.deepEqual(findPromos(items, "", "newest").map((x) => x.id), [TEST_ID_B, TEST_ID_A]);
  assert.deepEqual(items.map((x) => x.id), [TEST_ID_A, TEST_ID_B]);
});

test("expiry sorting puts undated codes last", () => {
  const undated = promo(TEST_ID_A);
  const dated = promo(TEST_ID_B, { expires_at: "2026-10-30T00:00:00Z" });
  assert.deepEqual(findPromos([undated, dated], "", "expiring").map((x) => x.id), [TEST_ID_B, TEST_ID_A]);
});

test("community confidence ranking does not reward unsupported 100% more than strong sample", () => {
  const oneVote = promo(TEST_ID_A, { worked_count: 1, failed_count: 0 });
  const tenVotes = promo(TEST_ID_B, { worked_count: 9, failed_count: 1 });
  assert.equal(voteCounts(oneVote).total, 1);
  assert.ok(evidenceScore(tenVotes) > evidenceScore(oneVote));
  assert.deepEqual(findPromos([oneVote, tenVotes], "", "helpful").map((p) => p.id), [TEST_ID_B, TEST_ID_A]);
});

test("unvoted offers sort after voted offers and never claim a confidence score", () => {
  const unvoted = promo(TEST_ID_A);
  const voted = promo(TEST_ID_B, { worked_count: 2, failed_count: 1 });
  assert.equal(evidenceScore(unvoted), -1);
  assert.deepEqual(findPromos([unvoted, voted], "", "helpful").map((p) => p.id), [TEST_ID_B, TEST_ID_A]);
  assert.equal(voteCounts(promo(TEST_ID_A, { worked_count: null, failed_count: null })).total, 0);
});

function fakeBrowser(initial) {
  const values = new Map(Object.entries(initial));
  const events = [];
  globalThis.window = {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => { values.set(key, value); },
    },
    dispatchEvent: (event) => events.push(event.type),
  };
  return { values, events };
}

test("saved deals permit only valid UUIDs and deduplicate corrupted storage", () => {
  const { values, events } = fakeBrowser({
    [SAVED_KEY]: JSON.stringify([TEST_ID_A, "malicious", TEST_ID_A, TEST_ID_B]),
  });
  try {
    assert.deepEqual(readSavedIds(), [TEST_ID_A, TEST_ID_B]);
    assert.equal(changeSavedId(TEST_ID_A, false), true);
    assert.deepEqual(JSON.parse(values.get(SAVED_KEY)), [TEST_ID_B]);
    assert.equal(changeSavedId("bad-id", true), false);
    assert.deepEqual(events, [SAVED_EVENT]);
    assert.equal(changeSavedId(TEST_ID_A, true), true);
    assert.deepEqual(JSON.parse(values.get(SAVED_KEY)), [TEST_ID_A, TEST_ID_B]);
  } finally {
    delete globalThis.window;
  }
});

test("invalid or blocked browser storage fails closed, without crashing", () => {
  fakeBrowser({ [SAVED_KEY]: "not-json" });
  try {
    assert.deepEqual(readSavedIds(), []);
  } finally {
    delete globalThis.window;
  }
  globalThis.window = { localStorage: { getItem: () => { throw new Error("disabled"); } } };
  try {
    assert.deepEqual(readSavedIds(), []);
    assert.equal(changeSavedId(TEST_ID_A, true), false);
  } finally {
    delete globalThis.window;
  }
});
