/* ===========================================================
   md.js — tiny, dependency-free Markdown -> HTML renderer.
   Supports: headings, bold/italic, inline code, links, images,
   fenced code blocks (with language + copy button), blockquotes,
   nested lists, tables, hr, [[glossary refs]], and raw-HTML
   passthrough (any line beginning with an HTML tag — <div>,
   <details>, <ul>, <li>, <strong>, <span>, etc.). Inside raw
   lines, markdown bold / inline-code / links still convert but
   tags are preserved (not escaped).
   Good enough for teaching content; not a spec-complete parser.
   =========================================================== */
(function () {
  var OPEN = "", CLOSE = ""; // collision-proof code placeholders

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Shared inline replacements (links, images, [[refs]]) — no escaping.
  function inlineCommon(text) {
    text = text.replace(/\[\[([^\]]+)\]\]/g, "<em>$1</em>");
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" loading="lazy" />');
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, t, url) {
      var ext = /^https?:/.test(url) ? ' target="_blank" rel="noopener"' : "";
      return '<a href="' + url + '"' + ext + ">" + t + "</a>";
    });
    return text;
  }

  // Inline formatting for normal text: escapes HTML, supports italics.
  function inline(text) {
    var codes = [];
    text = text.replace(/`([^`]+)`/g, function (_, c) {
      codes.push("<code>" + escapeHtml(c) + "</code>");
      return OPEN + (codes.length - 1) + CLOSE;
    });
    text = escapeHtml(text);
    text = inlineCommon(text);
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    text = text.replace(/(^|[\s(])_([^_\n]+)_/g, "$1<em>$2</em>");
    text = text.replace(new RegExp(OPEN + "(\\d+)" + CLOSE, "g"), function (_, i) {
      return codes[+i];
    });
    return text;
  }

  // Inline formatting for raw-HTML lines: keep tags, still do code/bold/italic/links.
  function inlineRaw(text) {
    var codes = [];
    text = text.replace(/`([^`]+)`/g, function (_, c) {
      codes.push("<code>" + escapeHtml(c) + "</code>");
      return OPEN + (codes.length - 1) + CLOSE;
    });
    text = inlineCommon(text);
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    text = text.replace(/(^|[\s(])_([^_\n]+)_/g, "$1<em>$2</em>");
    text = text.replace(new RegExp(OPEN + "(\\d+)" + CLOSE, "g"), function (_, i) {
      return codes[+i];
    });
    return text;
  }

  function renderTable(rows) {
    var cells = function (line) {
      return line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(function (c) { return c.trim(); });
    };
    var header = cells(rows[0]);
    var body = rows.slice(2).map(cells);
    var html = "<table><thead><tr>";
    header.forEach(function (h) { html += "<th>" + inline(h) + "</th>"; });
    html += "</tr></thead><tbody>";
    body.forEach(function (r) {
      html += "<tr>";
      r.forEach(function (c) { html += "<td>" + inline(c) + "</td>"; });
      html += "</tr>";
    });
    return html + "</tbody></table>";
  }

  // Build nested list HTML from a slice of lines that are all list items.
  function renderList(lines) {
    var items = lines.map(function (l) {
      var m = l.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
      var indent = m[1].replace(/\t/g, "  ").length;
      var ordered = /\d+\./.test(m[2]);
      return { level: Math.floor(indent / 2), ordered: ordered, text: m[3] };
    });
    var html = "";
    var stack = [];
    var prevLevel = -1;
    items.forEach(function (it) {
      if (it.level > prevLevel) {
        for (var k = prevLevel; k < it.level; k++) {
          html += it.ordered ? "<ol>" : "<ul>";
          stack.push(it.ordered);
        }
      } else if (it.level < prevLevel) {
        for (var k2 = it.level; k2 < prevLevel; k2++) {
          html += stack.pop() ? "</ol>" : "</ul>";
        }
      }
      html += "<li>" + inline(it.text) + "</li>";
      prevLevel = it.level;
    });
    while (stack.length) html += stack.pop() ? "</ol>" : "</ul>";
    return html;
  }

  function mdToHtml(src) {
    if (!src) return "";
    var lines = src.replace(/\r\n/g, "\n").split("\n");
    var html = "";
    var i = 0;
    var para = [];

    function flushPara() {
      if (para.length) {
        html += "<p>" + inline(para.join(" ")) + "</p>";
        para = [];
      }
    }

    while (i < lines.length) {
      var line = lines[i];

      // fenced code block
      var fence = line.match(/^```(\w+)?\s*$/);
      if (fence) {
        flushPara();
        var lang = fence[1] || "";
        var buf = [];
        i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) {
          buf.push(lines[i]);
          i++;
        }
        i++; // skip closing fence
        var code = escapeHtml(buf.join("\n"));
        html +=
          '<div class="code-block">' +
          (lang ? '<span class="code-lang">' + lang + "</span>" : "") +
          '<button class="copy-btn" type="button">Copy</button>' +
          "<pre><code>" + code + "</code></pre></div>";
        continue;
      }

      // raw HTML block: starts with an HTML tag; continues until a blank line.
      // This lets multi-line islands (e.g. <div class="callout">…prose with
      // inline <em>/<strong>…</div>) pass through without escaping their tags.
      if (/^\s*<\/?[a-zA-Z][\w-]*/.test(line)) {
        flushPara();
        while (i < lines.length && !/^\s*$/.test(lines[i])) {
          html += inlineRaw(lines[i]) + "\n";
          i++;
        }
        continue;
      }

      // blank line
      if (/^\s*$/.test(line)) {
        flushPara();
        i++;
        continue;
      }

      // heading
      var h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        flushPara();
        var lvl = h[1].length;
        var id = h[2].toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
        html += "<h" + lvl + ' id="' + id + '">' + inline(h[2]) + "</h" + lvl + ">";
        i++;
        continue;
      }

      // hr
      if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
        flushPara();
        html += "<hr />";
        i++;
        continue;
      }

      // blockquote (may span multiple lines)
      if (/^\s*>\s?/.test(line)) {
        flushPara();
        var bq = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          bq.push(lines[i].replace(/^\s*>\s?/, ""));
          i++;
        }
        html += "<blockquote>" + mdToHtml(bq.join("\n")) + "</blockquote>";
        continue;
      }

      // table (header row + |---| separator)
      if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:\-|]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes("-")) {
        flushPara();
        var trows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) {
          trows.push(lines[i]);
          i++;
        }
        html += renderTable(trows);
        continue;
      }

      // list
      if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
        flushPara();
        var lrows = [];
        while (i < lines.length && (/^\s*([-*+]|\d+\.)\s+/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && lrows.length))) {
          lrows.push(lines[i]);
          i++;
        }
        html += renderList(lrows);
        continue;
      }

      // default: accumulate paragraph text
      para.push(line.trim());
      i++;
    }
    flushPara();
    return html;
  }

  window.mdToHtml = mdToHtml;
})();
