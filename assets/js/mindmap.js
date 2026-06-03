/* ===========================================================
   mindmap.js — interactive radial mind map of the whole academy.
   Topics (sections) fan out from a central root; click a topic to
   expand its sub-topics (lessons); click a lesson to open it.

   - Backbone is auto-derived from the LP registry (sections + pages),
     so it always mirrors the rest of the app after `python build.py`.
   - Optional hand-authored cross-links come from LP.getLinks()
     (populated only when a source/<group>/_links.json exists), drawn
     as dashed "see also" edges. Endpoints may be a page id, a section
     id, a reference route (interview/companies/glossary/progress) or
     "root".

   Pure runtime: theme-aware via CSS variables, no dependencies, no
   network. Exposes window.ArchMap.render(hostEl).
   Mirrors the widgets.js pattern (a window.* mount function).
   =========================================================== */
(function () {
  "use strict";

  var REF_ROUTES = [
    { id: "interview", title: "Interview Bank", href: "#/interview" },
    { id: "companies", title: "Company-wise Prep", href: "#/companies" },
    { id: "glossary", title: "Glossary", href: "#/glossary" },
    { id: "progress", title: "My Progress", href: "#/progress" },
  ];
  var REF_KEY = "__ref";
  var ROOT_KEY = "__root";
  var PROG_KEY = "lp.progress.v1";

  var ic = function (name, cls) { return window.icon ? window.icon(name, cls) : ""; };
  var icKey = function (key, cls) { return window.iconForKey ? window.iconForKey(key, cls) : ""; };

  function svgEl(tag, attrs) {
    var n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function elem(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function trim(s, n) { s = String(s); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ---------- build the graph model from the registry ---------- */
  function readProgress() {
    try { return JSON.parse(localStorage.getItem(PROG_KEY) || "{}"); }
    catch (e) { return {}; }
  }

  function buildModel() {
    var progress = readProgress();
    var sections = (window.LP ? LP.getSections() : []).filter(function (s) {
      return LP.getPages(s.id).length > 0;
    });

    var branches = sections.map(function (s) {
      var pages = LP.getPages(s.id);
      var done = pages.filter(function (p) { return progress[p.id]; }).length;
      return {
        key: s.id,
        kind: "section",
        title: s.title,
        blurb: s.blurb || "",
        iconKey: s.id,
        done: done,
        total: pages.length,
        children: pages.map(function (p) {
          return {
            key: "pg:" + p.id,
            kind: "lesson",
            id: p.id,
            title: p.title,
            blurb: (LP._sectionMap[p.section] || {}).title || "",
            level: p.level,
            minutes: p.minutes,
            href: "#/page/" + p.id,
            done: !!progress[p.id],
          };
        }),
      };
    });

    // synthetic "Prep & Reference" branch (mirrors the home page's 2nd row)
    branches.push({
      key: REF_KEY,
      kind: "section",
      title: "Prep & Reference",
      blurb: "Interview bank, company prep, glossary and your progress.",
      iconKey: "target",
      done: 0, total: 0,
      children: REF_ROUTES.map(function (r) {
        return { key: "route:" + r.id, kind: "ref", id: r.id, title: r.title, blurb: "", iconKey: r.id, href: r.href };
      }),
    });

    return {
      root: { key: ROOT_KEY, kind: "root", title: "ArchAIst", blurb: "From zero to AI architect — pick a branch." },
      branches: branches,
      links: (window.LP && LP.getLinks) ? LP.getLinks() : [],
    };
  }

  /* ---------- a single instance ---------- */
  function create(host) {
    var model = buildModel();
    var expanded = {};                 // section key -> true
    var tf = { x: 0, y: 0, s: 1 };     // world transform (world origin sits at viewport centre)
    var nodePos = {};                  // key -> {x,y} in world coords
    var nodeEls = {};                  // key -> element
    var edgeList = [];                 // { el, a, b }
    var adj = {};                      // key -> Set(keys)

    host.innerHTML = "";
    var wrap = elem("div", "mm");
    wrap.innerHTML =
      '<div class="mm-bar">' +
        '<div class="mm-legend">' +
          '<span class="mm-chip"><i class="mm-dot mm-dot-topic"></i>Topic</span>' +
          '<span class="mm-chip"><i class="mm-dot mm-dot-lesson"></i>Lesson</span>' +
          '<span class="mm-chip"><i class="mm-dot mm-dot-done"></i>Completed</span>' +
        '</div>' +
        '<div class="mm-actions">' +
          '<button class="mm-btn" data-act="expand" title="Expand every topic">' + ic("layers", "ic-sm") + ' Expand all</button>' +
          '<button class="mm-btn" data-act="collapse" title="Collapse to topics">' + ic("target", "ic-sm") + ' Collapse</button>' +
          '<span class="mm-zoom">' +
            '<button class="mm-btn mm-icon" data-act="out" title="Zoom out">&minus;</button>' +
            '<button class="mm-btn mm-icon" data-act="fit" title="Fit to screen">' + ic("refresh", "ic-sm") + '</button>' +
            '<button class="mm-btn mm-icon" data-act="in" title="Zoom in">+</button>' +
          '</span>' +
        '</div>' +
      '</div>' +
      '<div class="mm-viewport" tabindex="0" aria-label="Interactive topic map. Drag to pan, scroll to zoom, click a topic to expand.">' +
        '<div class="mm-world">' +
          '<svg class="mm-edges" width="1" height="1" aria-hidden="true"></svg>' +
        '</div>' +
        '<div class="mm-info" hidden></div>' +
        '<div class="mm-hint">Drag to pan · scroll to zoom · click a topic to branch</div>' +
      '</div>';
    host.appendChild(wrap);

    var viewport = wrap.querySelector(".mm-viewport");
    var world = wrap.querySelector(".mm-world");
    var edges = wrap.querySelector(".mm-edges");
    var info = wrap.querySelector(".mm-info");

    /* ----- layout: radial. Sections on a ring; children fan outward ----- */
    function layout() {
      nodePos = {};
      var N = model.branches.length || 1;
      var R1 = clamp(150 + N * 28, 230, 360);     // section ring radius
      nodePos[ROOT_KEY] = { x: 0, y: 0 };

      model.branches.forEach(function (b, i) {
        var a = (-Math.PI / 2) + (i * 2 * Math.PI / N);   // start at top, go clockwise
        var sx = R1 * Math.cos(a), sy = R1 * Math.sin(a);
        nodePos[b.key] = { x: sx, y: sy, angle: a };

        if (expanded[b.key] && b.children.length) {
          var c = b.children.length;
          var spread = clamp(c * 0.34, 0.5, 2.5);          // radians of the child fan
          var Rc = clamp(120 + c * 12, 140, 320);          // distance from section to children
          var start = a - spread / 2;
          var step = c > 1 ? spread / (c - 1) : 0;
          b.children.forEach(function (ch, j) {
            var ca = c > 1 ? start + j * step : a;
            nodePos[ch.key] = { x: sx + Rc * Math.cos(ca), y: sy + Rc * Math.sin(ca) };
          });
        }
      });
    }

    /* ----- adjacency (root↔section, section↔child, cross-links) ----- */
    function link(a, b) {
      (adj[a] = adj[a] || {})[b] = true;
      (adj[b] = adj[b] || {})[a] = true;
    }
    function buildAdjacency() {
      adj = {};
      model.branches.forEach(function (b) {
        link(ROOT_KEY, b.key);
        b.children.forEach(function (ch) { link(b.key, ch.key); });
      });
    }

    /* ----- draw ----- */
    function edgePath(p1, p2) {
      // gentle curve for a calmer, organic feel
      var mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
      var dx = p2.x - p1.x, dy = p2.y - p1.y;
      var nx = -dy, ny = dx, len = Math.hypot(nx, ny) || 1;
      var bow = clamp(Math.hypot(dx, dy) * 0.12, 6, 38);
      var cx = mx + (nx / len) * bow, cy = my + (ny / len) * bow;
      return "M" + p1.x + "," + p1.y + " Q" + cx + "," + cy + " " + p2.x + "," + p2.y;
    }

    function resolveKey(ref) {
      if (!ref || ref === "root") return ROOT_KEY;
      if (nodePos[ref]) return ref;                 // section id or page-less id
      if (nodePos["pg:" + ref]) return "pg:" + ref; // page id
      if (nodePos["route:" + ref]) return "route:" + ref;
      return null;
    }

    function draw() {
      buildAdjacency();
      edges.innerHTML = "";
      edgeList = [];
      // remove old nodes (keep the <svg>)
      Array.prototype.slice.call(world.querySelectorAll(".mm-node")).forEach(function (n) { n.remove(); });
      nodeEls = {};

      function addEdge(aKey, bKey, cls) {
        var p1 = nodePos[aKey], p2 = nodePos[bKey];
        if (!p1 || !p2) return;
        var path = svgEl("path", { d: edgePath(p1, p2), class: "mm-edge " + (cls || "") });
        edges.appendChild(path);
        edgeList.push({ el: path, a: aKey, b: bKey });
      }

      // backbone edges
      model.branches.forEach(function (b) {
        addEdge(ROOT_KEY, b.key, "mm-edge-trunk");
        if (expanded[b.key]) b.children.forEach(function (ch) { addEdge(b.key, ch.key, "mm-edge-branch"); });
      });
      // cross-links (hybrid hand-authored layer) — only when both ends are visible
      model.links.forEach(function (lk) {
        var a = resolveKey(lk.from), b = resolveKey(lk.to);
        if (a && b && a !== b) addEdge(a, b, "mm-edge-cross");
      });

      // nodes
      addNode(model.root);
      model.branches.forEach(function (b) {
        addNode(b);
        if (expanded[b.key]) b.children.forEach(addNode);
      });

      applyTransform();
    }

    function addNode(n) {
      var p = nodePos[n.key];
      if (!p) return;
      var node, label;
      var isOpen = n.kind === "section" && expanded[n.key];

      if (n.kind === "lesson" || n.kind === "ref") {
        node = elem("a", "mm-node mm-leaf" + (n.done ? " is-done" : ""));
        node.href = n.href;
        label =
          '<span class="mm-leaf-ic">' + (n.kind === "ref" ? icKey(n.iconKey, "ic-sm") : (n.done ? ic("check", "ic-sm") : "")) + '</span>' +
          '<span class="mm-leaf-t">' + trim(n.title, 30) + "</span>";
      } else if (n.kind === "section") {
        node = elem("button", "mm-node mm-topic" + (isOpen ? " is-open" : ""));
        node.type = "button";
        var meta = n.total ? '<span class="mm-topic-count">' + n.done + "/" + n.total + "</span>" : "";
        label =
          '<span class="mm-topic-ic">' + icKey(n.iconKey) + "</span>" +
          '<span class="mm-topic-t">' + n.title + "</span>" + meta;
      } else {
        node = elem("button", "mm-node mm-root");
        node.type = "button";
        label = '<span class="mm-root-mark">' + ic("logo") + "</span><span class=\"mm-root-t\">" + n.title + "</span>";
      }

      node.innerHTML = label;
      node.dataset.key = n.key;
      node.title = n.title + (n.blurb ? " — " + n.blurb : "");
      node.style.left = p.x + "px";
      node.style.top = p.y + "px";
      node.addEventListener("mouseenter", function () { highlight(n.key); showInfo(n); });
      node.addEventListener("mouseleave", function () { highlight(null); });
      node.addEventListener("focus", function () { highlight(n.key); showInfo(n); });
      node.addEventListener("blur", function () { highlight(null); });

      if (n.kind === "section") {
        node.addEventListener("click", function (e) { e.preventDefault(); toggle(n.key); });
      } else if (n.kind === "root") {
        node.addEventListener("click", function (e) { e.preventDefault(); collapseAll(); fit(); });
      }
      // leaf/ref are <a> — native navigation handles the click

      world.appendChild(node);
      nodeEls[n.key] = node;
    }

    /* ----- transform / pan / zoom ----- */
    function applyTransform() {
      world.style.transform = "translate(" + tf.x + "px," + tf.y + "px) scale(" + tf.s + ")";
    }
    function fit() {
      var xs = [], ys = [];
      for (var k in nodePos) { xs.push(nodePos[k].x); ys.push(nodePos[k].y); }
      if (!xs.length) return;
      var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
      var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
      var pad = 130;
      var bw = (maxX - minX) + pad * 2, bh = (maxY - minY) + pad * 2;
      var vw = viewport.clientWidth || 800, vh = viewport.clientHeight || 520;
      tf.s = clamp(Math.min(vw / bw, vh / bh), 0.4, 1.15);
      var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
      tf.x = -cx * tf.s; tf.y = -cy * tf.s;
      applyTransform();
    }
    function zoomAt(factor, px, py) {
      var rect = viewport.getBoundingClientRect();
      // pointer position relative to viewport centre (world origin)
      var ox = (px - rect.left) - rect.width / 2;
      var oy = (py - rect.top) - rect.height / 2;
      var ns = clamp(tf.s * factor, 0.3, 2.4);
      var k = ns / tf.s;
      tf.x = ox - (ox - tf.x) * k;
      tf.y = oy - (oy - tf.y) * k;
      tf.s = ns;
      applyTransform();
    }

    /* ----- highlight connected nodes/edges on hover ----- */
    function highlight(key) {
      if (!key) {
        world.classList.remove("mm-dim");
        edgeList.forEach(function (e) { e.el.classList.remove("is-active"); });
        for (var k in nodeEls) nodeEls[k].classList.remove("is-active");
        return;
      }
      world.classList.add("mm-dim");
      var near = adj[key] || {};
      for (var nk in nodeEls) {
        nodeEls[nk].classList.toggle("is-active", nk === key || !!near[nk]);
      }
      edgeList.forEach(function (e) {
        e.el.classList.toggle("is-active", e.a === key || e.b === key);
      });
    }

    function showInfo(n) {
      var meta = "";
      if (n.kind === "section" && n.total) meta = n.done + " of " + n.total + " lessons done";
      else if (n.kind === "lesson") meta = (n.level || "") + (n.minutes ? " · " + n.minutes + " min" : "");
      info.innerHTML = '<strong>' + n.title + "</strong>" +
        (meta ? '<span class="mm-info-meta">' + meta + "</span>" : "") +
        (n.blurb ? '<span class="mm-info-blurb">' + n.blurb + "</span>" : "");
      info.hidden = false;
    }

    /* ----- expand / collapse ----- */
    function toggle(key) {
      expanded[key] = !expanded[key];
      layout(); draw();
    }
    function expandAll() { model.branches.forEach(function (b) { expanded[b.key] = true; }); layout(); draw(); fit(); }
    function collapseAll() { expanded = {}; layout(); draw(); }

    /* ----- interactions ----- */
    wrap.querySelector(".mm-bar").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-act]"); if (!btn) return;
      var act = btn.dataset.act;
      if (act === "expand") expandAll();
      else if (act === "collapse") { collapseAll(); fit(); }
      else if (act === "fit") fit();
      else if (act === "in") zoomAt(1.2, vpCenter().x, vpCenter().y);
      else if (act === "out") zoomAt(1 / 1.2, vpCenter().x, vpCenter().y);
    });
    function vpCenter() { var r = viewport.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

    // wheel zoom
    viewport.addEventListener("wheel", function (e) {
      e.preventDefault();
      zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX, e.clientY);
    }, { passive: false });

    // drag to pan — only when grabbing empty space (not a node)
    var drag = null;
    viewport.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".mm-node")) return;          // let nodes handle their own clicks
      drag = { x: e.clientX, y: e.clientY, tx: tf.x, ty: tf.y };
      viewport.classList.add("is-grabbing");
      var move = function (ev) {
        if (!drag) return;
        tf.x = drag.tx + (ev.clientX - drag.x);
        tf.y = drag.ty + (ev.clientY - drag.y);
        applyTransform();
      };
      var up = function () {
        drag = null; viewport.classList.remove("is-grabbing");
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    });

    // first paint — wait one frame so the viewport has measured dimensions
    layout(); draw();
    requestAnimationFrame(fit);
    // re-fit if the container resizes (e.g. sidebar toggle, rotate)
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { /* keep current view; user can hit Fit */ });
      ro.observe(viewport);
    }

    return wrap;
  }

  window.ArchMap = {
    render: function (host) {
      if (!host) return;
      try { return create(host); }
      catch (e) { console.warn("mindmap failed:", e); host.innerHTML = ""; }
    },
  };
})();
