/* ===========================================================
   app.js — router, navigation, rendering, search, progress.
   v2: accordion nav, SVG icons, auto-completion via scroll,
   reading progress, page transitions, scroll-reveal, widgets.
   =========================================================== */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const ic = (name, cls) => (window.icon ? window.icon(name, cls) : "");
  const icKey = (key, cls) => (window.iconForKey ? window.iconForKey(key, cls) : "");

  /* ---------- state ---------- */
  const PROG_KEY = "lp.progress.v1";
  const THEME_KEY = "lp.theme.v1";
  const progress = JSON.parse(localStorage.getItem(PROG_KEY) || "{}");
  const saveProgress = () => localStorage.setItem(PROG_KEY, JSON.stringify(progress));

  let pageState = { id: null, start: 0, done: false };
  let autoTimer = null;
  let revealObs = null;

  /* ---------- theme ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    $("#themeToggle").innerHTML = ic(t === "dark" ? "sun" : "moon");
    localStorage.setItem(THEME_KEY, t);
  }
  applyTheme(localStorage.getItem(THEME_KEY) || "dark");
  $("#themeToggle").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    applyTheme(cur === "dark" ? "light" : "dark");
  });

  /* ---------- util sections in nav ---------- */
  const UTIL = [
    { id: "interview", title: "Interview Bank" },
    { id: "companies", title: "Company-wise Prep" },
    { id: "glossary", title: "Glossary" },
    { id: "progress", title: "My Progress" },
  ];

  /* ---------- sidebar nav (accordion) ---------- */
  function buildNav() {
    const nav = $("#nav");
    nav.innerHTML = "";

    const home = el("a", "nav-home", ic("home") + "<span>Home</span>");
    home.href = "#/home";
    home.dataset.route = "home";
    nav.appendChild(home);

    LP.getSections().forEach((sec) => {
      const pages = LP.getPages(sec.id);
      if (!pages.length) return;
      const group = el("div", "nav-group");
      group.dataset.sid = sec.id;
      const title = el("button", "nav-group-title",
        '<span class="nav-ic">' + icKey(sec.id) + "</span><span>" + sec.title + '</span>' + ic("chevronRight", "ic-sm"));
      title.querySelector(".ic:last-child").classList.add("chev");
      title.addEventListener("click", () => toggleGroup(group));
      const items = el("div", "nav-items");
      const inner = el("div");
      pages.forEach((p) => {
        const a = el("a", "nav-link", "<span>" + p.title + "</span>");
        a.href = "#/page/" + p.id;
        a.dataset.pageid = p.id;
        if (progress[p.id]) a.classList.add("done");
        inner.appendChild(a);
      });
      items.appendChild(inner);
      group.appendChild(title);
      group.appendChild(items);
      nav.appendChild(group);
    });

    // utility group
    const ug = el("div", "nav-group");
    const ut = el("button", "nav-group-title",
      '<span class="nav-ic">' + ic("target") + "</span><span>Interview &amp; Reference</span>" + ic("chevronRight", "ic-sm"));
    ut.querySelector(".ic:last-child").classList.add("chev");
    ut.addEventListener("click", () => toggleGroup(ug));
    const ui = el("div", "nav-items");
    const uinner = el("div");
    UTIL.forEach((u) => {
      const a = el("a", "nav-link", '<span style="display:flex;align-items:center;gap:8px">' + icKey(u.id, "ic-sm") + " " + u.title + "</span>");
      a.href = "#/" + u.id;
      a.dataset.route = u.id;
      uinner.appendChild(a);
    });
    ui.appendChild(uinner);
    ug.appendChild(ut);
    ug.appendChild(ui);
    ug.dataset.sid = "__util";
    nav.appendChild(ug);
  }

  function toggleGroup(group) {
    const wasOpen = group.classList.contains("open");
    document.querySelectorAll(".nav-group").forEach((g) => g.classList.remove("open"));
    if (!wasOpen) group.classList.add("open");
  }
  function openGroup(group) {
    document.querySelectorAll(".nav-group").forEach((g) => g.classList.remove("open"));
    if (group) group.classList.add("open");
  }

  function updateProgressUI() {
    const total = LP._pages.length || 1;
    const done = Object.keys(progress).filter((k) => progress[k]).length;
    const pct = Math.round((done / total) * 100);
    $("#globalProgressFill").style.width = pct + "%";
    $("#globalProgressNum").textContent = pct + "% · " + done + "/" + total + " lessons";
    document.querySelectorAll(".nav-link[data-pageid]").forEach((a) => {
      a.classList.toggle("done", !!progress[a.dataset.pageid]);
    });
  }

  function setActiveNav(route) {
    document.querySelectorAll(".nav-link, .nav-home").forEach((a) => a.classList.remove("active"));
    if (route.type === "page") {
      const a = document.querySelector('.nav-link[data-pageid="' + route.id + '"]');
      if (a) {
        a.classList.add("active");
        openGroup(a.closest(".nav-group"));
      }
    } else if (route.type === "home") {
      const h = document.querySelector('.nav-home');
      if (h) h.classList.add("active");
      openGroup(null);
    } else {
      const a = document.querySelector('.nav-link[data-route="' + route.type + '"]');
      if (a) { a.classList.add("active"); openGroup(a.closest(".nav-group")); }
    }
  }

  /* ---------- renderers ---------- */
  const view = $("#view");
  const levelBadgeClass = (level) => (/zero/i.test(level) ? "badge-level badge-zero" : "badge-level");

  function renderHome() {
    const sections = LP.getSections();
    const totalLessons = LP._pages.length;
    const totalQs = LP._questions.length;
    const totalTerms = LP._terms.length;
    const companies = uniqueCompanies().length;

    const cards = sections.map((s) => {
      const n = LP.getPages(s.id).length;
      if (!n) return "";
      const first = LP.getPages(s.id)[0];
      return '<a class="card" href="#/page/' + first.id + '">' +
        '<div class="card-icon">' + icKey(s.id) + "</div>" +
        '<div class="card-title">' + s.title + "</div>" +
        '<div class="card-desc">' + (s.blurb || "") + "</div>" +
        '<div class="card-count">' + ic("chevronRight", "ic-sm") + n + " lesson" + (n > 1 ? "s" : "") + "</div></a>";
    }).join("");

    view.innerHTML =
      '<div class="hero">' +
        '<p class="hero-kicker"><span class="dot"></span>DATA · AI · GENAI ENGINEERING</p>' +
        '<h1>From <span class="grad">zero</span> to<br>Data &amp; GenAI Engineer</h1>' +
        '<p class="lead">No background needed. We explain every term, show the code, and prep you for real interviews — all hands-on.</p>' +
        '<div class="hero-cta">' +
          '<a class="btn btn-primary" href="#/page/welcome">Let\'s Dive in ' + ic("arrowRight", "ic-sm") + "</a>" +
          '<a class="btn btn-ghost" href="#/page/roles-overview">' + ic("compass", "ic-sm") + " Find my role</a>" +
        "</div>" +
        '<div class="stat-row">' +
          '<div class="stat"><div class="num">' + totalLessons + '</div><div class="lbl">Lessons</div></div>' +
          '<div class="stat"><div class="num">' + totalQs + '</div><div class="lbl">Interview Qs</div></div>' +
          '<div class="stat"><div class="num">' + companies + '</div><div class="lbl">Companies</div></div>' +
          '<div class="stat"><div class="num">' + totalTerms + '</div><div class="lbl">Glossary terms</div></div>' +
        "</div>" +
      "</div>" +
      // compact orientation strip — replaces the old wall-of-text callout
      '<nav class="pathway" aria-label="Suggested order">' +
        '<span class="pw-step"><span class="pw-n">1</span>Foundations</span>' +
        '<span class="pw-arrow">' + ic("arrowRight", "ic-sm") + "</span>" +
        '<span class="pw-step"><span class="pw-n">2</span>Find your role</span>' +
        '<span class="pw-arrow">' + ic("arrowRight", "ic-sm") + "</span>" +
        '<span class="pw-step"><span class="pw-n">3</span>Roadmap</span>' +
        '<span class="pw-arrow">' + ic("arrowRight", "ic-sm") + "</span>" +
        '<span class="pw-step"><span class="pw-n">4</span>Modules</span>' +
        '<span class="pw-arrow">' + ic("arrowRight", "ic-sm") + "</span>" +
        '<span class="pw-step"><span class="pw-n">5</span>Interview prep</span>' +
      "</nav>" +
      '<section class="map-section map-section-lead">' +
        '<div class="map-head"><h2>' + ic("network", "ic-sm") + ' Explore the map</h2>' +
        '<p>The whole academy as one living map. Drag to roam, scroll to zoom, click a topic to branch into its lessons — then open any lesson.</p></div>' +
        '<div id="mindmapHost" class="mindmap-host"></div>' +
      "</section>" +
      "<h2>Explore the academy</h2>" +
      '<div class="card-grid">' + cards + "</div>" +
      "<h2>Interview &amp; reference</h2>" +
      '<div class="card-grid">' +
        '<a class="card" href="#/interview"><div class="card-icon">' + icKey("interview") + '</div><div class="card-title">Interview Question Bank</div><div class="card-desc">Filter by topic, difficulty, role and company.</div><div class="card-count">' + ic("chevronRight","ic-sm") + totalQs + " questions</div></a>" +
        '<a class="card" href="#/companies"><div class="card-icon">' + icKey("companies") + '</div><div class="card-title">Company-wise Prep</div><div class="card-desc">What Walmart, JPMC, Infosys &amp; more actually ask.</div><div class="card-count">' + ic("chevronRight","ic-sm") + companies + " companies</div></a>" +
        '<a class="card" href="#/glossary"><div class="card-icon">' + icKey("glossary") + '</div><div class="card-title">Plain-English Glossary</div><div class="card-desc">Every scary term, explained simply.</div><div class="card-count">' + ic("chevronRight","ic-sm") + totalTerms + " terms</div></a>" +
        '<a class="card" href="#/progress"><div class="card-icon">' + icKey("progress") + '</div><div class="card-title">My Progress</div><div class="card-desc">Track lessons completed across the academy.</div><div class="card-count">' + ic("chevronRight","ic-sm") + totalLessons + " lessons total</div></a>" +
      "</div>";

    const mapHost = view.querySelector("#mindmapHost");
    if (mapHost && window.ArchMap) window.ArchMap.render(mapHost);
  }

  let _ordered = null;
  function allPagesOrdered() {
    if (_ordered) return _ordered;
    _ordered = [];
    LP.getSections().forEach((s) => LP.getPages(s.id).forEach((pg) => _ordered.push(pg)));
    return _ordered;
  }
  function navLink(pg, dir) {
    const secT = (LP._sectionMap[pg.section] || {}).title || "";
    const arrow = dir === "next" ? ic("arrowRight", "ic-sm") : ic("arrowLeft", "ic-sm");
    const lbl = dir === "next" ? "Next" : "Previous";
    const inner = '<span class="pn-text"><small>' + lbl + " · " + secT + "</small>" + trim(pg.title, 26) + "</span>";
    return '<a class="pn pn-' + dir + '" href="#/page/' + pg.id + '">' + (dir === "prev" ? arrow + inner : inner + arrow) + "</a>";
  }
  function buildToc(body) {
    const items = [];
    body.split("\n").forEach((l) => {
      const m = l.match(/^##\s+(.+)$/);
      if (m) {
        const t = m[1].trim();
        const idv = t.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
        items.push({ t: t.replace(/[*`_]/g, ""), id: idv });
      }
    });
    if (items.length < 3) return "";
    return '<nav class="page-toc"><span class="toc-label">' + ic("grid", "ic-sm") + " On this page</span><div class=\"toc-links\">" +
      items.map((i) => '<a class="toc-link" data-id="' + i.id + '">' + i.t + "</a>").join("") + "</div></nav>";
  }

  // Roadmap / career-path pages render as a visual phase-timeline instead of
  // a flat wall of headings + bullets. Each "## ..." block becomes a milestone
  // card on a connected timeline; "→ *X module*" references become chips.
  function roadmapHtml(body) {
    const lines = body.split("\n");
    const intro = [];
    const phases = [];
    let cur = null;
    lines.forEach((ln) => {
      const m = ln.match(/^##\s+(.+?)\s*$/);
      if (m) { cur = { heading: m[1].trim(), body: [] }; phases.push(cur); }
      else if (cur) cur.body.push(ln);
      else intro.push(ln);
    });
    if (!phases.length) return mdToHtml(body);

    const introTxt = intro.join("\n").trim();
    const introHtml = introTxt ? '<div class="rm-intro">' + mdToHtml(introTxt) + "</div>" : "";

    const toChips = (h) => h
      .replace(/→\s*<em>(.*?)<\/em>/g, '<span class="rm-chip">' + ic("arrowRight", "ic-sm") + "$1</span>")
      .replace(/→\s*<strong>(.*?)<\/strong>/g, '<span class="rm-chip">' + ic("arrowRight", "ic-sm") + "$1</span>");

    const cards = phases.map((ph, i) => {
      let title = ph.heading, badge = "", kicker = "Step " + (i + 1);
      const pm = title.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
      if (pm) { title = pm[1].trim(); badge = pm[2].trim(); }
      const fm = title.match(/^Phase\s+\d+\s*[—–-]\s*(.+)$/i);
      if (fm) { kicker = "Phase " + (i + 1); title = fm[1].trim(); }
      const bodyHtml = toChips(mdToHtml(ph.body.join("\n")));
      return '<div class="rm-phase">' +
        '<div class="rm-node">' + (i + 1) + "</div>" +
        '<div class="rm-card">' +
          '<div class="rm-phase-head">' +
            '<span class="rm-kicker">' + kicker + "</span>" +
            "<h2>" + title + "</h2>" +
            (badge ? '<span class="rm-weeks">' + badge + "</span>" : "") +
          "</div>" +
          '<div class="rm-phase-body">' + bodyHtml + "</div>" +
        "</div></div>";
    }).join("");

    return introHtml + '<div class="rm-timeline">' + cards + "</div>";
  }

  // Let content reference the site's SVG icon set via a placeholder, e.g.
  // <i data-ic="book"></i> or <i data-ic="arrowRight" class="ic-sm"></i>.
  // Keeps visual cards/diagrams in markdown clean instead of inline SVG.
  function expandIcons(html) {
    return html.replace(/<i\s+data-ic="([\w-]+)"(?:\s+class="([^"]*)")?\s*><\/i>/g,
      function (m, name, cls) { return ic(name, cls || ""); });
  }

  function renderPage(id) {
    const p = LP.getPage(id);
    if (!p) return renderNotFound();
    const sec = LP._sectionMap[p.section] || {};
    const ordered = allPagesOrdered();
    const gidx = ordered.findIndex((x) => x.id === id);
    const prev = ordered[gidx - 1];
    const next = ordered[gidx + 1];
    const isDone = !!progress[id];
    const isRoadmap = (p.section === "roadmaps" || p.section === "role-tracks");
    const toc = isRoadmap ? "" : buildToc(p.body);

    view.innerHTML =
      '<div class="page-head"><div class="page-head-main">' +
        '<div class="page-kicker">' + icKey(p.section, "ic-sm") + " " + (sec.title || "") + "</div>" +
        "<h1>" + p.title + "</h1>" +
        '<div class="page-meta">' +
          '<span class="badge ' + levelBadgeClass(p.level) + '">' + p.level + "</span>" +
          '<span class="badge">' + ic("clock", "ic-sm") + " " + p.minutes + " min</span>" +
          p.tags.map((t) => '<span class="badge">' + t + "</span>").join("") +
        "</div></div>" +
        ringHtml(isDone) +
      "</div>" +
      toc +
      '<div class="page-body">' + expandIcons(isRoadmap ? roadmapHtml(p.body) : mdToHtml(p.body)) + "</div>" +
      '<div class="complete-bar">' +
        '<div class="complete-state' + (isDone ? " is-done" : "") + '" id="completeState">' +
          (isDone ? ic("check", "ic-sm") + " Completed" : "Reading… auto-completes when you reach the end") +
        "</div>" +
        '<div class="page-nav-links">' +
          (prev ? navLink(prev, "prev") : "") +
          (next ? navLink(next, "next") : "") +
        "</div>" +
      "</div>";

    pageState = { id: id, start: Date.now(), done: isDone };
    // ring + state click = manual toggle
    const ring = $("#ringWrap");
    if (ring) ring.addEventListener("click", () => toggleComplete(id));
    const st = $("#completeState");
    if (st) st.addEventListener("click", () => toggleComplete(id));
    // TOC clicks scroll to heading (no hash change, account for sticky topbar)
    view.querySelectorAll(".toc-link").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      const elx = document.getElementById(a.dataset.id);
      if (elx) window.scrollTo({ top: elx.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    }));

    // auto-complete fallback for short pages that don't need scrolling
    if (autoTimer) clearTimeout(autoTimer);
    autoTimer = setTimeout(() => {
      if (!pageState.done && pageState.id === id && readingProgress() >= 0.85) markComplete(id);
    }, 6500);
  }

  function ringHtml(done) {
    const r = 24, C = 2 * Math.PI * r;
    return '<div class="ring-wrap' + (done ? " done" : "") + '" id="ringWrap" title="Auto-completes as you read · click to toggle">' +
      '<svg viewBox="0 0 58 58"><circle class="ring-bg" cx="29" cy="29" r="' + r + '" stroke-width="5" fill="none"/>' +
      '<circle class="ring-fg" cx="29" cy="29" r="' + r + '" stroke-width="5" fill="none" stroke-linecap="round" ' +
      'stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (done ? 0 : C).toFixed(1) + '"/></svg>' +
      '<div class="ring-label" id="ringLabel">' + (done ? ic("check", "ic-sm") : "0%") + "</div></div>";
  }

  function updateRing(p) {
    const fg = $(".ring-fg"); const label = $("#ringLabel"); const wrap = $("#ringWrap");
    if (!fg || !wrap) return;
    const r = 24, C = 2 * Math.PI * r;
    fg.setAttribute("stroke-dashoffset", (C * (1 - p)).toFixed(1));
    if (!wrap.classList.contains("done") && label) label.textContent = Math.round(p * 100) + "%";
  }

  function markComplete(id) {
    progress[id] = true; saveProgress(); pageState.done = true;
    updateProgressUI();
    const wrap = $("#ringWrap"); const label = $("#ringLabel"); const st = $("#completeState");
    if (wrap) { wrap.classList.add("done"); const fg = $(".ring-fg"); if (fg) fg.setAttribute("stroke-dashoffset", "0"); }
    if (label) label.innerHTML = ic("check", "ic-sm");
    if (st) { st.classList.add("is-done"); st.innerHTML = ic("check", "ic-sm") + " Completed"; }
  }
  function unmarkComplete(id) {
    delete progress[id]; saveProgress(); pageState.done = false;
    updateProgressUI();
    const wrap = $("#ringWrap"); const label = $("#ringLabel"); const st = $("#completeState");
    if (wrap) wrap.classList.remove("done");
    if (st) { st.classList.remove("is-done"); st.innerHTML = "Reading… auto-completes when you reach the end"; }
    updateRing(readingProgress());
  }
  function toggleComplete(id) { progress[id] ? unmarkComplete(id) : markComplete(id); }

  function trim(s, n) { n = n || 20; return s.length > n ? s.slice(0, n - 2) + "…" : s; }
  function renderNotFound() {
    pageState = { id: null, start: 0, done: false };
    view.innerHTML = "<h1>Page not found</h1><p>That link doesn't exist. <a href=\"#/home\">Go home " + ic("arrowRight", "ic-sm") + "</a></p>";
  }

  /* ---------- interview / companies / glossary / progress ---------- */
  function uniqueCompanies() { const s = new Set(); LP._questions.forEach((q) => q.companies.forEach((c) => s.add(c))); return [...s].sort(); }
  function uniqueTopics() { const s = new Set(); LP._questions.forEach((q) => s.add(q.topic)); return [...s].sort(); }
  function uniqueRoles() { const s = new Set(); LP._questions.forEach((q) => q.roles.forEach((r) => s.add(r))); return [...s].sort(); }
  const escapeText = (s) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function qaHtml(q) {
    const diff = (q.difficulty || "medium").toLowerCase();
    const tags = ['<span class="q-tag">' + q.topic + "</span>", '<span class="q-tag diff-' + diff + '">' + diff + "</span>"];
    q.companies.forEach((c) => tags.push('<span class="q-tag q-company">' + c + "</span>"));
    return '<details class="qa"><summary><span class="q-toggle">' + ic("chevronRight", "ic-sm") + '</span><span class="q-text">' +
      escapeText(q.q) + '<span class="q-tags">' + tags.join("") + "</span></span></summary>" +
      '<div class="q-answer">' + mdToHtml(q.a) + "</div></details>";
  }

  function renderInterview(params) {
    const companies = uniqueCompanies(), topics = uniqueTopics(), roles = uniqueRoles();
    const preCompany = params.get("company") || "", preTopic = params.get("topic") || "";
    view.innerHTML =
      '<div class="page-head"><div class="page-head-main"><div class="page-kicker">' + icKey("interview", "ic-sm") + " Interview Prep</div>" +
      "<h1>Interview Question Bank</h1><p>" + LP._questions.length + " curated questions with model answers. Click a question to reveal the answer; filter by what you're prepping for.</p></div></div>" +
      '<div class="filters">' +
        '<div class="filter-group"><label>Search</label><input type="search" id="ibSearch" placeholder="keyword…"></div>' +
        '<div class="filter-group"><label>Topic</label><select id="ibTopic"><option value="">All topics</option>' + topics.map((t) => '<option ' + (t === preTopic ? "selected" : "") + ">" + t + "</option>").join("") + "</select></div>" +
        '<div class="filter-group"><label>Company</label><select id="ibCompany"><option value="">All companies</option>' + companies.map((c) => '<option ' + (c === preCompany ? "selected" : "") + ">" + c + "</option>").join("") + "</select></div>" +
        '<div class="filter-group"><label>Role</label><select id="ibRole"><option value="">All roles</option>' + roles.map((r) => "<option>" + r + "</option>").join("") + "</select></div>" +
        '<div class="filter-group"><label>Difficulty</label><select id="ibDiff"><option value="">Any</option><option>easy</option><option>medium</option><option>hard</option></select></div>' +
      "</div><div class=\"q-count\" id=\"ibCount\"></div><div id=\"ibList\"></div>";

    function apply() {
      const kw = $("#ibSearch").value.toLowerCase().trim();
      const topic = $("#ibTopic").value, company = $("#ibCompany").value, role = $("#ibRole").value, diff = $("#ibDiff").value;
      const filtered = LP._questions.filter((q) => {
        if (topic && q.topic !== topic) return false;
        if (company && !q.companies.includes(company)) return false;
        if (role && !q.roles.includes(role)) return false;
        if (diff && (q.difficulty || "medium").toLowerCase() !== diff) return false;
        if (kw && !(q.q.toLowerCase().includes(kw) || q.a.toLowerCase().includes(kw))) return false;
        return true;
      });
      $("#ibCount").textContent = "Showing " + filtered.length + " question" + (filtered.length === 1 ? "" : "s");
      $("#ibList").innerHTML = filtered.map(qaHtml).join("") || '<p class="search-empty">No questions match those filters.</p>';
      wireCopyButtons();
    }
    ["ibSearch", "ibTopic", "ibCompany", "ibRole", "ibDiff"].forEach((idd) => $("#" + idd).addEventListener("input", apply));
    apply();
  }

  function renderCompanies() {
    const companies = uniqueCompanies(), counts = {};
    companies.forEach((c) => (counts[c] = 0));
    LP._questions.forEach((q) => q.companies.forEach((c) => counts[c]++));
    view.innerHTML =
      '<div class="page-head"><div class="page-head-main"><div class="page-kicker">' + icKey("companies", "ic-sm") + " Interview Prep</div>" +
      "<h1>Company-wise Preparation</h1><p>These questions are <strong>representative</strong> — compiled from commonly reported interview patterns for each company's data / AI engineering roles. Treat them as a high-yield practice set, not a leaked list.</p></div></div>" +
      '<div class="company-grid">' + companies.map((c) =>
        '<a class="company-card" href="#/interview?company=' + encodeURIComponent(c) + '"><span class="cc-name">' + c + '</span><span class="cc-count">' + counts[c] + " question" + (counts[c] === 1 ? "" : "s") + "</span></a>").join("") + "</div>" +
      '<div class="callout callout-tip"><span class="cfor"></span><div><span class="ctitle">How to use this:</span> pick your target company, read each question, answer out loud first, <em>then</em> open the model answer. Most companies reuse ~70% of questions across candidates for the same role.</div></div>';
  }

  function renderGlossary() {
    const terms = LP.getTerms(), byLetter = {};
    terms.forEach((t) => { const L = t.term[0].toUpperCase(); (byLetter[L] = byLetter[L] || []).push(t); });
    let html = '<div class="page-head"><div class="page-head-main"><div class="page-kicker">' + icKey("glossary", "ic-sm") + " Reference</div>" +
      "<h1>Plain-English Glossary</h1><p>Every term explained as if you've never heard it. " + terms.length + " entries.</p></div></div>" +
      '<div class="filter-group" style="margin:0 0 18px"><input type="search" id="glSearch" placeholder="Search terms…" style="width:100%;padding:11px 13px;border:1px solid var(--border);border-radius:11px;background:var(--surface-2);color:var(--text);font-family:inherit"></div><div id="glList">';
    Object.keys(byLetter).sort().forEach((L) => {
      html += '<div class="glossary-block"><div class="glossary-letter">' + L + "</div><dl>";
      byLetter[L].forEach((t) => {
        const see = t.see && t.see.length ? ' <em style="color:var(--text-faint)">See also: ' + t.see.join(", ") + "</em>" : "";
        html += '<div class="glossary-term" data-term="' + (t.term + " " + t.def).toLowerCase() + '"><dt>' + t.term + "</dt><dd>" + mdToHtml(t.def).replace(/^<p>|<\/p>$/g, "") + see + "</dd></div>";
      });
      html += "</dl></div>";
    });
    html += "</div>";
    view.innerHTML = html;
    $("#glSearch").addEventListener("input", (e) => {
      const kw = e.target.value.toLowerCase().trim();
      document.querySelectorAll(".glossary-term").forEach((n) => { n.style.display = !kw || n.dataset.term.includes(kw) ? "" : "none"; });
      document.querySelectorAll(".glossary-block").forEach((b) => {
        const any = [...b.querySelectorAll(".glossary-term")].some((n) => n.style.display !== "none");
        b.style.display = any ? "" : "none";
      });
    });
  }

  function renderProgressDash() {
    const sections = LP.getSections();
    let html = '<div class="page-head"><div class="page-head-main"><div class="page-kicker">' + icKey("progress", "ic-sm") + " Reference</div>" +
      "<h1>My Progress</h1><p>Lessons you read are auto-marked complete and saved in this browser only.</p></div></div>";
    const total = LP._pages.length, done = Object.keys(progress).filter((k) => progress[k]).length;
    html += '<div class="complete-bar"><strong>Overall: ' + Math.round((done / (total || 1)) * 100) + "%</strong> &nbsp; (" + done + " of " + total + " lessons)</div>";
    sections.forEach((s) => {
      const pages = LP.getPages(s.id); if (!pages.length) return;
      const d = pages.filter((p) => progress[p.id]).length, pct = Math.round((d / pages.length) * 100);
      html += '<div class="prog-section"><div class="prog-section-head"><span class="lhs">' + icKey(s.id, "ic-sm") + " " + s.title + "</span><span>" + d + "/" + pages.length + "</span></div>" +
        '<div class="progress-bar"><div class="progress-bar-fill" style="width:' + pct + '%"></div></div></div>';
    });
    view.innerHTML = html;
  }

  /* ---------- copy buttons (file:// safe) ---------- */
  function flashCopied(btn) { btn.textContent = "Copied!"; btn.classList.add("copied"); setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1400); }
  function legacyCopy(text, btn) {
    try {
      const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); flashCopied(btn);
    } catch (e) { btn.textContent = "Copy failed"; setTimeout(() => (btn.textContent = "Copy"), 1400); }
  }
  function copyText(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => flashCopied(btn)).catch(() => legacyCopy(text, btn));
    else legacyCopy(text, btn);
  }
  function wireCopyButtons() {
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      if (btn.dataset.wired) return; btn.dataset.wired = "1";
      btn.addEventListener("click", () => copyText(btn.parentElement.querySelector("code").innerText, btn));
    });
  }

  /* ---------- scroll reveal ---------- */
  function setupReveal() {
    if (revealObs) revealObs.disconnect();
    if (!("IntersectionObserver" in window)) return;
    revealObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    view.querySelectorAll(".page-body > h2, .page-body > h3, .page-body > .code-block, .page-body > table, .page-body > .callout, .page-body > .eli, .page-body > blockquote, .page-body > .widget-mount, .card, .company-card, .qa").forEach((n) => {
      n.classList.add("reveal"); revealObs.observe(n);
    });
  }

  /* ---------- reading progress + auto-complete ---------- */
  function readingProgress() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    return max > 4 ? Math.min(1, h.scrollTop / max) : 1;
  }
  function onScroll() {
    const p = readingProgress();
    const bar = $("#readProgress"); if (bar) bar.style.width = (p * 100) + "%";
    if (pageState.id) {
      updateRing(p);
      if (!pageState.done && p >= 0.9 && Date.now() - pageState.start > 2500) markComplete(pageState.id);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ---------- search ---------- */
  const searchInput = $("#globalSearch"), searchResults = $("#searchResults");
  let searchIndex = null;
  function buildSearchIndex() {
    searchIndex = [];
    LP._pages.forEach((p) => searchIndex.push({ type: "Lesson", title: p.title, meta: (LP._sectionMap[p.section] || {}).title || "", text: (p.title + " " + p.tags.join(" ") + " " + p.body).toLowerCase(), href: "#/page/" + p.id }));
    LP._terms.forEach((t) => searchIndex.push({ type: "Term", title: t.term, meta: "Glossary", text: (t.term + " " + t.def).toLowerCase(), href: "#/glossary" }));
    LP._questions.forEach((q) => searchIndex.push({ type: "Question", title: q.q, meta: q.topic + (q.companies.length ? " · " + q.companies.join(", ") : ""), text: (q.q + " " + q.a + " " + q.companies.join(" ")).toLowerCase(), href: "#/interview" }));
  }
  function doSearch(kw) {
    if (!searchIndex) buildSearchIndex();
    kw = kw.toLowerCase().trim();
    if (kw.length < 2) { searchResults.hidden = true; return; }
    const words = kw.split(/\s+/);
    const hits = searchIndex.map((item) => {
      let score = 0; words.forEach((w) => { if (item.title.toLowerCase().includes(w)) score += 5; if (item.text.includes(w)) score += 1; });
      return { item, score };
    }).filter((h) => h.score > 0).sort((a, b) => b.score - a.score).slice(0, 12);
    if (!hits.length) { searchResults.innerHTML = '<div class="search-empty">No results for "' + kw + '"</div>'; searchResults.hidden = false; return; }
    searchResults.innerHTML = hits.map((h) => '<a class="search-result" href="' + h.item.href + '"><div class="sr-title">' + hl(h.item.title, words) + '</div><div class="sr-meta">' + h.item.type + " · " + h.item.meta + "</div></a>").join("");
    searchResults.hidden = false;
  }
  function hl(text, words) {
    let out = escapeText(text);
    words.forEach((w) => { if (w.length < 2) return; out = out.replace(new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>"); });
    return out;
  }
  searchInput.addEventListener("input", (e) => doSearch(e.target.value));
  searchInput.addEventListener("focus", (e) => { if (e.target.value) doSearch(e.target.value); });
  document.addEventListener("click", (e) => { if (!e.target.closest(".search-wrap")) searchResults.hidden = true; });
  searchResults.addEventListener("click", () => { searchResults.hidden = true; searchInput.value = ""; });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); searchInput.focus(); }
    if (e.key === "Escape") { searchResults.hidden = true; searchInput.blur(); }
  });

  /* ---------- router ---------- */
  function parseHash() {
    const raw = (location.hash || "#/home").slice(1);
    const [path, query] = raw.split("?");
    const parts = path.split("/").filter(Boolean);
    return { parts, params: new URLSearchParams(query || "") };
  }
  function route() {
    const { parts, params } = parseHash();
    const root = parts[0] || "home";
    let navRoute = { type: root };
    pageState = { id: null, start: Date.now(), done: false };
    window.scrollTo(0, 0);

    switch (root) {
      case "home": renderHome(); break;
      case "page": renderPage(parts[1]); navRoute = { type: "page", id: parts[1] }; break;
      case "interview": renderInterview(params); break;
      case "companies": renderCompanies(); break;
      case "glossary": renderGlossary(); break;
      case "progress": renderProgressDash(); break;
      default: renderNotFound();
    }
    setActiveNav(navRoute);
    closeMobileNav();
    postRender();
  }
  function postRender() {
    view.classList.remove("transition"); void view.offsetWidth; view.classList.add("transition");
    if (window.mountAllWidgets) window.mountAllWidgets(view);
    wireCopyButtons();
    setupReveal();
    onScroll();
  }
  window.addEventListener("hashchange", route);

  /* ---------- mobile nav ---------- */
  const sidebar = $("#sidebar"), scrim = $("#scrim");
  const SIDEBAR_KEY = "lp.sidebar.collapsed.v1";
  const isMobile = () => window.matchMedia && window.matchMedia("(max-width: 820px)").matches;
  const openMobileNav = () => { sidebar.classList.add("open"); scrim.classList.add("show"); };
  const closeMobileNav = () => { sidebar.classList.remove("open"); scrim.classList.remove("show"); };
  function toggleSidebar() {
    if (isMobile()) {
      sidebar.classList.contains("open") ? closeMobileNav() : openMobileNav();
    } else {
      const collapsed = document.body.classList.toggle("sidebar-collapsed");
      localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
      $("#menuToggle").title = collapsed ? "Show sidebar" : "Hide sidebar (full-screen study)";
      onScroll(); // re-measure reading progress after width change
    }
  }
  $("#menuToggle").addEventListener("click", toggleSidebar);
  scrim.addEventListener("click", closeMobileNav);
  if (localStorage.getItem(SIDEBAR_KEY) === "1") {
    document.body.classList.add("sidebar-collapsed");
    $("#menuToggle").title = "Show sidebar";
  }

  /* ---------- reset ---------- */
  $("#resetProgress").addEventListener("click", () => {
    if (confirm("Clear all saved lesson progress in this browser?")) {
      Object.keys(progress).forEach((k) => delete progress[k]); saveProgress(); updateProgressUI(); route();
    }
  });

  /* ---------- boot ---------- */
  buildNav();
  updateProgressUI();
  if (!location.hash) location.hash = "#/home";
  route();
})();
