/* ===========================================================
   widgets.js — interactive, animated explainers for hard topics.
   Each widget is a function(mountEl) that builds its own UI.
   Embed in content with: <div class="widget-mount" data-widget="ID"></div>
   app.js calls mountAllWidgets() after rendering a page.
   =========================================================== */
(function () {
  var cleanups = [];
  function addTimer(id) { cleanups.push(function () { clearInterval(id); clearTimeout(id); }); }
  function clearAll() { cleanups.forEach(function (f) { try { f(); } catch (e) {} }); cleanups = []; }

  function shell(mount, opts) {
    mount.innerHTML =
      '<div class="widget"><div class="widget-head">' +
      '<span class="w-ic">' + window.icon(opts.icon || "spark") + "</span>" +
      '<div class="widget-title">' + opts.title + (opts.sub ? "<small>" + opts.sub + "</small>" : "") + "</div>" +
      '<span class="widget-tag">' + (opts.tag || "Interactive") + "</span>" +
      "</div><div class=\"widget-body\"></div></div>";
    return mount.querySelector(".widget-body");
  }
  var esc = function (s) { return String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;"); };

  var W = {};

  /* ---------- 1. Nested AI rings ---------- */
  W.nesting = function (mount) {
    var body = shell(mount, { icon: "layers", title: "The AI family tree", sub: "Click each ring to see how they nest", tag: "Explore" });
    var rings = [
      { k: "AI", size: 340, info: "<b>Artificial Intelligence</b> — any machine doing something we'd call \"smart\", from a 1980s chess program to ChatGPT. The broadest umbrella." },
      { k: "ML", size: 274, info: "<b>Machine Learning</b> — machines that <i>learn patterns from examples</i> instead of being hand-coded with rules." },
      { k: "Deep Learning", size: 210, info: "<b>Deep Learning</b> — ML using many-layered neural networks. Brilliant at messy data: images, audio, language." },
      { k: "GenAI", size: 148, info: "<b>Generative AI</b> — AI that <i>creates</i> brand-new content: text, images, audio, code." },
      { k: "LLM", size: 88, info: "<b>Large Language Models</b> — generative models specialised in language. Claude, GPT, Gemini, Llama." },
    ];
    var html = '<div class="nest-stage"><div id="nestRoot"></div></div>' +
      '<div class="nest-info" id="nestInfo"><h5>Tap a ring</h5><p>They\'re Russian dolls — each one is a more specific kind of the one around it.</p></div>';
    body.innerHTML = html;
    // build nested DOM
    function build(i) {
      if (i >= rings.length) return "";
      var r = rings[i];
      var alpha = 0.05 + i * 0.05;
      return '<div class="nest-ring" data-i="' + i + '" style="width:' + r.size + "px;height:" + r.size +
        "px;background:rgba(124,124,255," + alpha + ');align-items:flex-end;justify-content:center;display:flex;position:relative">' +
        '<span class="nest-lbl" style="position:absolute;top:9px;left:0;right:0">' + r.k + "</span>" +
        build(i + 1) + "</div>";
    }
    body.querySelector("#nestRoot").innerHTML = build(0);
    var info = body.querySelector("#nestInfo");
    body.querySelectorAll(".nest-ring").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.stopPropagation();
        body.querySelectorAll(".nest-ring").forEach(function (n) { n.classList.remove("active"); });
        el.classList.add("active");
        var r = rings[+el.dataset.i];
        info.innerHTML = "<h5>" + r.k + "</h5><p>" + r.info + "</p>";
      });
    });
  };

  /* ---------- 2. Data pipeline flow ---------- */
  W.pipeline = function (mount) {
    var body = shell(mount, { icon: "flow", title: "The data lifecycle, in motion", sub: "Watch data flow Source → Serve", tag: "Live" });
    var stages = [
      { t: "Source", s: "apps, sensors" },
      { t: "Ingest", s: "collect & load" },
      { t: "Store", s: "lake / warehouse" },
      { t: "Transform", s: "clean & model" },
      { t: "Serve", s: "BI · ML · AI" },
    ];
    var boxes = stages.map(function (s, i) {
      return '<div class="flow-stage"><div class="flow-box" data-i="' + i + '"><div class="fb-title">' + s.t + "</div><div class=\"fb-sub\">" + s.s + "</div></div>" +
        (i < stages.length - 1 ? '<span class="flow-arrow">' + window.icon("arrowRight", "ic-sm") + "</span>" : "") + "</div>";
    }).join("");
    body.innerHTML = '<div class="flow">' + boxes + '</div><div class="flow-track"><div class="flow-packet" id="pkt"></div></div>' +
      '<div class="widget-controls" style="margin-top:14px"><button class="w-btn primary" id="flowPlay">' + window.icon("play", "ic-sm") + ' Replay</button><span class="w-hint" id="flowHint">A data engineer builds &amp; owns the pipes from Source to Serve.</span></div>';
    var pkt = body.querySelector("#pkt");
    var boxEls = body.querySelectorAll(".flow-box");
    var hint = body.querySelector("#flowHint");
    var idx = 0;
    function step() {
      boxEls.forEach(function (b) { b.classList.remove("lit"); });
      if (boxEls[idx]) boxEls[idx].classList.add("lit");
      pkt.style.left = (idx / (stages.length - 1)) * 100 + "%";
      hint.textContent = stages[idx].t + " — " + stages[idx].s;
      idx = (idx + 1) % stages.length;
    }
    step();
    var iv = setInterval(step, 1100); addTimer(iv);
    body.querySelector("#flowPlay").addEventListener("click", function () { idx = 0; step(); });
  };

  /* ---------- 3. SQL JOIN visualizer ---------- */
  W.join = function (mount) {
    var body = shell(mount, { icon: "grid", title: "SQL JOIN visualizer", sub: "See exactly which rows survive each join", tag: "Try it" });
    var customers = [{ id: 1, name: "Ravi" }, { id: 2, name: "Sara" }, { id: 3, name: "Amit" }];
    var orders = [{ cid: 1, p: "Book" }, { cid: 1, p: "Pen" }, { cid: 2, p: "Bag" }, { cid: 4, p: "Hat" }];
    var types = {
      INNER: "Only rows that match in BOTH tables.",
      LEFT: "ALL customers + matching orders (NULLs where none).",
      RIGHT: "ALL orders + matching customers.",
      FULL: "ALL rows from both, matched where possible.",
    };
    body.innerHTML = '<div class="widget-controls" id="joinBtns"></div>' +
      '<div class="cap-scenario" id="joinDesc" style="margin-bottom:14px"></div>' +
      '<div class="widget-controls" style="gap:0;justify-content:center;margin-bottom:6px">' +
        '<div class="join-seg" style="display:flex;border:1px solid var(--border);border-radius:10px;overflow:hidden;font-size:11px;font-weight:700">' +
        '<span id="segL" style="padding:7px 12px">Customers&nbsp;only</span>' +
        '<span id="segM" style="padding:7px 12px;background:var(--accent-soft);color:var(--accent-strong)">Match</span>' +
        '<span id="segR" style="padding:7px 12px">Orders&nbsp;only</span></div></div>' +
      '<div class="join-tables"><div class="jt"><h6>customers</h6><div id="jtC"></div></div>' +
      '<div class="jt"><h6>orders</h6><div id="jtO"></div></div></div>' +
      '<div class="w-hint" id="joinCount"></div>';
    var btns = body.querySelector("#joinBtns");
    Object.keys(types).forEach(function (t) {
      var b = document.createElement("button"); b.className = "w-btn"; b.textContent = t + " JOIN"; b.dataset.t = t;
      btns.appendChild(b);
    });
    function custMatched(c) { return orders.some(function (o) { return o.cid === c.id; }); }
    function ordMatched(o) { return customers.some(function (c) { return c.id === o.cid; }); }
    function render(type) {
      body.querySelectorAll("#joinBtns .w-btn").forEach(function (b) { b.classList.toggle("active", b.dataset.t === type); });
      body.querySelector("#joinDesc").innerHTML = "<strong>" + type + " JOIN</strong> — " + types[type];
      var keepL = type === "LEFT" || type === "FULL";   // keep unmatched customers
      var keepR = type === "RIGHT" || type === "FULL";  // keep unmatched orders
      var rows = 0;
      body.querySelector("#jtC").innerHTML = customers.map(function (c) {
        var m = custMatched(c); var kept = m || keepL;
        return '<div class="jrow ' + (m ? "matched " : "") + (kept ? "kept" : "dropped") + '">id ' + c.id + " · " + c.name + "</div>";
      }).join("");
      body.querySelector("#jtO").innerHTML = orders.map(function (o) {
        var m = ordMatched(o); var kept = m || keepR;
        return '<div class="jrow ' + (m ? "matched " : "") + (kept ? "kept" : "dropped") + '">cid ' + o.cid + " · " + o.p + "</div>";
      }).join("");
      // result row count
      var matchPairs = 0; customers.forEach(function (c) { orders.forEach(function (o) { if (c.id === o.cid) matchPairs++; }); });
      if (type === "INNER") rows = matchPairs;
      if (type === "LEFT") rows = matchPairs + customers.filter(function (c) { return !custMatched(c); }).length;
      if (type === "RIGHT") rows = matchPairs + orders.filter(function (o) { return !ordMatched(o); }).length;
      if (type === "FULL") rows = matchPairs + customers.filter(function (c) { return !custMatched(c); }).length + orders.filter(function (o) { return !ordMatched(o); }).length;
      body.querySelector("#joinCount").innerHTML = "Result: <b>" + rows + " rows</b>. Highlighted = matched on the key. Faded = dropped by this join.";
      body.querySelector("#segL").style.opacity = keepL ? 1 : 0.3;
      body.querySelector("#segR").style.opacity = keepR ? 1 : 0.3;
    }
    btns.querySelectorAll(".w-btn").forEach(function (b) { b.addEventListener("click", function () { render(b.dataset.t); }); });
    render("INNER");
  };

  /* ---------- 4. SCD Type 2 simulator ---------- */
  W.scd2 = function (mount) {
    var body = shell(mount, { icon: "database", title: "SCD Type 2 simulator", sub: "Change a value and watch history get versioned", tag: "Try it" });
    var dates = ["2024-06-01", "2025-01-15", "2025-09-10", "2026-03-20", "2026-11-02"];
    var skSeq = 27;
    var changeN = 0;
    var rows;
    function reset() {
      rows = [{ sk: 10, id: 1, name: "Ravi", city: "Mumbai", start: "2022-01-01", end: "9999-12-31", cur: true }];
      skSeq = 27; changeN = 0; render(-1);
    }
    function render(newIdx) {
      var t = "<table class=\"w-table\"><thead><tr><th>sk</th><th>id</th><th>name</th><th>city</th><th>start_date</th><th>end_date</th><th>is_current</th></tr></thead><tbody>";
      rows.forEach(function (r, i) {
        t += '<tr class="' + (i === newIdx ? "w-row-new " : "") + (r.cur ? "" : "w-row-expired") + '">' +
          "<td>" + r.sk + "</td><td>" + r.id + "</td><td>" + r.name + "</td><td>" + r.city + "</td><td>" + r.start + "</td><td>" + r.end +
          '</td><td class="' + (r.cur ? "w-flag-true" : "w-flag-false") + '">' + r.cur + "</td></tr>";
      });
      t += "</tbody></table>";
      body.querySelector("#scdTable").innerHTML = t;
    }
    body.innerHTML = '<div class="widget-controls">' +
      'Move customer #1 to: <input class="w-input" id="scdCity" placeholder="new city, e.g. Pune" style="min-width:160px">' +
      '<button class="w-btn primary" id="scdApply">Apply change</button>' +
      '<button class="w-btn" id="scdReset">' + window.icon("refresh", "ic-sm") + ' Reset</button></div>' +
      '<div id="scdTable"></div>' +
      '<div class="w-hint">On each change we <b>expire</b> the current row (set end_date + is_current=false) and <b>insert a new versioned row</b> with a fresh surrogate key. Full history preserved — facts can point to the version valid at the time.</div>';
    body.querySelector("#scdApply").addEventListener("click", function () {
      var city = (body.querySelector("#scdCity").value || "").trim();
      if (!city) { body.querySelector("#scdCity").focus(); return; }
      var d = dates[changeN % dates.length]; changeN++;
      rows.forEach(function (r) { if (r.cur) { r.cur = false; r.end = d; } });
      rows.push({ sk: skSeq, id: 1, name: "Ravi", city: city, start: d, end: "9999-12-31", cur: true });
      skSeq += Math.floor(7 + (skSeq % 5));
      body.querySelector("#scdCity").value = "";
      render(rows.length - 1);
    });
    body.querySelector("#scdReset").addEventListener("click", reset);
    reset();
  };

  /* ---------- 5. Spark lazy evaluation ---------- */
  W.sparkLazy = function (mount) {
    var body = shell(mount, { icon: "zap", title: "Spark: lazy vs action", sub: "Transformations build a plan — an action runs it", tag: "Live" });
    var ops = [
      { c: 'df = spark.read.parquet("sales")', type: "transform" },
      { c: '.filter(amount > 0)', type: "transform" },
      { c: '.withColumn("tax", amount*0.18)', type: "transform" },
      { c: '.groupBy("city").sum()', type: "transform" },
      { c: '.show()', type: "action" },
    ];
    body.innerHTML = '<div class="dag" id="dag"></div>' +
      '<div class="widget-controls" style="margin-top:14px"><button class="w-btn primary" id="sparkRun">' + window.icon("play", "ic-sm") + " Call .show() (action)</button>" +
      '<button class="w-btn" id="sparkReset">' + window.icon("refresh", "ic-sm") + " Reset</button></div>" +
      '<div class="cap-scenario" id="sparkNote"></div>';
    var dag = body.querySelector("#dag");
    var note = body.querySelector("#sparkNote");
    function reset() {
      dag.innerHTML = ops.map(function (o, i) {
        return '<div class="dag-node t-' + o.type + (o.type === "transform" ? " lazy" : "") + '" data-i="' + i + '">' +
          '<span class="dn-type">' + o.type + "</span><span>" + esc(o.c) + "</span></div>";
      }).join("");
      note.innerHTML = "Nothing has run yet. The transformations are <b>lazy</b> — Spark is only <i>building a plan</i> (the DAG above).";
      body.querySelector("#sparkRun").disabled = false;
    }
    function run() {
      body.querySelector("#sparkRun").disabled = true;
      note.innerHTML = "Action called → Spark optimises and executes the whole plan…";
      var nodes = dag.querySelectorAll(".dag-node");
      var i = 0;
      function next() {
        if (i > 0) { nodes[i - 1].classList.remove("running"); nodes[i - 1].classList.add("executed"); }
        if (i >= nodes.length) { note.innerHTML = "Done. <b>Lazy evaluation</b> let Spark see the full plan and optimise it (Catalyst) before running a single row."; return; }
        nodes[i].classList.remove("lazy"); nodes[i].classList.add("running");
        i++;
        var t = setTimeout(next, 650); addTimer(t);
      }
      next();
    }
    body.querySelector("#sparkRun").addEventListener("click", run);
    body.querySelector("#sparkReset").addEventListener("click", reset);
    reset();
  };

  /* ---------- 6. RAG flow ---------- */
  W.rag = function (mount) {
    var body = shell(mount, { icon: "network", title: "RAG, step by step", sub: "How an LLM answers from YOUR documents", tag: "Live" });
    var steps = [
      { t: "User question", d: '"What is our refund policy?"' },
      { t: "Embed the question", d: "→ vector [0.21, -0.04, 0.88, …]" },
      { t: "Search the vector DB", d: "find nearest chunks (cosine similarity)" },
      { t: "Retrieve top-k chunks", d: "chunks" },
      { t: "Prompt the LLM with context", d: 'answer using ONLY the retrieved text' },
      { t: "Grounded answer + citation", d: '"Refunds within 30 days…" [policy.pdf §4]' },
    ];
    body.innerHTML = '<div class="widget-controls"><input class="w-input" id="ragQ" value="What is our refund policy?"><button class="w-btn primary" id="ragRun">' + window.icon("play", "ic-sm") + " Run RAG</button><button class=\"w-btn\" id=\"ragReset\">" + window.icon("refresh", "ic-sm") + " Reset</button></div>" +
      '<div class="rag-steps" id="ragSteps"></div>';
    var cont = body.querySelector("#ragSteps");
    function build() {
      cont.innerHTML = steps.map(function (s, i) {
        var extra = i === 3 ? '<span class="rag-chunk">policy.pdf §4</span><span class="rag-chunk">faq.md</span><span class="rag-chunk">terms §2</span>' : "";
        return '<div class="rag-step" data-i="' + i + '"><div class="rs-dot">' + (i + 1) + '</div><div class="rs-body"><h6>' + s.t + "</h6><p>" + esc(s.d) + "</p>" + extra + "</div></div>";
      }).join("");
    }
    function run() {
      build();
      var q = (body.querySelector("#ragQ").value || "").trim();
      var first = cont.querySelector('.rag-step[data-i="0"] p'); if (first) first.textContent = '"' + q + '"';
      var els = cont.querySelectorAll(".rag-step"); var i = 0;
      function next() { if (i >= els.length) return; els[i].classList.add("active"); i++; var t = setTimeout(next, 750); addTimer(t); }
      next();
    }
    body.querySelector("#ragRun").addEventListener("click", run);
    body.querySelector("#ragReset").addEventListener("click", build);
    build();
  };

  /* ---------- 7. Star schema explorer ---------- */
  W.starSchema = function (mount) {
    var body = shell(mount, { icon: "network", title: "Star schema explorer", sub: "Hover a dimension to light its join", tag: "Explore" });
    var dims = [
      { k: "dim_date", x: 50, y: 6, info: "When it happened: day, month, quarter, year, weekday." },
      { k: "dim_product", x: 88, y: 46, info: "What was sold: name, category, brand, price tier." },
      { k: "dim_customer", x: 12, y: 46, info: "Who bought: name, city, segment (SCD-tracked)." },
      { k: "dim_store", x: 50, y: 86, info: "Where: store, region, format." },
    ];
    body.innerHTML = '<div class="star" id="star"><svg class="star-svg" id="starSvg"></svg></div>' +
      '<div class="cap-scenario" id="starInfo"><strong>fact_sales</strong> — grain: one row per item per transaction. Measures: amount, quantity. Foreign keys to each dimension.</div>';
    var star = body.querySelector("#star");
    var fact = document.createElement("div");
    fact.className = "star-node fact"; fact.textContent = "fact_sales";
    fact.style.left = "50%"; fact.style.top = "46%"; fact.style.transform = "translate(-50%,-50%)";
    star.appendChild(fact);
    var svg = body.querySelector("#starSvg");
    dims.forEach(function (d, i) {
      var n = document.createElement("div");
      n.className = "star-node dim"; n.textContent = d.k; n.dataset.i = i;
      n.style.left = d.x + "%"; n.style.top = d.y + "%"; n.style.transform = "translate(-50%,-50%)";
      star.appendChild(n);
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", "50%"); line.setAttribute("y1", "46%");
      line.setAttribute("x2", d.x + "%"); line.setAttribute("y2", d.y + "%");
      line.dataset.i = i; svg.appendChild(line);
      function on() {
        n.classList.add("lit"); line.classList.add("lit");
        body.querySelector("#starInfo").innerHTML = "<strong>" + d.k + "</strong> — " + d.info;
      }
      function off() { n.classList.remove("lit"); line.classList.remove("lit"); }
      n.addEventListener("mouseenter", on); n.addEventListener("mouseleave", off);
      n.addEventListener("click", on);
    });
    fact.addEventListener("click", function () {
      body.querySelector("#starInfo").innerHTML = "<strong>fact_sales</strong> — grain: one row per item per transaction. Measures: amount, quantity. Foreign keys to each dimension.";
    });
  };

  /* ---------- 8. CAP theorem ---------- */
  W.cap = function (mount) {
    var body = shell(mount, { icon: "network", title: "CAP theorem, felt not memorised", sub: "Trigger a partition, then pick your trade-off", tag: "Try it" });
    body.innerHTML = '<div class="cap-tri"><div class="cap-node on" id="capC">Consistency</div><div class="cap-node on" id="capA">Availability</div><div class="cap-node on" id="capP">Partition&nbsp;tolerance</div></div>' +
      '<div class="widget-controls" id="capCtrls"><button class="w-btn primary" id="capPart">Trigger network partition</button></div>' +
      '<div class="cap-scenario" id="capMsg">No partition yet → you can have all three. The trade-off only appears <strong>when the network splits</strong>. Hit the button.</div>';
    var C = body.querySelector("#capC"), A = body.querySelector("#capA"), P = body.querySelector("#capP");
    var ctrls = body.querySelector("#capCtrls"), msg = body.querySelector("#capMsg");
    function partition() {
      C.className = "cap-node off"; A.className = "cap-node off"; P.className = "cap-node on";
      msg.innerHTML = "Network partition! <strong>P is now mandatory.</strong> You must sacrifice one of C or A. Which do you choose?";
      ctrls.innerHTML = '<button class="w-btn" id="cpBtn">Choose CP (consistency)</button><button class="w-btn" id="apBtn">Choose AP (availability)</button><button class="w-btn" id="capReset">' + window.icon("refresh", "ic-sm") + " Reset</button>";
      body.querySelector("#cpBtn").addEventListener("click", function () {
        C.className = "cap-node on"; A.className = "cap-node off"; P.className = "cap-node on";
        msg.innerHTML = "<strong>CP</strong> — refuse/withhold answers to avoid stale data. A bank balance does this: better to error than show a wrong number. (e.g. HBase, RDBMS clusters)";
      });
      body.querySelector("#apBtn").addEventListener("click", function () {
        C.className = "cap-node off"; A.className = "cap-node on"; P.className = "cap-node on";
        msg.innerHTML = "<strong>AP</strong> — always answer, accept temporary staleness (eventual consistency). A social feed does this: being up beats being perfectly fresh. (e.g. Cassandra, DynamoDB)";
      });
      body.querySelector("#capReset").addEventListener("click", reset);
    }
    function reset() {
      C.className = "cap-node on"; A.className = "cap-node on"; P.className = "cap-node on";
      ctrls.innerHTML = '<button class="w-btn primary" id="capPart">Trigger network partition</button>';
      msg.innerHTML = "No partition yet → you can have all three. The trade-off only appears <strong>when the network splits</strong>. Hit the button.";
      body.querySelector("#capPart").addEventListener("click", partition);
    }
    body.querySelector("#capPart").addEventListener("click", partition);
  };

  /* ---------- 9. Role explorer ---------- */
  W.roleExplorer = function (mount) {
    var body = shell(mount, { icon: "compass", title: "Find your path", sub: "Pick a role — see the roadmap for THAT role only", tag: "Choose your path" });
    var roles = {
      "Data Engineer": { tag: "Best entry point", one: "Build the reliable pipelines & warehouses everyone else depends on.",
        skills: ["SQL", "Python", "Spark", "Airflow", "Cloud", "Data modeling"],
        steps: ["Master SQL + Python", "Data modeling + SCD + ETL/ELT", "Spark + a cloud + a warehouse", "Airflow + one end-to-end project", "Interview drills (SQL, pipeline design)"],
        roadmap: "#/page/roadmap-data-engineer" },
      "AI Data Engineer": { tag: "Fast-growing", one: "A data engineer whose pipelines feed AI: features, embeddings, vector stores.",
        skills: ["DE stack", "Embeddings", "Vector DBs", "Feature stores", "MLflow", "Drift monitoring"],
        steps: ["Become a solid Data Engineer first", "Learn ML basics + features", "Embeddings + vector databases", "Feature stores + data/version control", "Monitor data drift for models"],
        roadmap: "#/page/roadmap-ai-data-engineer" },
      "GenAI Engineer": { tag: "Friendliest AI role", one: "Build apps on top of generative models — RAG, agents, prompts.",
        skills: ["Python", "Prompting", "RAG", "Vector DBs", "LangChain", "Evals"],
        steps: ["Solid Python + data fluency", "Understand LLMs + prompt engineering", "Embeddings + RAG over documents", "Agents, evals, guardrails", "Ship a production-style RAG app"],
        roadmap: "#/page/roadmap-genai-engineer" },
      "LLM Engineer": { tag: "Deep specialisation", one: "Work on the models themselves — fine-tuning, serving, optimisation.",
        skills: ["PyTorch", "Transformers", "LoRA/QLoRA", "GPUs", "vLLM", "Distributed training"],
        steps: ["Strong Python + deep-learning basics", "Transformer architecture + tokenization", "Fine-tuning with PEFT/LoRA", "Serving & optimisation (quantization, vLLM)", "Evals + distributed training (Ray)"],
        roadmap: "#/page/roadmap-llm-engineer" },
      "ML Engineer": { tag: "SWE + ML", one: "Put machine-learning models into reliable production software.",
        skills: ["Python", "PyTorch/TF", "MLOps", "Docker/K8s", "APIs", "Monitoring"],
        steps: ["Python + ML fundamentals", "Model training & evaluation", "Serving models as APIs", "MLOps: CI/CD, monitoring, registries", "Scale & reliability"],
        roadmap: "#/page/roadmap-ml-engineer" },
      "Data Scientist": { tag: "Maths-heavy", one: "Build models to predict and find deep insight from data.",
        skills: ["Statistics", "Python", "scikit-learn", "Experiments", "Visualisation", "SQL"],
        steps: ["Statistics + probability", "Python + pandas + scikit-learn", "Feature engineering & modeling", "Experiment design / A-B testing", "Communicating insight"],
        roadmap: "#/page/roadmap-data-scientist" },
      "Data Analyst": { tag: "Great first step", one: "Explain what already happened using SQL, dashboards & charts.",
        skills: ["SQL", "Excel", "Power BI / Tableau", "Business sense", "Storytelling"],
        steps: ["Excel + SQL fundamentals", "Dashboards (Power BI / Tableau)", "Business metrics & KPIs", "Data storytelling", "Optionally pivot toward DE/DS"],
        roadmap: "#/page/roadmap-data-analyst" },
    };
    var keys = Object.keys(roles);
    body.innerHTML = '<div class="role-pick" id="rolePick"></div><div id="roleDetail"></div>';
    var pick = body.querySelector("#rolePick");
    keys.forEach(function (k) {
      var r = roles[k];
      var b = document.createElement("button"); b.className = "role-opt"; b.dataset.k = k;
      b.innerHTML = '<div class="ro-name">' + k + '</div><div class="ro-tag">' + r.tag + "</div>";
      pick.appendChild(b);
    });
    var detail = body.querySelector("#roleDetail");
    function show(k) {
      var r = roles[k];
      pick.querySelectorAll(".role-opt").forEach(function (b) { b.classList.toggle("active", b.dataset.k === k); });
      detail.innerHTML = '<div class="role-detail"><h4>' + k + "</h4><p style=\"margin:2px 0 0\">" + r.one + "</p>" +
        '<div class="rd-skills">' + r.skills.map(function (s) { return "<span>" + s + "</span>"; }).join("") + "</div>" +
        "<strong style=\"font-size:13px\">Your roadmap at a glance:</strong><ul class=\"rd-steps\">" + r.steps.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ul>" +
        '<div class="rd-cta" style="display:flex;gap:9px;flex-wrap:wrap">' +
          '<a class="btn btn-primary" href="' + r.roadmap + '">' + window.icon("route", "ic-sm") + " Open the " + k + " roadmap</a>" +
          '<a class="btn btn-ghost" href="#/page/role-comparison-table">' + window.icon("grid", "ic-sm") + " Compare all roles</a>" +
        "</div></div>";
    }
    pick.querySelectorAll(".role-opt").forEach(function (b) { b.addEventListener("click", function () { show(b.dataset.k); }); });
    show("Data Engineer");
  };

  /* ---------- 10. SQL window functions ---------- */
  W.windowFn = function (mount) {
    var body = shell(mount, { icon: "grid", title: "Window functions, visualised", sub: "PARTITION BY + ORDER BY — without collapsing rows", tag: "Try it" });
    var rows = [{ c: "A", amt: 100 }, { c: "A", amt: 50 }, { c: "A", amt: 75 }, { c: "B", amt: 200 }, { c: "B", amt: 90 }];
    var fns = {
      "ROW_NUMBER()": function (part) { return part.map(function (_, i) { return i + 1; }); },
      "SUM() running": function (part) { var s = 0; return part.map(function (r) { s += r.amt; return s; }); },
      "RANK() by amt": function (part) { var sorted = part.slice().sort(function (a, b) { return b.amt - a.amt; }); return part.map(function (r) { return sorted.indexOf(r) + 1; }); },
    };
    var sql = { "ROW_NUMBER()": "ROW_NUMBER() OVER (PARTITION BY cust ORDER BY ts)", "SUM() running": "SUM(amt) OVER (PARTITION BY cust ORDER BY ts)", "RANK() by amt": "RANK() OVER (PARTITION BY cust ORDER BY amt DESC)" };
    body.innerHTML = '<div class="widget-controls" id="wfBtns"></div>' +
      '<div class="cap-scenario" id="wfSql" style="margin-bottom:12px;font-family:var(--mono);font-size:12.5px"></div>' +
      '<div id="wfTable"></div>' +
      '<div class="w-hint">A window function adds a value computed across the related rows (the "window") <b>without merging them</b> — unlike GROUP BY you keep every row. PARTITION BY restarts per group; ORDER BY sets the sequence.</div>';
    var btns = body.querySelector("#wfBtns");
    Object.keys(fns).forEach(function (k) { var b = document.createElement("button"); b.className = "w-btn"; b.textContent = k; b.dataset.k = k; btns.appendChild(b); });
    function render(fnKey) {
      body.querySelectorAll("#wfBtns .w-btn").forEach(function (b) { b.classList.toggle("active", b.dataset.k === fnKey); });
      body.querySelector("#wfSql").textContent = sql[fnKey];
      var byPart = {}; rows.forEach(function (r) { (byPart[r.c] = byPart[r.c] || []).push(r); });
      var resByRow = new Map();
      Object.keys(byPart).forEach(function (c) { var res = fns[fnKey](byPart[c]); byPart[c].forEach(function (r, i) { resByRow.set(r, res[i]); }); });
      var t = '<table class="w-table"><thead><tr><th>cust</th><th>amt</th><th>' + fnKey + "</th></tr></thead><tbody>";
      rows.forEach(function (r, i) { t += '<tr data-i="' + i + '"><td>' + r.c + "</td><td>" + r.amt + '</td><td class="wf-res"></td></tr>'; });
      body.querySelector("#wfTable").innerHTML = t + "</tbody></table>";
      var trs = body.querySelectorAll("#wfTable tbody tr");
      var step = 0;
      function fill() { if (step >= rows.length) return; var row = trs[step]; if (!row) return; var cell = row.querySelector(".wf-res"); if (cell) cell.textContent = resByRow.get(rows[step]); row.classList.add("w-row-new"); step++; var t = setTimeout(fill, 300); addTimer(t); }
      fill();
    }
    btns.querySelectorAll(".w-btn").forEach(function (b) { b.addEventListener("click", function () { render(b.dataset.k); }); });
    render("ROW_NUMBER()");
  };

  /* ---------- 11. Normalization before/after ---------- */
  W.normalization = function (mount) {
    var body = shell(mount, { icon: "database", title: "Normalization, before & after", sub: "One fact, stored in one place", tag: "Try it" });
    body.innerHTML = '<div class="widget-controls"><button class="w-btn active" id="nDe">Denormalized (redundant)</button><button class="w-btn" id="nNo">Normalized (3NF)</button></div>' +
      '<div id="nView"></div><div class="w-hint" id="nHint"></div>';
    var de = '<table class="w-table"><thead><tr><th>order_id</th><th>product</th><th>cust_name</th><th>cust_city</th></tr></thead><tbody>' +
      "<tr><td>1</td><td>Book</td><td>Ravi</td><td>Mumbai</td></tr>" +
      '<tr><td>2</td><td>Pen</td><td class="dup">Ravi</td><td class="dup">Mumbai</td></tr>' +
      "<tr><td>3</td><td>Bag</td><td>Sara</td><td>Delhi</td></tr>" +
      '<tr><td>4</td><td>Hat</td><td class="dup">Ravi</td><td class="dup">Mumbai</td></tr></tbody></table>';
    function showDe() { body.querySelector("#nView").innerHTML = de; body.querySelector("#nHint").innerHTML = "Ravi's name &amp; city repeat on every order (highlighted). Move Ravi and you must update many rows — an <b>update anomaly</b>."; }
    function showNo() {
      body.querySelector("#nView").innerHTML = '<div class="two-col"><div><h6 class="tcap">customers</h6><table class="w-table"><thead><tr><th>id</th><th>name</th><th>city</th></tr></thead><tbody><tr class="w-row-new"><td>1</td><td>Ravi</td><td>Mumbai</td></tr><tr class="w-row-new"><td>2</td><td>Sara</td><td>Delhi</td></tr></tbody></table></div>' +
        '<div><h6 class="tcap">orders</h6><table class="w-table"><thead><tr><th>order_id</th><th>product</th><th>cust_id</th></tr></thead><tbody><tr class="w-row-new"><td>1</td><td>Book</td><td>1</td></tr><tr class="w-row-new"><td>2</td><td>Pen</td><td>1</td></tr><tr class="w-row-new"><td>3</td><td>Bag</td><td>2</td></tr><tr class="w-row-new"><td>4</td><td>Hat</td><td>1</td></tr></tbody></table></div></div>';
      body.querySelector("#nHint").innerHTML = "Customer stored <b>once</b>; orders reference <code>cust_id</code>. Move Ravi by editing ONE row. No anomalies — that's 3NF.";
    }
    body.querySelector("#nDe").addEventListener("click", function () { this.classList.add("active"); body.querySelector("#nNo").classList.remove("active"); showDe(); });
    body.querySelector("#nNo").addEventListener("click", function () { this.classList.add("active"); body.querySelector("#nDe").classList.remove("active"); showNo(); });
    showDe();
  };

  /* ---------- 12. Medallion refine ---------- */
  W.medallion = function (mount) {
    var body = shell(mount, { icon: "layers", title: "Medallion: Bronze to Gold", sub: "Watch raw data refine layer by layer", tag: "Live" });
    var stages = [{ t: "Bronze", s: "raw, as-ingested" }, { t: "Silver", s: "cleaned & typed" }, { t: "Gold", s: "business aggregates" }];
    var content = [
      "<code> mumbai </code>, <code>MUMBAI</code> (dup), <code>delhi</code>, <code>null</code> amount — messy, exactly as received.",
      "<code>Mumbai</code>, <code>Mumbai</code>, <code>Delhi</code> — trimmed, cased, de-duplicated, nulls fixed, typed.",
      "<code>Mumbai &rarr; 120</code>, <code>Delhi &rarr; 90</code> — aggregated, ready for dashboards &amp; ML.",
    ];
    body.innerHTML = '<div class="flow">' + stages.map(function (s, i) { return '<div class="flow-stage"><div class="flow-box" data-i="' + i + '"><div class="fb-title">' + s.t + '</div><div class="fb-sub">' + s.s + "</div></div>" + (i < 2 ? '<span class="flow-arrow">' + window.icon("arrowRight", "ic-sm") + "</span>" : "") + "</div>"; }).join("") + "</div>" +
      '<div class="cap-scenario" id="medData" style="margin-top:14px"></div>' +
      '<div class="widget-controls" style="margin-top:12px"><button class="w-btn primary" id="medPlay">' + window.icon("play", "ic-sm") + " Replay</button></div>";
    var boxes = body.querySelectorAll(".flow-box"); var dataEl = body.querySelector("#medData"); var i = 0;
    function step() { boxes.forEach(function (b) { b.classList.remove("lit"); }); if (boxes[i]) boxes[i].classList.add("lit"); if (dataEl) dataEl.innerHTML = "<b>" + stages[i].t + "</b> — " + content[i]; i = (i + 1) % 3; }
    step(); var iv = setInterval(step, 1700); addTimer(iv);
    body.querySelector("#medPlay").addEventListener("click", function () { i = 0; step(); });
  };

  /* ---------- 13. Embeddings space ---------- */
  W.embeddings = function (mount) {
    var body = shell(mount, { icon: "network", title: "Embeddings: meaning as geometry", sub: "Click a word — its nearest neighbours light up", tag: "Try it" });
    var words = [
      { w: "king", x: 22, y: 26 }, { w: "queen", x: 30, y: 17 }, { w: "prince", x: 15, y: 35 }, { w: "throne", x: 30, y: 34 },
      { w: "dog", x: 72, y: 24 }, { w: "cat", x: 82, y: 31 }, { w: "puppy", x: 66, y: 35 }, { w: "kitten", x: 85, y: 21 },
      { w: "pizza", x: 50, y: 80 }, { w: "burger", x: 41, y: 73 }, { w: "pasta", x: 60, y: 73 }, { w: "sushi", x: 50, y: 90 },
    ];
    body.innerHTML = '<div class="emb-space" id="embSpace"><svg class="emb-svg" id="embSvg"></svg></div><div class="w-hint" id="embHint"></div>';
    var space = body.querySelector("#embSpace"); var svg = body.querySelector("#embSvg");
    words.forEach(function (o, i) { var d = document.createElement("button"); d.className = "emb-dot"; d.textContent = o.w; d.style.left = o.x + "%"; d.style.top = o.y + "%"; d.dataset.i = i; space.appendChild(d); });
    var dist = function (a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); };
    function sel(i) {
      var dots = space.querySelectorAll(".emb-dot");
      dots.forEach(function (d) { d.classList.remove("sel", "near"); });
      svg.innerHTML = ""; if (!dots[i]) return; dots[i].classList.add("sel");
      var near = words.map(function (o, j) { return { j: j, d: dist(words[i], o) }; }).filter(function (x) { return x.j !== i; }).sort(function (a, b) { return a.d - b.d; }).slice(0, 3);
      near.forEach(function (n) {
        if (dots[n.j]) dots[n.j].classList.add("near");
        var l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        l.setAttribute("x1", words[i].x + "%"); l.setAttribute("y1", words[i].y + "%"); l.setAttribute("x2", words[n.j].x + "%"); l.setAttribute("y2", words[n.j].y + "%"); svg.appendChild(l);
      });
      body.querySelector("#embHint").innerHTML = "<b>" + words[i].w + "</b> is closest to <b>" + near.map(function (n) { return words[n.j].w; }).join(", ") + "</b> — same meaning-cluster. That's how vector search &amp; RAG find relevant text.";
    }
    space.querySelectorAll(".emb-dot").forEach(function (d) { d.addEventListener("click", function () { sel(+d.dataset.i); }); });
    sel(0);
  };

  /* ---------- 14. ACID atomicity ---------- */
  W.acidTxn = function (mount) {
    var body = shell(mount, { icon: "database", title: "ACID atomicity — all or nothing", sub: "Transfer money, then crash mid-way", tag: "Try it" });
    body.innerHTML = '<div class="acct"><div class="box" id="acctA"><div>Account A</div><div class="bal" id="balA">100</div></div>' +
      '<div class="box" id="acctB"><div>Account B</div><div class="bal" id="balB">50</div></div></div>' +
      '<div class="widget-controls"><button class="w-btn primary" id="txOk">Transfer 30: A &rarr; B</button><button class="w-btn" id="txCrash">Transfer + crash mid-way</button><button class="w-btn" id="txReset">' + window.icon("refresh", "ic-sm") + " Reset</button></div>" +
      '<div class="cap-scenario" id="txLog"></div>';
    var A = 100, B = 50;
    var balA = body.querySelector("#balA"), balB = body.querySelector("#balB"), log = body.querySelector("#txLog");
    function render() { balA.textContent = A; balB.textContent = B; }
    function flash(id) { var el = body.querySelector(id); el.classList.add("flash"); var t = setTimeout(function () { el.classList.remove("flash"); }, 500); addTimer(t); }
    function reset() { A = 100; B = 50; render(); log.innerHTML = "A transfer is TWO steps: debit A, then credit B. <b>Atomicity</b> = both happen, or neither."; }
    function ok() { reset(); log.innerHTML = "Step 1: debit A by 30…"; A -= 30; render(); flash("#acctA"); var t = setTimeout(function () { log.innerHTML = "Step 2: credit B by 30 — <b>committed.</b> Both steps done; totals consistent."; B += 30; render(); flash("#acctB"); }, 750); addTimer(t); }
    function crash() { reset(); log.innerHTML = "Step 1: debit A by 30…"; A -= 30; render(); flash("#acctA"); var t = setTimeout(function () { log.innerHTML = "<b style=\"color:var(--red)\">Crash before crediting B!</b> Without atomicity, 30 would vanish. → The transaction <b>rolls back</b>: A is restored."; A += 30; render(); flash("#acctA"); }, 950); addTimer(t); }
    body.querySelector("#txOk").addEventListener("click", ok);
    body.querySelector("#txCrash").addEventListener("click", crash);
    body.querySelector("#txReset").addEventListener("click", reset);
    reset();
  };

  /* ---------- 15. Batch vs streaming ---------- */
  W.batchStream = function (mount) {
    var body = shell(mount, { icon: "flow", title: "Batch vs streaming", sub: "Same events, very different latency", tag: "Live" });
    body.innerHTML = '<div class="two-col">' +
      '<div class="lane"><h6>Batch (flush every few ticks)</h6><div id="batchDots"></div><div class="proc-count" id="batchMsg"></div></div>' +
      '<div class="lane"><h6>Streaming (as it arrives)</h6><div id="streamDots"></div><div class="proc-count" id="streamMsg"></div></div></div>' +
      '<div class="widget-controls" style="margin-top:12px"><button class="w-btn primary" id="bsPlay">' + window.icon("play", "ic-sm") + " Replay</button></div>" +
      '<div class="w-hint">Both lanes get the same events. <b>Streaming</b> processes each instantly (low latency). <b>Batch</b> lets them pile up and processes them together every few ticks (simpler/cheaper, higher latency).</div>';
    var bDots = body.querySelector("#batchDots"), sDots = body.querySelector("#streamDots"), bMsg = body.querySelector("#batchMsg"), sMsg = body.querySelector("#streamMsg");
    var n, streamDone, iv;
    function dot() { var d = document.createElement("span"); d.className = "bs-dot pending"; return d; }
    function tick() {
      if (n >= 9) { clearInterval(iv); return; }
      n++;
      var bd = dot(), sd = dot(); bDots.appendChild(bd); sDots.appendChild(sd);
      var t = setTimeout(function () { sd.className = "bs-dot done"; streamDone++; sMsg.innerHTML = "processed <b>" + streamDone + "</b> · latency ~instant"; }, 130); addTimer(t);
      if (n % 3 === 0) { bDots.querySelectorAll(".bs-dot.pending").forEach(function (p) { p.className = "bs-dot done"; }); bMsg.innerHTML = "batch flush — processed <b>" + n + "</b> at once · latency up to 3 ticks"; }
      else { bMsg.innerHTML = bDots.querySelectorAll(".pending").length + " waiting for next batch…"; }
    }
    function reset() { bDots.innerHTML = ""; sDots.innerHTML = ""; n = 0; streamDone = 0; bMsg.textContent = "waiting…"; sMsg.textContent = "waiting…"; if (iv) clearInterval(iv); iv = setInterval(tick, 800); addTimer(iv); }
    body.querySelector("#bsPlay").addEventListener("click", reset);
    reset();
  };

  /* ---------- registry + mounting ---------- */
  function mountAll(root) {
    clearAll();
    (root || document).querySelectorAll(".widget-mount[data-widget]").forEach(function (el) {
      var id = el.dataset.widget;
      if (W[id] && !el.dataset.mounted) {
        try { W[id](el); el.dataset.mounted = "1"; } catch (e) { console.warn("widget failed:", id, e); }
      }
    });
  }

  window.WIDGETS = W;
  window.mountAllWidgets = mountAll;
  window.clearWidgetTimers = clearAll;
})();
