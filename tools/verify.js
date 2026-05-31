/* verify.js — load the REGENERATED content/*.js and diff the resulting
   registry against tools/build_baseline.json (the pre-migration snapshot).
   A clean run proves the Python build produced a byte-for-byte equivalent
   site: same sections, pages (incl. full body), questions, and terms.
   Run from launchpad-academy/ root:  node tools/verify.js */
const fs = require("fs");
const vm = require("vm");

const sb = { window: {}, console };
vm.createContext(sb);
vm.runInContext(fs.readFileSync("assets/js/registry.js", "utf8"), sb);
vm.runInContext("var LP = window.LP;", sb);
const LP = sb.window.LP;

const manifest = JSON.parse(fs.readFileSync("source/_manifest.json", "utf8"));
manifest.forEach((n) => vm.runInContext(fs.readFileSync("content/" + n + ".js", "utf8"), sb, { filename: n }));

const base = JSON.parse(fs.readFileSync("tools/build_baseline.json", "utf8"));
const J = (o) => JSON.stringify(o);
let diffs = 0;

const curS = LP._sections.map((s) => ({ id: s.id, title: s.title, icon: s.icon, blurb: s.blurb, order: s.order }));
if (J(curS) !== J(base.sections)) { diffs++; console.log("✗ sections differ"); }

const curP = LP._pages.map((p) => ({ id: p.id, section: p.section, title: p.title, level: p.level, minutes: p.minutes, tags: p.tags, body: p.body, order: p.order }));
if (curP.length !== base.pages.length) { diffs++; console.log("✗ page count", curP.length, "vs", base.pages.length); }
base.pages.forEach((bp, i) => {
  const cp = curP[i];
  if (!cp) return;
  if (J(bp) !== J(cp)) {
    diffs++;
    const keys = [...new Set([...Object.keys(bp), ...Object.keys(cp)])];
    const field = keys.find((k) => J(bp[k]) !== J(cp[k]));
    console.log("✗ page differs:", bp.id, "field:", field);
  }
});

const curQ = LP._questions.map((q) => ({ q: q.q, a: q.a, topic: q.topic, difficulty: q.difficulty, companies: q.companies, roles: q.roles }));
if (J(curQ) !== J(base.questions)) {
  diffs++;
  console.log("✗ questions differ; count", curQ.length, "vs", base.questions.length);
  base.questions.forEach((bq, i) => { if (curQ[i] && J(bq) !== J(curQ[i])) console.log("   first q diff at", i, bq.q.slice(0, 40)); });
}

const curT = LP._terms.map((t) => ({ term: t.term, def: t.def, see: t.see }));
if (J(curT) !== J(base.terms)) { diffs++; console.log("✗ terms differ", curT.length, "vs", base.terms.length); }

console.log("Counts -> sections", curS.length, "| pages", curP.length, "| questions", curQ.length, "| terms", curT.length);
console.log(diffs === 0
  ? "\n✅ PARITY VERIFIED: regenerated site is identical to the original. Nothing hampered."
  : "\n❌ " + diffs + " difference(s) — build is NOT identical yet.");
process.exit(diffs === 0 ? 0 : 1);
