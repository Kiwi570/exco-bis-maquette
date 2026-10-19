/* Cartes du réseau (SVG) et moteur de recherche de cabinets — données réelles exco.fr */
(function () {
  "use strict";
  var EXCO = window.EXCO, GEO = window.EXCO_GEO, CABS = window.EXCO_CABINETS || [];
  var NS = "http://www.w3.org/2000/svg";

  EXCO.SERVICES = [
    "Expertise comptable", "Audit", "Conseil", "Social, paie et ressources humaines", "Juridique et fiscal",
    "Évaluation d'entreprise", "Exco finance et transactions", "Exco gestion privée", "International", "Formation"
  ];
  EXCO.ZONES = [["France", "France métropolitaine"], ["Outre-mer", "Outre-mer"], ["Europe", "Europe"], ["Afrique", "Afrique"]];

  /* ---------- projections ---------- */
  function projFr(lng, lat) {
    var f = GEO.fr;
    return [((lng - f.lng0) * f.c - f.minx) * f.k + f.pad, ((f.lat0 - lat) - f.miny) * f.k + f.pad];
  }
  function merc(lat) { return Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2)); }
  function projW(lng, lat) {
    var w = GEO.world;
    return [(lng - w.lngmin) * w.kx, (w.ytop - merc(lat)) * (180 / Math.PI) * w.kx];
  }
  EXCO.projFr = projFr; EXCO.projW = projW;

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------- carte ---------- */
  EXCO.makeMap = function (container, kind, cabs, opts) {
    opts = opts || {};
    var isFr = kind === "fr";
    var g = isFr ? GEO.fr : GEO.world;
    var W = g.w, H = isFr ? g.h : Math.round(g.h * .72);
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, class: "map-svg", role: "img", "aria-label": opts.label || (isFr ? "Carte des cabinets Exco en France métropolitaine" : "Carte des cabinets Exco en Europe et en Afrique") });
    var ruling = el("g", { "aria-hidden": "true" }, svg);
    for (var y = 24; y < H; y += 28) el("line", { x1: 0, x2: W, y1: y, y2: y, class: "ruling" }, ruling);
    var base = el("g", {}, svg);
    if (isFr) {
      el("path", { d: g.outline, class: "land" }, base);
      el("path", { d: g.deps, class: "deps" }, base);
      g.regions.forEach(function (r) { el("path", { d: r.d, class: "regions" }, base); });
    } else {
      g.countries.forEach(function (c) { el("path", { d: c.d, class: "country" + (c.name ? " is-exco" : ""), "data-country": c.name || "" }, base); });
    }
    var pinsG = el("g", {}, svg);
    var ring = el("circle", { r: 0, class: "sel-ring", cx: -50, cy: -50 }, svg);
    container.appendChild(svg);
    var tip = document.createElement("div"); tip.className = "map-tip"; container.appendChild(tip);

    var pins = {};
    var R = isFr ? 6.5 : 6;
    cabs.forEach(function (c) {
      if (c.lat == null) return;
      var p = isFr ? projFr(c.lng, c.lat) : projW(c.lng, c.lat);
      var pin = el("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: R, class: "pin", tabindex: "-1", "data-id": c.id }, pinsG);
      pin.__cab = c; pins[c.id] = pin;
    });

    var view = { x: 0, y: 0, w: W, h: H };
    function setView() { svg.setAttribute("viewBox", view.x + " " + view.y + " " + view.w + " " + view.h); }
    function showTip(pin) {
      var c = pin.__cab, r = pin.getBoundingClientRect(), b = container.getBoundingClientRect();
      tip.innerHTML = "<b>" + c.city + "</b>" + c.name.replace(/^Groupe /, "");
      tip.style.left = (r.left + r.width / 2 - b.left) + "px"; tip.style.top = (r.top - b.top) + "px";
      tip.classList.add("is-on");
    }
    svg.addEventListener("pointerover", function (e) { var p = e.target.closest(".pin"); if (p) { showTip(p); if (api.onHover) api.onHover(p.__cab); } });
    svg.addEventListener("pointerout", function (e) { var p = e.target.closest(".pin"); if (p) { tip.classList.remove("is-on"); if (api.onHover) api.onHover(null); } });
    svg.addEventListener("click", function (e) { var p = e.target.closest(".pin"); if (p && api.onPick) api.onPick(p.__cab); });

    var api = {
      svg: svg, pins: pins, kind: kind,
      filter: function (ids) {
        Object.keys(pins).forEach(function (id) { pins[id].classList.toggle("is-dim", ids && !ids.has(id)); });
      },
      highlight: function (id) {
        Object.keys(pins).forEach(function (k) { pins[k].classList.toggle("is-hl", k === id); });
      },
      select: function (id, zoom) {
        Object.keys(pins).forEach(function (k) { pins[k].classList.toggle("is-sel", k === id); });
        var pin = pins[id];
        if (!pin) { ring.setAttribute("cx", -50); if (zoom !== false) api.zoom(null); return; }
        var cx = +pin.getAttribute("cx"), cy = +pin.getAttribute("cy");
        ring.setAttribute("cx", cx); ring.setAttribute("cy", cy);
        pinsG.appendChild(pin);
        if (window.gsap && !EXCO.calm) gsap.fromTo(ring, { attr: { r: 40 }, opacity: 0 }, { attr: { r: 14 }, opacity: 1, duration: .7, ease: "back.out(2)" });
        else ring.setAttribute("r", 14);
        if (zoom !== false) api.zoom([cx, cy]);
      },
      zoom: function (pt, size) {
        var tgt = pt ? (function () { var s = size || (isFr ? 360 : 380); var ww = Math.min(W, s), hh = ww * H / W; return { x: Math.max(0, Math.min(W - ww, pt[0] - ww / 2)), y: Math.max(0, Math.min(H - hh, pt[1] - hh / 2)), w: ww, h: hh }; })() : { x: 0, y: 0, w: W, h: H };
        if (window.gsap && !EXCO.calm) gsap.to(view, { x: tgt.x, y: tgt.y, w: tgt.w, h: tgt.h, duration: 1.1, ease: "expo.inOut", onUpdate: setView });
        else { view = tgt; setView(); }
        var k = tgt.w / W; Object.keys(pins).forEach(function (id) { pins[id].setAttribute("r", (R * Math.max(.45, k)).toFixed(2)); });
        ring.setAttribute("stroke-width", (1.5 * Math.max(.45, k)).toFixed(2));
      },
      stampIn: function (trigger) {
        if (EXCO.calm || !window.gsap) return;
        var list = Object.keys(pins).map(function (k) { return pins[k]; });
        list.sort(function (a, b) { return (+a.getAttribute("cy")) - (+b.getAttribute("cy")); });
        gsap.set(list, { attr: { r: 0 } });
        var tl = gsap.timeline({ paused: !trigger });
        tl.to(list, { attr: { r: R }, duration: .5, ease: "back.out(3)", stagger: { each: 1.6 / list.length } });
        if (trigger) ScrollTrigger.create({ trigger: trigger, start: "top 70%", once: true, onEnter: function () { tl.play(); } });
        return tl;
      }
    };
    if (!isFr) { view = { x: 0, y: H * .06, w: W, h: H }; setView(); }
    return api;
  };

  /* ---------- recherche ---------- */
  var PLACES = [
    ["Bourg-en-Bresse",46.205,5.226],["Laon",49.564,3.62],["Moulins",46.566,3.333],["Digne-les-Bains",44.092,6.236],["Gap",44.559,6.079],["Privas",44.735,4.599],
    ["Charleville-Mézières",49.773,4.72],["Foix",42.965,1.607],["Troyes",48.297,4.074],["Carcassonne",43.213,2.349],["Rodez",44.35,2.575],["Caen",49.183,-.37],
    ["Aurillac",44.926,2.44],["La Rochelle",46.16,-1.151],["Tulle",45.267,1.772],["Ajaccio",41.919,8.738],["Saint-Brieuc",48.514,-2.765],["Guéret",46.171,1.871],
    ["Périgueux",45.184,.721],["Besançon",47.238,6.024],["Valence",44.933,4.892],["Évreux",49.024,1.151],["Chartres",48.446,1.489],["Quimper",47.996,-4.102],
    ["Nîmes",43.837,4.36],["Bordeaux",44.838,-.579],["Rennes",48.117,-1.678],["Châteauroux",46.81,1.691],["Tours",47.394,.685],["Grenoble",45.188,5.725],
    ["Lons-le-Saunier",46.674,5.555],["Blois",47.586,1.335],["Le Puy-en-Velay",45.043,3.885],["Orléans",47.903,1.909],["Agen",44.203,.616],["Mende",44.518,3.5],
    ["Angers",47.478,-.563],["Saint-Lô",49.116,-1.091],["Châlons-en-Champagne",48.957,4.363],["Chaumont",48.111,5.139],["Laval",48.073,-.77],["Nancy",48.692,6.184],
    ["Bar-le-Duc",48.772,5.16],["Metz",49.119,6.176],["Lille",50.629,3.057],["Beauvais",49.43,2.081],["Alençon",48.432,.091],["Arras",50.291,2.777],
    ["Strasbourg",48.573,7.752],["Colmar",48.079,7.358],["Lyon",45.764,4.836],["Vesoul",47.62,6.155],["Mâcon",46.307,4.828],["Le Mans",48.006,.199],
    ["Chambéry",45.564,5.918],["Annecy",45.899,6.129],["Rouen",49.443,1.1],["Melun",48.539,2.66],["Versailles",48.805,2.12],["Niort",46.323,-.464],
    ["Amiens",49.894,2.296],["Albi",43.929,2.148],["Montauban",44.018,1.355],["Toulon",43.124,5.928],["Avignon",43.949,4.806],["La Roche-sur-Yon",46.67,-1.426],
    ["Poitiers",46.58,.34],["Limoges",45.833,1.262],["Épinal",48.173,6.449],["Auxerre",47.798,3.567],["Évry-Courcouronnes",48.629,2.441],["Nanterre",48.892,2.207],
    ["Bobigny",48.909,2.44],["Créteil",48.79,2.455],["Cergy",49.036,2.076],["Reims",49.258,4.032],["Le Havre",49.494,.108],["Brest",48.39,-4.486],["Lorient",47.748,-3.367],
    ["Dunkerque",51.034,2.377],["Mulhouse",47.75,7.336],["Cannes",43.552,7.017],["Antibes",43.581,7.125],["Saint-Malo",48.649,-2.026],["Calais",50.951,1.858],
    ["Boulogne-sur-Mer",50.726,1.614],["Roubaix",50.69,3.181],["Villeurbanne",45.767,4.88],["Valenciennes",50.358,3.523],["Saint-Quentin",49.847,3.287],
    ["Arcachon",44.659,-1.168],["Libourne",44.915,-.244],["Montélimar",44.558,4.751],["Sète",43.403,3.693],["Fréjus",43.433,6.736],["Menton",43.775,7.497],
    ["Lourdes",43.095,-.046],["Anglet",43.485,-1.515],["Hendaye",43.359,-1.774],["Marmande",44.5,.165],["Montluçon",46.34,2.603],["Le Creusot",46.807,4.416],
    ["Mâcon",46.307,4.828],["Beaune",47.025,4.84],["Lunel",43.676,4.135],["Castres",43.606,2.241],["Rodez",44.35,2.575],["Figeac",44.608,2.032],["Sarlat-la-Canéda",44.89,1.216]
  ];
  var COUNTRY_WORDS = { "maroc": "Afrique", "tunisie": "Afrique", "senegal": "Afrique", "mali": "Afrique", "mauritanie": "Afrique", "burkina": "Afrique", "burkina faso": "Afrique",
    "cote d ivoire": "Afrique", "benin": "Afrique", "cameroun": "Afrique", "gabon": "Afrique", "congo": "Afrique", "madagascar": "Afrique", "afrique": "Afrique",
    "pologne": "Europe", "portugal": "Europe", "europe": "Europe", "guadeloupe": "Outre-mer", "martinique": "Outre-mer", "la reunion": "Outre-mer", "reunion": "Outre-mer",
    "polynesie": "Outre-mer", "tahiti": "Outre-mer", "outre mer": "Outre-mer", "dom tom": "Outre-mer" };

  var depMap = {};
  (GEO.depList || []).forEach(function (d) { depMap[d.code] = d; });

  EXCO.search = function (raw) {
    var q = EXCO.norm(raw);
    if (!q) return null;
    var dep = null;
    if (/^\d{5}$/.test(q)) dep = q.slice(0, 2) === "97" || q.slice(0, 2) === "98" ? q.slice(0, 3) : q.slice(0, 2);
    else if (/^(\d{2}|2a|2b|97\d)$/.test(q)) dep = q.toUpperCase();
    if (dep === "20") dep = q.slice(0, 3) < "202" ? "2A" : "2B";
    if (dep) {
      var inZone = CABS.filter(function (c) { return c.dep === dep; });
      if (depMap[dep]) return { type: "point", lat: depMap[dep].lat, lng: depMap[dep].lng, label: depMap[dep].nom + " (" + dep + ")", zone: "France" };
      var dom = { "971": "Guadeloupe", "972": "Martinique", "974": "La Réunion", "987": "Polynésie française" }[dep];
      if (dom) return { type: "zone", zone: "Outre-mer", country: dom, label: dom };
      if (inZone.length) return { type: "point", lat: inZone[0].lat, lng: inZone[0].lng, label: "Département " + dep, zone: "France" };
      return null;
    }
    if (COUNTRY_WORDS[q]) {
      var zone = COUNTRY_WORDS[q];
      var cc = CABS.filter(function (c) { return EXCO.norm(c.country) === q || (q === "tahiti" && c.country === "Polynésie française") || (q === "reunion" && c.country === "La Réunion"); });
      return { type: "zone", zone: zone, country: cc.length ? cc[0].country : null, label: cc.length ? cc[0].country : zone };
    }
    var best = null, score = 0;
    CABS.forEach(function (c) {
      var city = EXCO.norm(c.city), name = EXCO.norm(c.name), grp = EXCO.norm(c.group);
      var s = city === q ? 100 : city.indexOf(q) === 0 ? 80 : (q.length > 2 && name.indexOf(q) >= 0) ? 60 : (q.length > 3 && city.indexOf(q) >= 0) ? 50 : (q.length > 3 && grp.indexOf(q) >= 0) ? 30 : 0;
      if (s > score) { score = s; best = c; }
    });
    if (best && score >= 50) return { type: "point", lat: best.lat, lng: best.lng, label: score === 60 ? raw.trim() : best.city, zone: best.zone, cab: best.id };
    var pbest = null, ps = 0;
    PLACES.forEach(function (p) {
      var n = EXCO.norm(p[0]);
      var s = n === q ? 100 : n.indexOf(q) === 0 ? 70 : 0;
      if (s > ps) { ps = s; pbest = p; }
    });
    (GEO.depList || []).forEach(function (d) {
      var n = EXCO.norm(d.nom);
      var s = n === q ? 95 : (q.length > 3 && n.indexOf(q) === 0) ? 65 : 0;
      if (s > ps) { ps = s; pbest = [d.nom + " (" + d.code + ")", d.lat, d.lng]; }
    });
    if (pbest) return { type: "point", lat: pbest[1], lng: pbest[2], label: pbest[0], zone: "France" };
    if (best && score > 0) return { type: "point", lat: best.lat, lng: best.lng, label: best.city, zone: best.zone, cab: best.id };
    return null;
  };

  EXCO.nearest = function (pt, list, n) {
    return list.map(function (c) { return { c: c, d: EXCO.km(pt, c) }; })
      .sort(function (a, b) { return a.d - b.d; }).slice(0, n || list.length);
  };

  EXCO.hasServices = function (c, svcs) {
    return !svcs.length || svcs.every(function (s) { return c.services.indexOf(s) >= 0; });
  };
})();
