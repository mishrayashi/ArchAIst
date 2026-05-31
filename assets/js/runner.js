/* ===========================================================
   runner.js — collapsible in-browser code runner.
   Python via Pyodide (WASM) + SQL via sql.js (SQLite WASM),
   both lazy-loaded from CDN on first Run. PySpark is explained
   (it needs a JVM/Spark cluster — can't run in a browser).
   Works when the site is served (GitHub Pages / local server).
   =========================================================== */
(function () {
  if (!document || !document.body) return;

  var PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  var SQLJS_BASE = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/";

  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
  var ic = function (n, c) { return window.icon ? window.icon(n, c) : ""; };

  var samples = {
    python: "# Real Python, running in your browser (Pyodide).\n# Try editing and hit Run.\nnums = [30, 32, 35, 31, 29, 28, 33]\nprint(\"average:\", sum(nums) / len(nums))\nprint(\"hot days:\", [n for n in nums if n > 31])\n\n# pandas works too (loads on first use):\n# import pandas as pd\n# df = pd.DataFrame({'city':['Mumbai','Delhi','Mumbai'], 'sales':[120,340,90]})\n# print(df.groupby('city')['sales'].sum())\n",
    sql: "-- Real SQLite, running in your browser (sql.js).\n-- Sample tables: customers(id,name,city), orders(id,cust_id,product,amount)\nSELECT c.name, SUM(o.amount) AS total_spent\nFROM customers c\nJOIN orders o ON c.id = o.cust_id\nGROUP BY c.name\nORDER BY total_spent DESC;\n",
    pyspark: "# PySpark can't run in a browser — see the note above.\n# The DataFrame logic is nearly identical to pandas, e.g.:\n#   df.filter(F.col('amount') > 0).groupBy('city').agg(F.sum('amount'))\n",
  };
  var state = { tab: "python", code: { python: samples.python, sql: samples.sql, pyspark: samples.pyspark }, pyodide: null, SQL: null, db: null, loading: false };

  /* ---- build UI ---- */
  var toggle = document.createElement("button");
  toggle.className = "runner-toggle";
  toggle.innerHTML = ic("terminal", "ic-sm") + " Code";
  document.body.appendChild(toggle);

  var panel = document.createElement("div");
  panel.className = "runner-panel";
  panel.innerHTML =
    '<div class="runner-head"><span class="w-ic">' + ic("terminal") + "</span>" +
    '<div class="rh-title">Code Runner<small>run Python &amp; SQL right here</small></div>' +
    '<button class="runner-close" id="runnerClose" title="Close">' + ic("arrowRight", "ic-sm") + "</button></div>" +
    '<div class="runner-tabs">' +
      '<button class="runner-tab active" data-tab="python">Python</button>' +
      '<button class="runner-tab" data-tab="sql">SQL</button>' +
      '<button class="runner-tab" data-tab="pyspark">PySpark</button>' +
    "</div>" +
    '<div class="runner-body">' +
      '<div class="runner-note" id="runnerNote" style="display:none"></div>' +
      '<textarea class="runner-editor" id="runnerEditor" spellcheck="false"></textarea>' +
      '<div class="runner-actions">' +
        '<button class="w-btn primary" id="runnerRun">' + ic("play", "ic-sm") + " Run</button>" +
        '<button class="w-btn" id="runnerReset">' + ic("refresh", "ic-sm") + " Reset</button>" +
        '<span class="runner-status" id="runnerStatus"></span>' +
      "</div>" +
      '<div class="runner-out-label">Output</div>' +
      '<pre class="runner-output" id="runnerOutput">Ready. Write some code and hit Run.</pre>' +
    "</div>";
  document.body.appendChild(panel);

  var editor = panel.querySelector("#runnerEditor");
  var output = panel.querySelector("#runnerOutput");
  var statusEl = panel.querySelector("#runnerStatus");
  var note = panel.querySelector("#runnerNote");
  var runBtn = panel.querySelector("#runnerRun");

  function open() { panel.classList.add("open"); toggle.classList.add("hidden"); }
  function close() { panel.classList.remove("open"); toggle.classList.remove("hidden"); }
  toggle.addEventListener("click", open);
  panel.querySelector("#runnerClose").addEventListener("click", close);

  function setStatus(s) { statusEl.textContent = s || ""; }
  function setOutput(html, isErr) { output.innerHTML = isErr ? '<span class="err">' + esc(html) + "</span>" : html; }

  function selectTab(tab) {
    state.code[state.tab] = editor.value; // save current
    state.tab = tab;
    panel.querySelectorAll(".runner-tab").forEach(function (b) { b.classList.toggle("active", b.dataset.tab === tab); });
    editor.value = state.code[tab];
    if (tab === "pyspark") {
      note.style.display = "";
      note.innerHTML = "<b>PySpark can't run in a browser.</b> Spark needs a Java/Spark cluster behind it — there's no JVM in the browser. But the DataFrame API mirrors <b>pandas</b> almost 1:1, so switch to the <b>Python</b> tab and use pandas to practise the same logic.";
      runBtn.disabled = true; runBtn.style.opacity = ".5";
    } else {
      note.style.display = "none";
      runBtn.disabled = false; runBtn.style.opacity = "1";
    }
    setStatus("");
  }
  panel.querySelectorAll(".runner-tab").forEach(function (b) { b.addEventListener("click", function () { selectTab(b.dataset.tab); }); });

  panel.querySelector("#runnerReset").addEventListener("click", function () {
    editor.value = samples[state.tab]; state.code[state.tab] = samples[state.tab];
    setOutput("Ready. Write some code and hit Run.");
  });

  // Tab key inserts two spaces
  editor.addEventListener("keydown", function (e) {
    if (e.key === "Tab") { e.preventDefault(); var s = editor.selectionStart, en = editor.selectionEnd;
      editor.value = editor.value.slice(0, s) + "  " + editor.value.slice(en); editor.selectionStart = editor.selectionEnd = s + 2; }
  });

  /* ---- lazy script loader ---- */
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script"); s.src = src; s.onload = resolve;
      s.onerror = function () { reject(new Error("Failed to load " + src)); };
      document.head.appendChild(s);
    });
  }
  var offlineMsg = "Couldn't load the engine. The code runner downloads a small engine the first time, so it needs an internet connection once (or host the site on GitHub Pages). After that, run all you like.";

  /* ---- Python ---- */
  async function ensurePyodide() {
    if (state.pyodide) return state.pyodide;
    setStatus("loading Python engine… (first time, a few seconds)");
    if (!window.loadPyodide) await loadScript(PYODIDE_BASE + "pyodide.js");
    state.pyodide = await window.loadPyodide({ indexURL: PYODIDE_BASE });
    return state.pyodide;
  }
  async function runPython() {
    var code = editor.value; setOutput("Running…"); setStatus("");
    try {
      var py = await ensurePyodide();
      var buf = [];
      py.setStdout({ batched: function (s) { buf.push(s); } });
      py.setStderr({ batched: function (s) { buf.push(s); } });
      setStatus("loading any imports…");
      try { await py.loadPackagesFromImports(code); } catch (e) {}
      setStatus("running…");
      var res = await py.runPythonAsync(code);
      var out = buf.join("");
      if (res !== undefined && res !== null) out += (out && !out.endsWith("\n") ? "\n" : "") + "=> " + String(res);
      setOutput(esc(out || "(no output)"));
      setStatus("done");
    } catch (e) {
      if (/Failed to load/.test(e.message)) setOutput(offlineMsg, true);
      else setOutput(String(e.message || e), true);
      setStatus("error");
    }
  }

  /* ---- SQL ---- */
  var SEED =
    "CREATE TABLE customers (id INTEGER, name TEXT, city TEXT);" +
    "INSERT INTO customers VALUES (1,'Ravi','Mumbai'),(2,'Sara','Delhi'),(3,'Amit','Mumbai');" +
    "CREATE TABLE orders (id INTEGER, cust_id INTEGER, product TEXT, amount REAL);" +
    "INSERT INTO orders VALUES (1,1,'Book',300),(2,1,'Pen',50),(3,2,'Bag',900),(4,4,'Hat',75);";
  async function ensureDb() {
    if (state.db) return state.db;
    setStatus("loading SQL engine…");
    if (!window.initSqlJs) await loadScript(SQLJS_BASE + "sql-wasm.js");
    state.SQL = await window.initSqlJs({ locateFile: function (f) { return SQLJS_BASE + f; } });
    state.db = new state.SQL.Database();
    state.db.run(SEED);
    return state.db;
  }
  async function runSQL() {
    var code = editor.value; setOutput("Running…"); setStatus("");
    try {
      var db = await ensureDb();
      var results = db.exec(code);
      if (!results.length) { setOutput("OK — statement executed (no rows returned)."); setStatus("done"); return; }
      var r = results[results.length - 1];
      var html = "<table><thead><tr>" + r.columns.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>";
      r.values.forEach(function (row) { html += "<tr>" + row.map(function (v) { return "<td>" + esc(v == null ? "NULL" : v) + "</td>"; }).join("") + "</tr>"; });
      html += "</tbody></table>";
      setOutput(html); setStatus(r.values.length + " row" + (r.values.length === 1 ? "" : "s"));
    } catch (e) {
      if (/Failed to load/.test(e.message)) setOutput(offlineMsg, true);
      else setOutput(String(e.message || e), true);
      setStatus("error");
    }
  }

  runBtn.addEventListener("click", function () {
    if (state.tab === "python") runPython();
    else if (state.tab === "sql") runSQL();
  });
  // Ctrl/Cmd+Enter to run
  editor.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runBtn.click(); }
  });

  selectTab("python");
})();
