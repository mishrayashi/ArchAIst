# ArchAIst — from zero to AI architect

*(Archaist + AI + architect — study the field, then architect data & AI systems.)*

<img src="assets/ym-logo.svg" alt="YM — Yashi Mishra" width="40" align="left" />

**Created by Yashi Mishra** — original idea, content, and build.

<br clear="left"/>

A complete, beginner-first learning + interview-prep tool for anyone who wants to
become a **Data Engineer, AI Data Engineer, GenAI Engineer, or LLM Engineer** —
starting from *absolutely zero* knowledge. It pairs an **interactive mind map** of
the whole syllabus with animated explainers and a built-in **code runner** (Python +
SQL, right in the browser).

It assumes you've never coded, never seen a database, and don't know what "AI" or
"LLM" even mean. It explains every term, shows real code, lays out step-by-step
roadmaps, and prepares you for real interviews at real companies.

---

## 🎬 See it in action

<p align="center">
  <img src="assets/demo.svg" alt="ArchAIst tour — explore the mind map, branch into a topic, open an interactive lesson" width="100%" />
</p>

<p align="center"><em>Explore the mind map → click a topic to branch into its lessons → open an interactive, in-depth lesson. All offline.</em></p>

> The clip above is an animated walkthrough. To capture a real screen recording,
> open the site (below) and record the home **mind map**, a topic expanding, and a
> lesson with one of the interactive widgets — then drop the file in `assets/` and
> swap the `src` above.

---

## ▶ How to open it (no installation needed)

**Just double-click `index.html`.** It opens in your web browser and works
completely offline. No Node, no Python, no internet, no account, no API key.

That's the whole setup. It runs on any modern browser (Chrome, Edge, Firefox, Safari).

> Tip: if copy-to-clipboard buttons don't work from `file://` in your browser,
> serve the folder locally instead: open a terminal in this folder and run
> `python -m http.server 8000`, then visit `http://localhost:8000`.

---

## ✏️ Editing content — the Python workflow

You **never edit HTML/CSS/JS** to change content. You edit plain text in `source/`
and run one Python command. The website's look, dark/light themes, animations, and
interactions are driven by separate runtime files that the build **never touches** —
so they always stay exactly as they are.

```bash
# 1. edit a lesson / question / term in source/  (Markdown + JSON)
# 2. regenerate the site:
python build.py
# 3. open index.html to preview
```

- **Lessons** are Markdown files: `source/<group>/NNNN_<id>.md` (with a small
  frontmatter header).
- **Interview questions / glossary** are JSON: `source/<group>/_questions.json`,
  `source/<group>/_glossary.json`.
- Full guide with examples: [`source/README.md`](source/README.md).

`build.py` uses **only the Python standard library** — no `pip install` needed.

### Safety net (prove nothing broke)
```bash
node tools/verify.js      # confirms the rebuilt site == the saved baseline
```
`build.py` regenerates `content/*.js`; everything else (the runtime) is untouched,
so behaviour can't drift. If you intentionally change content and want to lock in a
new baseline, run `node tools/migrate.js` after you're happy.

---

## 🌐 Deploy to GitHub Pages (free hosting)

The site is static, so GitHub Pages hosts it for free and it still works offline too.

1. Create a GitHub repo whose **root is this `launchpad-academy` folder** (so
   `index.html`, `build.py`, `.github/`, etc. sit at the repo root).
2. Push it (e.g. `git init && git add . && git commit -m "ArchAIst" && git branch -M main && git remote add origin <your-repo-url> && git push -u origin main`).
3. In the repo: **Settings → Pages → Source = "GitHub Actions"**.
4. Done. Every push runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
   which runs `python build.py` and publishes. Your site goes live at
   `https://<you>.github.io/<repo>/`.

> The included `.nojekyll` file tells GitHub to serve the `assets/` folders as-is.
> The **Code Runner** (Python + SQL) works on the hosted Pages URL and via
> `python -m http.server`; a raw `file://` double-click may block the WASM engines
> in some browsers.

---

## What's inside

