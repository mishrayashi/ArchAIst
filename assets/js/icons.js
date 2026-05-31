/* icons.js — inline SVG line icons. Zero emoji.
   Usage: icon("home"), icon("home","ic-lg"). Returns an <svg> string. */
(function () {
  var P = {
    logo: '<path d="M5 7l7-4 7 4v10l-7 4-7-4z"/><path d="M12 3v18M5 7l7 4 7-4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>',
    moon: '<path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z"/>',
    route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H14a3.5 3.5 0 000-7H9a3.5 3.5 0 010-7h6.5"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M7 9l3 3-3 3M13 15h4"/>',
    cube: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 12l9-5M12 12v10M12 12L3 7"/>',
    message: '<path d="M21 15a3 3 0 01-3 3H8l-5 4V6a3 3 0 013-3h12a3 3 0 013 3z"/>',
    building: '<path d="M3 21h18M5 21V5a1 1 0 011-1h7a1 1 0 011 1v16M14 21V9h4a1 1 0 011 1v11"/><path d="M8 8h2M8 12h2M8 16h2"/>',
    book: '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M19 19H6a2 2 0 01-2-2"/>',
    chart: '<path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6" rx="1"/><rect x="12" y="7" width="3" height="10" rx="1"/><rect x="17" y="13" width="3" height="4" rx="1"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    chevronRight: '<path d="M9 6l6 6-6 6"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    sparkles: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    refresh: '<path d="M3 12a9 9 0 0115.5-6.3L21 8M21 3v5h-5"/><path d="M21 12a9 9 0 01-15.5 6.3L3 16M3 21v-5h5"/>',
    zap: '<path d="M13 2L4 14h7l-2 8 9-12h-7z"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    network: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4M10.5 13.5L7 17M13.5 13.5L17 17"/>',
    flow: '<rect x="3" y="4" width="6" height="6" rx="1.5"/><rect x="15" y="14" width="6" height="6" rx="1.5"/><path d="M9 7h4a2 2 0 012 2v5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    spark: '<path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  };

  // map section / route ids -> icon names
  var MAP = {
    home: "home",
    foundations: "layers",
    roles: "compass",
    roadmaps: "route",
    modules: "terminal",
    concepts: "cube",
    interview: "message",
    companies: "building",
    glossary: "book",
    progress: "chart",
  };

  function icon(name, cls) {
    var path = P[name] || P[MAP[name]] || "";
    return '<svg class="ic' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + path + "</svg>";
  }
  function iconForKey(key, cls) { return icon(MAP[key] || key, cls); }

  window.ICONS = P;
  window.ICON_MAP = MAP;
  window.icon = icon;
  window.iconForKey = iconForKey;
})();
