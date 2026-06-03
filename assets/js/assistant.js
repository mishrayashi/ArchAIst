/* ===========================================================
   assistant.js — "Archie", the in-page study assistant.

   Design goals (must match the project's ethos):
   - Works OFFLINE by default. No account, no API key, no backend.
   - Answers ONLY from the academy's own content (lessons, glossary,
     interview Q&A) via lightweight retrieval — so it's grounded and
     can't wander off-topic.
   - GUARDRAILS: questions outside the data / AI / interview-prep
     domain are politely declined.
   - Optional: an in-browser LLM (WebLLM / WebGPU) can be enabled with
     one click to phrase answers more naturally. It downloads a model
     once (cached by the browser) and still runs locally — no server.
     Until enabled (or on unsupported browsers) the assistant uses a
     fast extractive answer built from the retrieved passages.

   Pure runtime, mirrors the widgets.js / mindmap.js pattern.
   Exposes window.ArchAI.
   =========================================================== */
(function () {
  "use strict";

  var ic = function (n, c) { return window.icon ? window.icon(n, c) : ""; };
  var STORE_KEY = "lp.ai.enabled.v1";
  // A small, capable model that runs in-browser. Swappable.
  var MODEL_ID = "Llama-3.2-1B-Instruct-q4f32_1-MLC";
  var WEBLLM_URL = "https://esm.run/@mlc-ai/web-llm";

  /* ---------- helpers ---------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  var STOP = new Set(("the a an of to in on for and or is are be as at by with from this that it its into your you we our " +
    "what how why when which who do does can could would should i my me explain define difference between vs use used using " +
    "tell about give show me list types kind kinds").split(" "));
  function tokens(s) {
    return (String(s).toLowerCase().match(/[a-z0-9+#.]+/g) || []).filter(function (w) {
      return w.length > 1 && !STOP.has(w);
    });
  }

  /* ---------- corpus built from the registry ---------- */
  var corpus = null;          // [{type,title,text,href,tokens,tf}]
  var domainVocab = null;     // Set of every meaningful token in the academy
  function buildCorpus() {
    if (corpus) return;
    corpus = [];
    domainVocab = new Set();
    // Retrieval uses full bodies; the guardrail vocabulary is built only from
    // CURATED fields (titles, tags, glossary terms, topics, section names) so
    // generic English inside lesson prose ("world", "best", "today") never
    // counts as on-topic.
    function vocab(s) { tokens(s).forEach(function (t) { domainVocab.add(t); }); }
    function push(item, vocabText) {
      var toks = tokens(item.title + " " + item.text);
      var tf = {};
      toks.forEach(function (t) { tf[t] = (tf[t] || 0) + 1; });
      item.tokens = toks; item.tf = tf;
      corpus.push(item);
      if (vocabText) vocab(vocabText);
    }
    if (window.LP) {
      LP.getSections().forEach(function (s) { vocab(s.title); });
      LP._pages.forEach(function (p) {
        var sec = (LP._sectionMap[p.section] || {}).title || "";
        push({ type: "Lesson", section: sec, title: p.title, text: (p.tags.join(" ") + " " + p.body), href: "#/page/" + p.id },
          p.title + " " + p.tags.join(" "));
      });
      LP._terms.forEach(function (t) {
        push({ type: "Term", section: "Glossary", title: t.term, text: t.def, href: "#/glossary" }, t.term);
      });
      LP._questions.forEach(function (q) {
        push({ type: "Q&A", section: q.topic || "Interview", title: q.q, text: q.a, href: "#/interview" }, q.topic);
      });
    }
    // domain anchor words guarantee on-topic detection even for short queries
    ["data", "sql", "python", "spark", "etl", "elt", "pipeline", "warehouse", "lakehouse",
     "airflow", "kafka", "schema", "scd", "normalization", "index", "join", "ai", "ml",
     "llm", "genai", "rag", "embedding", "vector", "model", "transformer", "cloud", "aws",
     "azure", "gcp", "interview", "infosys", "engineer", "acid", "cap", "hld", "lld",
     "parquet", "streaming", "batch", "governance", "fintech", "industry", "company"]
      .forEach(function (w) { domainVocab.add(w); });
  }

  /* ---------- retrieval ---------- */
  function retrieve(query, k) {
    buildCorpus();
    var qt = tokens(query);
    if (!qt.length) return [];
    var qset = {}; qt.forEach(function (t) { qset[t] = (qset[t] || 0) + 1; });
    var scored = corpus.map(function (item) {
      var s = 0;
      for (var t in qset) {
        if (item.tf[t]) {
          // title hits weigh more; rarer words weigh more (cheap idf)
          var idf = 1 + Math.log(corpus.length / (1 + docFreq(t)));
          s += item.tf[t] * idf * (titleHas(item, t) ? 2.2 : 1);
        }
      }
      // small boost for lessons so we lead with teaching material
      if (item.type === "Lesson") s *= 1.08;
      return { item: item, score: s };
    }).filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, k || 4);
  }
  var _df = null;
  function docFreq(t) {
    if (!_df) { _df = {}; corpus.forEach(function (it) { for (var w in it.tf) _df[w] = (_df[w] || 0) + 1; }); }
    return _df[t] || 0;
  }
  function titleHas(item, t) { return item.title.toLowerCase().indexOf(t) !== -1; }

  /* ---------- guardrail: is this question in-domain? ---------- */
  // safety denylist — refuse clearly harmful intent even if it name-drops a
  // domain word (e.g. "write python to hack wifi"). Topic relevance ≠ safe.
  var UNSAFE = /\b(hack|crack|exploit|malware|keylogg|ddos|phish|steal|bypass|pirate|crack\s*password|sql\s*inject)\w*/i;
  function isUnsafe(q) { return UNSAFE.test(q); }

  function inDomain(query) {
    buildCorpus();
    if (isUnsafe(query)) return false;
    var qt = tokens(query);
    if (!qt.length) return true; // greetings / empty handled elsewhere
    var hits = qt.filter(function (t) { return domainVocab.has(t); }).length;
    var ratio = hits / qt.length;
    // Necessary condition: the question must share at least one meaningful
    // word with the academy. This stops a single incidental rare-word match
    // ("poem", "cricket") from sneaking through the retrieval fallback.
    if (hits === 0) return false;
    // Clear cases: two domain words, or a short focused query that is mostly
    // domain vocabulary (e.g. "what is RAG", "SCD type 2").
    if (hits >= 2 || ratio >= 0.5) return true;
    // One domain word in a longer sentence — only accept if retrieval finds
    // a genuinely strong, specific passage (high bar to avoid false accepts).
    var top = retrieve(query, 1)[0];
    return !!(top && top.score >= 18);
  }
  function isGreeting(q) { return /^\s*(hi|hii|hey|hello|yo|heya|namaste|good (morning|evening|afternoon))\b/i.test(q); }

  /* ---------- answer composition (extractive, offline) ---------- */
  function snippet(text, query, max) {
    max = max || 320;
    var clean = String(text).replace(/```[\s\S]*?```/g, " ").replace(/[#>*_`|]/g, " ").replace(/\s+/g, " ").trim();
    var qt = tokens(query);
    var sentences = clean.split(/(?<=[.!?])\s+/);
    var best = "", bestScore = -1;
    for (var i = 0; i < sentences.length; i++) {
      var win = sentences.slice(i, i + 2).join(" ");
      var sc = qt.reduce(function (a, t) { return a + (win.toLowerCase().indexOf(t) !== -1 ? 1 : 0); }, 0);
      if (sc > bestScore) { bestScore = sc; best = win; }
    }
    if (!best) best = clean;
    return best.length > max ? best.slice(0, max - 1).trim() + "…" : best;
  }
  function extractiveAnswer(query, hits) {
    var lead = hits[0];
    var body = '<p>' + esc(snippet(lead.item.text, query)) + "</p>";
    var srcs = hits.map(function (h) {
      return '<a class="ai-src" href="' + h.item.href + '">' + ic("arrowRight", "ic-sm") +
        esc(h.item.title) + ' <span class="ai-src-type">' + h.item.type + "</span></a>";
    }).join("");
    return body +
      '<div class="ai-srcs"><div class="ai-srcs-label">From the academy</div>' + srcs + "</div>";
  }
  function refusal() {
    return '<p>I\'m <strong>Archie</strong> — I only help with this academy\'s topics: ' +
      '<em>data &amp; AI engineering, the tools, the concepts, and interview prep</em>.</p>' +
      '<p>That one looks outside that scope, so I\'ll sit this one out. Try asking about ' +
      'SQL, Spark, ETL, data modeling, RAG/LLMs, a role, or an interview question.</p>';
  }
  function unsafeRefusal() {
    return '<p>I can\'t help with that — it looks like it could be used to cause harm. ' +
      'I\'m here for <em>learning</em> data &amp; AI engineering and interview prep.</p>' +
      '<p>If you\'re into security as a career, I can point you to the relevant concepts the ethical way.</p>';
  }
  function greeting() {
    return '<p>Hi! I\'m <strong>Archie</strong>, your study buddy for ArchAIst. ' +
      'Ask me anything about data/AI engineering or interview prep — for example:</p>' +
      '<div class="ai-chips">' +
      ['What is a star schema?', 'Explain RAG simply', 'SCD Type 2?', 'Infosys SQL questions']
        .map(function (s) { return '<button class="ai-chip" type="button">' + esc(s) + "</button>"; }).join("") +
      "</div>";
  }

  /* ---------- the one instance ---------- */
  var instance = null;
  function mount() {
    if (instance) return instance;

    var launcher = el("button", "ai-launcher", ic("sparkles") + "<span>Ask Archie</span>");
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Open the study assistant");

    var panel = el("aside", "ai-panel", "");
    panel.hidden = true;
    panel.innerHTML =
      '<div class="ai-head">' +
        '<div class="ai-id"><span class="ai-avatar">' + ic("sparkles", "ic-sm") + "</span>" +
          '<div><strong>Archie</strong><small id="aiStatus">offline · grounded in this site</small></div></div>' +
        '<div class="ai-head-btns">' +
          '<button class="ai-x" id="aiEnable" type="button" title="Enable the in-browser AI model (one-time download, runs locally)">' + ic("zap", "ic-sm") + " Enable AI</button>" +
          '<button class="ai-x" id="aiClose" type="button" aria-label="Close">' + ic("arrowRight", "ic-sm") + "</button>" +
        "</div>" +
      "</div>" +
      '<div class="ai-log" id="aiLog" aria-live="polite"></div>' +
      '<form class="ai-form" id="aiForm">' +
        '<input id="aiInput" type="text" autocomplete="off" placeholder="Ask about data, AI, or interviews…" />' +
        '<button class="ai-send" type="submit" aria-label="Send">' + ic("arrowRight", "ic-sm") + "</button>" +
      "</form>" +
      '<div class="ai-foot">Grounded in this academy · runs in your browser · not a substitute for the lessons</div>';

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    var log = panel.querySelector("#aiLog");
    var form = panel.querySelector("#aiForm");
    var input = panel.querySelector("#aiInput");
    var statusEl = panel.querySelector("#aiStatus");
    var enableBtn = panel.querySelector("#aiEnable");

    var engine = null;     // WebLLM engine when enabled
    var loading = false;

    function addMsg(role, html) {
      var m = el("div", "ai-msg ai-" + role, html);
      log.appendChild(m);
      log.scrollTop = log.scrollHeight;
      return m;
    }
    function open() {
      panel.hidden = false;
      document.body.classList.add("ai-open");
      requestAnimationFrame(function () { panel.classList.add("show"); });
      if (!log.children.length) addMsg("bot", greeting());
      setTimeout(function () { input.focus(); }, 120);
    }
    function close() { panel.classList.remove("show"); document.body.classList.remove("ai-open"); setTimeout(function () { panel.hidden = true; }, 220); }

    launcher.addEventListener("click", open);
    panel.querySelector("#aiClose").addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) close(); });

    // suggestion chips (event-delegated)
    log.addEventListener("click", function (e) {
      var chip = e.target.closest(".ai-chip");
      if (chip) { input.value = chip.textContent; form.dispatchEvent(new Event("submit", { cancelable: true })); }
    });

    /* ----- the answer flow ----- */
    function respond(query) {
      addMsg("user", esc(query));
      if (isGreeting(query) && tokens(query).length <= 2) { addMsg("bot", greeting()); return; }
      if (isUnsafe(query)) { addMsg("bot", unsafeRefusal()); return; }
      if (!inDomain(query)) { addMsg("bot", refusal()); return; }

      var hits = retrieve(query, 4);
      if (!hits.length) { addMsg("bot", refusal()); return; }

      if (engine) {
        var thinking = addMsg("bot", '<span class="ai-typing"><i></i><i></i><i></i></span>');
        generate(query, hits).then(function (text) {
          thinking.innerHTML = mdLite(text) + sourcesBlock(hits);
          log.scrollTop = log.scrollHeight;
        }).catch(function () {
          thinking.innerHTML = extractiveAnswer(query, hits);
        });
      } else {
        addMsg("bot", extractiveAnswer(query, hits));
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim();
      if (!q || loading) return;
      input.value = "";
      respond(q);
    });

    /* ----- optional in-browser model ----- */
    function sourcesBlock(hits) {
      return '<div class="ai-srcs"><div class="ai-srcs-label">From the academy</div>' +
        hits.slice(0, 3).map(function (h) {
          return '<a class="ai-src" href="' + h.item.href + '">' + ic("arrowRight", "ic-sm") + esc(h.item.title) +
            ' <span class="ai-src-type">' + h.item.type + "</span></a>";
        }).join("") + "</div>";
    }
    function mdLite(t) {
      return "<p>" + esc(t).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>") + "</p>";
    }
    function context(hits) {
      return hits.map(function (h, i) {
        return "[" + (i + 1) + "] " + h.item.title + " — " +
          String(h.item.text).replace(/```[\s\S]*?```/g, " ").replace(/\s+/g, " ").trim().slice(0, 700);
      }).join("\n\n");
    }
    function generate(query, hits) {
      var sys = "You are Archie, a friendly study assistant for the ArchAIst academy (data & AI engineering and interview prep). " +
        "Answer ONLY using the provided context from the academy. If the context doesn't cover it, say so briefly and suggest a related lesson. " +
        "Be clear and beginner-friendly but precise. Never answer questions outside data/AI/interview topics.";
      var usr = "Context:\n" + context(hits) + "\n\nQuestion: " + query + "\n\nAnswer:";
      return engine.chat.completions.create({
        messages: [{ role: "system", content: sys }, { role: "user", content: usr }],
        temperature: 0.4, max_tokens: 400,
      }).then(function (r) { return (r.choices[0].message.content || "").trim(); });
    }

    function setStatus(t) { statusEl.textContent = t; }
    function enableAI() {
      if (engine || loading) return;
      if (!("gpu" in navigator)) {
        addMsg("bot", '<p>Your browser doesn\'t support <strong>WebGPU</strong>, which the in-browser model needs. ' +
          'Try the latest <strong>Chrome or Edge</strong>. Meanwhile I\'ll keep answering from the academy\'s content directly.</p>');
        return;
      }
      loading = true; enableBtn.disabled = true;
      setStatus("downloading model… (one-time)");
      var note = addMsg("bot", '<p>Loading a small AI model in your browser (one-time ~0.6–1 GB download, then cached and fully offline). ' +
        'You can keep chatting — I\'ll answer from the lessons until it\'s ready.</p><div class="ai-progress"><i id="aiBar"></i></div><small id="aiPct">starting…</small>');
      import(/* webpackIgnore: true */ WEBLLM_URL).then(function (mod) {
        return mod.CreateMLCEngine(MODEL_ID, {
          initProgressCallback: function (p) {
            var pct = Math.round((p.progress || 0) * 100);
            var bar = note.querySelector("#aiBar"); if (bar) bar.style.width = pct + "%";
            var lbl = note.querySelector("#aiPct"); if (lbl) lbl.textContent = p.text || (pct + "%");
          },
        });
      }).then(function (eng) {
        engine = eng; loading = false;
        setStatus("AI ready · runs locally");
        enableBtn.innerHTML = ic("check", "ic-sm") + " AI on";
        var bar = note.querySelector("#aiBar"); if (bar) bar.style.width = "100%";
        var lbl = note.querySelector("#aiPct"); if (lbl) lbl.textContent = "ready — answers are now AI-phrased.";
        try { localStorage.setItem(STORE_KEY, "1"); } catch (e) {}
      }).catch(function (err) {
        loading = false; enableBtn.disabled = false;
        setStatus("offline · grounded in this site");
        addMsg("bot", '<p>Couldn\'t load the in-browser model (needs internet for the first download and a WebGPU browser). ' +
          'No problem — I\'ll keep answering directly from the academy\'s content.</p>');
        console.warn("WebLLM load failed:", err);
      });
    }
    enableBtn.addEventListener("click", enableAI);

    instance = { open: open, close: close, enableAI: enableAI };
    return instance;
  }

  window.ArchAI = {
    mount: mount,
    open: function () { mount().open(); },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