| Section | What you get |
|---------|--------------|
| 🌱 **Foundations (Level 0)** | What is data, databases, programming, the cloud, and AI/ML/GenAI/LLM — explained for a complete beginner. |
| 🧭 **Which Role Is Right For Me?** | Crystal-clear difference between Data Engineer, AI Data Engineer, GenAI Engineer, LLM Engineer, ML Engineer, Data Scientist, Data Analyst — with day-to-day work, skills, and how they collaborate. |
| 🗺️ **Roadmaps & Study Plans** | Step-by-step paths (incl. a focused 90-day sprint) from zero to job-ready, plus *how* to learn effectively. |
| 🛠️ **Hands-On Modules** | Real code & concepts: Python, SQL (basic→advanced), Data Modeling + **SCD**, ETL/ELT, **Spark/PySpark**, Cloud (AWS/Azure/GCP), Airflow orchestration, Warehouses/Lakehouse, Kafka streaming, and **GenAI/RAG/LLMs**. |
| 🏛️ **Core Concepts & System Design** | **HLD vs LLD**, ACID, CAP theorem, data quality & governance, file formats (Parquet etc.) — the deep stuff even seniors fumble. |
| 💬 **Interview Question Bank** | 100+ curated Q&A with model answers, filterable by topic, difficulty, role, and company. |
| 🏢 **Company-wise Prep** | Representative questions for 20 top companies: Walmart, JPMorgan Chase, Infosys, TCS, Accenture, Cognizant, Capgemini, Deloitte, PwC, KPMG, EY, Amazon, Microsoft, Google, Meta, Goldman Sachs, Wipro, Flipkart, Netflix, Uber. |
| 📖 **Plain-English Glossary** | ~90 terms, each explained as if you've never heard it. |
| 📊 **My Progress** | Mark lessons complete; progress saves in your browser (localStorage). |

Plus: global search (press `/`), light/dark theme, fully responsive (works on phones), and printable pages.

---

## How to study (the intended path)

1. **Foundations** → understand the words and the big picture.
2. **Which Role Is Right For Me?** → pick a direction.
3. **Roadmaps** → choose your plan.
4. **Hands-On Modules** → learn the tools and write the code yourself.
5. **Core Concepts** → master the interview-heavy theory.
6. **Interview Bank + Company prep** → drill daily, answer out loud first.

---

## Project structure

```
launchpad-academy/
├── index.html              # app shell (runtime — do not edit for content)
├── build.py                # ← run this to regenerate the site from source/
├── assets/                 # runtime — NEVER touched by the build
│   ├── css/styles.css      #   design system (light/dark, responsive)
│   └── js/                 #   md, icons, registry, widgets, runner, app
├── source/                 # ★ YOU EDIT HERE (Markdown + JSON). See source/README.md
│   ├── _manifest.json      #   load order of content groups
│   └── <group>/            #   *.md lessons, _questions.json, _glossary.json, _section.json
├── content/                # AUTO-GENERATED by build.py — do not hand-edit
├── tools/                  # migrate.js (one-time), verify.js (parity check) — Node, optional
└── .github/workflows/      # GitHub Pages deploy
```

### How to add or edit content

> **Edit `source/` and run `python build.py`.** Do **not** edit `content/*.js` by
> hand — they are regenerated and your edits will be overwritten. Full guide with
> copy-paste examples: **[`source/README.md`](source/README.md)**.

- **New lesson** → add `source/<group>/NNNN_<id>.md` (frontmatter + Markdown body).
- **Interview question** → add an entry to a `source/<group>/_questions.json` array
  (`q`, `a`, `topic`, `difficulty`, `companies[]`, `roles[]`). A new company name
  appears in the Company-wise page and filters automatically.
- **Glossary term** → add `{ "term": "...", "def": "... [[Another Term]] ..." }` to
  `source/glossary/_glossary.json`.

Then `python build.py` and refresh `index.html`.

> `tools/verify.js` and `tools/migrate.js` are **optional Node helpers** (parity
> check / one-time migration). Normal authoring needs **only Python** — `build.py`
> uses the standard library, no `pip install`.

---

## A note on the company interview questions

The company-specific questions are **representative practice sets** — compiled from
commonly reported interview patterns for data/AI engineering roles at each company.
They are **not** a leaked or guaranteed list. Use them as high-yield preparation:
the *types* of questions and the reasoning they expect are what matter.

---

## Design principles

- **Zero assumptions.** Every term is defined; jargon is always explained in plain
  English first, then named.
- **Build > watch.** Lessons push you to type and run code yourself.
- **Honest.** No false promises about salaries or timelines; ranges are directional.
- **Offline & private.** No backend, no tracking, no accounts. Everything stays in
  your browser.

Built to take *anyone* — class-8 student or 35-year-old career switcher — from zero
to job-ready. Good luck. You've got this. 🚀

---

## Created by

<img src="assets/ym-logo.svg" alt="YM — Yashi Mishra" width="56" align="left" />

**Yashi Mishra** — original idea, content, and build of **ArchAIst**.
The **YM** monogram is Yashi Mishra's mark.

<br clear="left"/>
