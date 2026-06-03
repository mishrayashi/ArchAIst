/* ===========================================================
   registry.js — global content store.
   Content modules call LP.section(), LP.page(), LP.question(),
   LP.term() to register material. app.js reads from LP to render.
   =========================================================== */
window.LP = (function () {
  const sections = [];      // { id, title, icon, blurb, order }
  const sectionMap = {};
  const pages = [];         // { id, section, title, level, minutes, tags, body, order }
  const pageMap = {};
  const questions = [];     // { q, a, topic, difficulty, companies[], roles[] }
  const terms = [];         // { term, def, see[] }
  const links = [];         // { from, to, label } — optional mind-map cross-links

  function section(def) {
    if (sectionMap[def.id]) return;
    def.order = def.order ?? sections.length;
    sections.push(def);
    sectionMap[def.id] = def;
  }

  function page(def) {
    // def: { id, section, title, level, minutes, tags, body }
    if (pageMap[def.id]) {
      console.warn("Duplicate page id:", def.id);
      return;
    }
    def.order = def.order ?? pages.filter((p) => p.section === def.section).length;
    def.level = def.level || "Beginner";
    def.minutes = def.minutes || Math.max(3, Math.round((def.body || "").length / 1100));
    def.tags = def.tags || [];
    pages.push(def);
    pageMap[def.id] = def;
  }

  function question(q) {
    // q: { q, a, topic, difficulty, companies[], roles[] }
    q.companies = q.companies || [];
    q.roles = q.roles || [];
    q.difficulty = q.difficulty || "medium";
    q.topic = q.topic || "General";
    q.id = "q" + questions.length;
    questions.push(q);
  }
  // bulk helper
  function questionsBulk(arr) { arr.forEach(question); }

  function term(t) {
    // t: { term, def, see[] }
    terms.push(t);
  }
  function termsBulk(arr) { arr.forEach(term); }

  function link(l) {
    // l: { from, to, label } — endpoints are page ids, section ids,
    // a reference route (interview/companies/glossary/progress) or "root".
    if (l && l.from && l.to) links.push(l);
  }
  function linksBulk(arr) { arr.forEach(link); }

  return {
    section, page, question, questionsBulk, term, termsBulk, link, linksBulk,
    _sections: sections, _sectionMap: sectionMap,
    _pages: pages, _pageMap: pageMap,
    _questions: questions, _terms: terms, _links: links,
    getSections: () => sections.slice().sort((a, b) => a.order - b.order),
    getPages: (sid) => pages.filter((p) => p.section === sid).sort((a, b) => a.order - b.order),
    getPage: (id) => pageMap[id],
    getQuestions: () => questions,
    getTerms: () => terms.slice().sort((a, b) => a.term.toLowerCase().localeCompare(b.term.toLowerCase())),
    getLinks: () => links.slice(),
  };
})();
