// Grants or revokes the `role: admin` custom claim that firestore.rules trusts.
// Run with a service-account credential that is NOT committed to the repo:
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json \
//   node scripts/set-admin.mjs <uid> [--revoke]
// The user must sign out and back in before the new claim takes effect.
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const [uid, flag] = process.argv.slice(2);
if (!uid) {
  console.error("Usage: node scripts/set-admin.mjs <uid> [--revoke]");
  process.exit(1);
}

initializeApp({ credential: applicationDefault() });
const auth = getAuth();
const role = flag === "--revoke" ? null : "admin";

await auth.setCustomUserClaims(uid, role ? { role } : {});
console.log(role ? `Granted admin to ${uid}` : `Revoked admin from ${uid}`);
