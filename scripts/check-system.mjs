// System check: verifies the environment, configs, required source files and
// the production build. Run with `npm run check`. Exits non-zero on failure.
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const results = [];

function check(name, fn) {
  try {
    const detail = fn();
    results.push({ name, ok: true, detail: detail ?? "" });
  } catch (err) {
    results.push({ name, ok: false, detail: err.message });
  }
}

const exists = (rel) => {
  if (!existsSync(join(root, rel))) throw new Error(`missing ${rel}`);
};

const readJson = (rel) => {
  try {
    return JSON.parse(readFileSync(join(root, rel), "utf8"));
  } catch (err) {
    throw new Error(`${rel} is not valid JSON (${err.message})`);
  }
};

check("Node.js version is 18 or newer", () => {
  const major = Number(process.versions.node.split(".")[0]);
  if (major < 18) throw new Error(`found Node ${process.versions.node}`);
  return `v${process.versions.node}`;
});

check("package.json has the expected scripts", () => {
  const pkg = readJson("package.json");
  for (const script of ["dev", "build", "preview"]) {
    if (!pkg.scripts?.[script]) throw new Error(`missing script "${script}"`);
  }
  return Object.keys(pkg.scripts).join(", ");
});

check("Dependencies are installed", () => {
  const pkg = readJson("package.json");
  const missing = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter(
    (dep) => !existsSync(join(root, "node_modules", dep))
  );
  if (missing.length) throw new Error(`not installed: ${missing.join(", ")} (run npm install)`);
  return "all declared packages present";
});

check("Firebase config files are valid", () => {
  exists(".firebaserc");
  const firebase = readJson("firebase.json");
  readJson(".firebaserc");
  const rules = firebase.firestore?.rules;
  if (!rules) throw new Error("firebase.json has no firestore.rules entry");
  exists(rules);
  return `Firestore rules: ${rules}`;
});

check("Firestore rules define the required collections", () => {
  const text = readFileSync(join(root, "firestore.rules"), "utf8");
  const required = ["items", "claims", "notifications", "users"];
  const missing = required.filter((c) => !text.includes(`match /${c}/`));
  if (missing.length) throw new Error(`no rules for: ${missing.join(", ")}`);
  return required.join(", ");
});

check("Required source files exist", () => {
  const files = [
    "index.html",
    "src/main.jsx",
    "src/App.jsx",
    "src/firebase/config.js",
    "src/services/dataService.js",
    "src/services/matchingService.js",
    "src/services/serverlessEngine.js",
  ];
  files.forEach(exists);
  return `${files.length} files`;
});

check("Production build succeeds", () => {
  execSync("npx vite build", { cwd: root, stdio: "pipe" });
  exists("dist/index.html");
  return "dist/index.html generated";
});

let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
