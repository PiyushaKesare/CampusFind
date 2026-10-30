// Run with the Firestore emulator:
//   npx firebase emulators:exec --only firestore "node firestore.rules.test.mjs"
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";

const env = await initializeTestEnvironment({
  projectId: "campusfind-rules-test",
  firestore: { rules: readFileSync("firestore.rules", "utf8") },
});

const alice = env.authenticatedContext("alice", {}).firestore();
const bob = env.authenticatedContext("bob", {}).firestore();
const admin = env.authenticatedContext("root", { role: "admin" }).firestore();

let failures = 0;
const check = async (name, fn) => {
  try {
    await fn();
    console.log("PASS", name);
  } catch (e) {
    failures++;
    console.log("FAIL", name, e.message);
  }
};

await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await db.collection("items").doc("i1").set({
    userId: "alice",
    itemName: "Blue backpack",
    category: "Wallets & Bags",
    type: "Lost",
    status: "Lost",
  });
  await db.collection("users").doc("bob").set({ role: "student" });
});

await check("author can edit own report", () =>
  assertSucceeds(alice.collection("items").doc("i1").update({ itemName: "Red backpack" })));

await check("author cannot reassign report to another user", () =>
  assertFails(alice.collection("items").doc("i1").update({ userId: "bob" })));

await check("other student cannot edit report", () =>
  assertFails(bob.collection("items").doc("i1").update({ itemName: "Hacked" })));

await check("admin can edit any report", () =>
  assertSucceeds(admin.collection("items").doc("i1").update({ itemName: "Reviewed" })));

await check("user cannot self-promote to admin", () =>
  assertFails(bob.collection("users").doc("bob").set({ role: "admin" })));

await check("user can save a normal profile", () =>
  assertSucceeds(bob.collection("users").doc("bob").set({ role: "student", name: "Bob" })));

await check("user cannot read another user's profile", () =>
  assertFails(alice.collection("users").doc("bob").get()));

await env.cleanup();
if (failures > 0) {
  console.error(`${failures} rule check(s) failed`);
  process.exit(1);
}
console.log("All rule checks passed");
