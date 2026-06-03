/* migrate.js — ONE-TIME migration: parse the current hand-written
   content/*.js and emit editable source/ files (Markdown + JSON),
   plus tools/build_baseline.json (a faithful registry snapshot used
   to verify the Python build regenerates an identical site).

   Run from the launchpad-academy/ root:  node tools/migrate.js
   This is programmatic (not hand/LLM) extraction, so it's exact. */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const sb = { window: {}, console };
vm.createContext(sb);
vm.runInContext(fs.readFileSync("assets/js/registry.js", "utf8"), sb);
vm.runInContext("var LP = window.LP;", sb); // expose LP as a global like the browser does
const LP = sb.window.LP;

const SRC = "source";

// content files in the SAME order index.html includes them. Prefer the
// existing manifest (so newly-added groups like a new section survive a
// re-lock); fall back to the original hardcoded order on first migration.
const DEFAULT_FILES = [
  "foundations", "roles", "roadmaps", "role-tracks",
  "module-python", "module-sql", "module-data-modeling", "module-etl",
  "module-spark", "module-cloud", "module-orchestration", "module-warehouse",
  "module-streaming", "module-genai", "concepts", "concepts-extra",
  "glossary", "interview-questions", "companies", "companies-extra",
];
let FILES = DEFAULT_FILES;
try {
  const m = JSON.parse(fs.readFileSync(path.join(SRC, "_manifest.json"), "utf8"));
  if (Array.isArray(m) && m.length) FILES = m;     // read BEFORE we wipe source/
} catch (e) { /* first run — no manifest yet */ }
// only keep groups that actually have a compiled content/<name>.js
FILES = FILES.filter((n) => fs.existsSync("content/" + n + ".js"));

fs.rmSync(SRC, { recursive: true, force: true });
fs.mkdirSync(SRC, { recursive: true });
fs.mkdirSync("tools", { recursive: true });

const pad = (n) => String(n * 10).padStart(4, "0");
const manifest = [];

FILES.forEach((name) => {
  const before = { p: LP._pages.length, s: LP._sections.length, q: LP._questions.length, t: LP._terms.length };
  vm.runInContext(fs.readFileSync("content/" + name + ".js", "utf8"), sb, { filename: name });

  const newSections = LP._sections.slice(before.s).map((s) => ({ id: s.id, title: s.title, icon: s.icon, blurb: s.blurb }));
  const newPages = LP._pages.slice(before.p);
  const newQ = LP._questions.slice(before.q).map((q) => ({ q: q.q, a: q.a, topic: q.topic, difficulty: q.difficulty, companies: q.companies, roles: q.roles }));
  const newT = LP._terms.slice(before.t).map((t) => ({ term: t.term, def: t.def, see: t.see }));

  const dir = path.join(SRC, name);
  fs.mkdirSync(dir, { recursive: true });
  if (newSections.length) fs.writeFileSync(path.join(dir, "_section.json"), JSON.stringify(newSections, null, 2));
  newPages.forEach((p, i) => {
    const fm = [
      "id: " + p.id,
      "section: " + p.section,
      "title: " + p.title,
      "level: " + p.level,
      "minutes: " + p.minutes,
      "tags: " + (p.tags || []).join(", "),
    ].join("\n");
    const file = "---\n" + fm + "\n---\n" + p.body;
    fs.writeFileSync(path.join(dir, pad(i) + "_" + p.id + ".md"), file);
  });
  if (newQ.length) fs.writeFileSync(path.join(dir, "_questions.json"), JSON.stringify(newQ, null, 2));
  if (newT.length) fs.writeFileSync(path.join(dir, "_glossary.json"), JSON.stringify(newT, null, 2));
  manifest.push(name);
});

fs.writeFileSync(path.join(SRC, "_manifest.json"), JSON.stringify(manifest, null, 2));

const baseline = {
  sections: LP._sections.map((s) => ({ id: s.id, title: s.title, icon: s.icon, blurb: s.blurb, order: s.order })),
  pages: LP._pages.map((p) => ({ id: p.id, section: p.section, title: p.title, level: p.level, minutes: p.minutes, tags: p.tags, body: p.body, order: p.order })),
  questions: LP._questions.map((q) => ({ q: q.q, a: q.a, topic: q.topic, difficulty: q.difficulty, companies: q.companies, roles: q.roles })),
  terms: LP._terms.map((t) => ({ term: t.term, def: t.def, see: t.see })),
};
fs.writeFileSync("tools/build_baseline.json", JSON.stringify(baseline));

console.log("Extracted " + manifest.length + " files -> source/");
console.log("  pages:", LP._pages.length, "questions:", LP._questions.length, "terms:", LP._terms.length, "sections:", LP._sections.length);
