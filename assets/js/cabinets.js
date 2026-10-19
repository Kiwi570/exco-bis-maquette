/* Trouver un cabinet — recherche, filtres, carte, fiche. Données réelles des 139 fiches exco.fr */
(function () {
  "use strict";
  var EXCO = window.EXCO, $ = EXCO.$, $$ = EXCO.$$, CABS = window.EXCO_CABINETS || [];
  var calm = EXCO.calm, G = !!window.gsap;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var LOGOS = {
    "Exco Fiduciaire du Sud-Ouest": "exco-fso", "Exco Valliance": "exco-valliance", "Exco Afrique": "exco-afrique", "Exco Hesio": "exco-hesio",
    "Exco Omniconseils": "exco-omniconseils", "Exco Nexiom": "exco-nexiom", "Exco Socodec": "exco-socodec", "Exco AVEC": "exco-avec",
    "Exco Côte d’Azur": "exco-cote-dazur", "Exco AR MEN": "exco-ar-men", "Exco Antilles Guyane": "exco-antilles-guyane", "Exco Alpha": "exco-alpha",
    "Exco Clermont-Ferrand": "exco-clermont-ferrand", "Exco Loire": "exco-loire", "Exco Albertini & Associés": "exco-albertini", "Exco Naxis": "exco-naxis",
    "Exco AESE Lyon": "exco-aese-lyon", "Exco P2B": "exco-p2b", "Exco SEG Pacifique": "exco-seg-pacifique", "Exco Bertrand & Associés": "exco-bertrand",
    "Exco Anis Expert": "exco-anis-expert", "Exco Cogéfi": "exco-cogefi", "Exco A²A Toulouse": "exco-a2a-toulouse"
  };
  var ZORDER = { "France": 0, "Outre-mer": 1, "Europe": 2, "Afrique": 3 };
  var state = { zone: "Tous", services: [], point: null, pointLabel: "", country: null, group: null, sel: null };
  var params = new URLSearchParams(location.search);
  if (params.get("service") && EXCO.SERVICES.indexOf(params.get("service")) >= 0) state.services = [params.get("service")];

  var list = $("[data-list]"), status = $("[data-status]"), input = $("#q");

  /* ---------- filtres ---------- */
  $("[data-filters]").innerHTML = EXCO.SERVICES.map(function (s) {
    var n = CABS.filter(function (c) { return c.services.indexOf(s) >= 0; }).length;
    return '<label class="chip"><input type="checkbox" value="' + esc(s) + '"' + (state.services.indexOf(s) >= 0 ? " checked" : "") + '><span>' + esc(s) + ' <small>' + n + '</small></span></label>';
  }).join("");
  $$("[data-filters] input").forEach(function (i) {
    i.addEventListener("change", function () {
      state.services = $$("[data-filters] input:checked").map(function (x) { return x.value; });
      render();
    });
  });
  var zones = [["Tous", "Tous"]].concat(EXCO.ZONES);
  $("[data-zones]").innerHTML = zones.map(function (z) {
    var n = z[0] === "Tous" ? CABS.length : CABS.filter(function (c) { return c.zone === z[0]; }).length;
    return '<button role="tab" type="button" data-zone="' + z[0] + '" aria-selected="' + (z[0] === state.zone) + '">' + esc(z[1]) + '<b>' + n + '</b></button>';
  }).join("");
  $$("[data-zones] button").forEach(function (b) {
    b.addEventListener("click", function () { setZone(b.getAttribute("data-zone")); state.country = null; render(); });
  });
  function setZone(z) {
    state.zone = z;
    $$("[data-zones] button").forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-zone") === z ? "true" : "false"); });
    showMap();
  }

  /* ---------- cartes ---------- */
  var mapFr = EXCO.makeMap($("[data-map-fr]"), "fr", CABS.filter(function (c) { return c.zone === "France"; }));
  var mapW = EXCO.makeMap($("[data-map-world]"), "world", CABS.filter(function (c) { return c.zone === "Europe" || c.zone === "Afrique" || c.country === "La Réunion"; }));
  var om = $("[data-map-om]");
  var omC = {}; CABS.filter(function (c) { return c.zone === "Outre-mer"; }).forEach(function (c) { (omC[c.country] = omC[c.country] || []).push(c); });
  om.innerHTML = '<ul class="region-list" style="margin-top:0">' + Object.keys(omC).map(function (k) { return '<li><span>' + esc(k) + '</span><i class="lead"></i><b>' + omC[k].length + '</b></li>'; }).join("") + '</ul><p class="note" style="margin-top:12px">Guadeloupe, Martinique, La Réunion et Polynésie française : la liste à gauche donne les adresses.</p>';
  function showMap() {
    var z = state.zone;
    var useWorld = z === "Europe" || z === "Afrique";
    $("[data-map-fr]").hidden = useWorld || z === "Outre-mer";
    $("[data-map-world]").hidden = !useWorld;
    om.hidden = z !== "Outre-mer";
    $("[data-map-label]").textContent = useWorld ? "Europe et Afrique" : z === "Outre-mer" ? "Outre-mer" : "France métropolitaine";
  }
  [mapFr, mapW].forEach(function (m) {
    m.onPick = function (c) { open(c.id, true); };
    m.onHover = function (c) { $$(".cab.is-hl").forEach(function (x) { x.classList.remove("is-hl"); }); if (c) { var li = list.querySelector('[data-id="' + c.id + '"]'); if (li) li.classList.add("is-hl"); } };
  });
  $("[data-map-reset]").addEventListener("click", function () { mapFr.zoom(null); mapW.zoom(null); mapFr.select(null, false); mapW.select(null, false); });

  /* ---------- liste ---------- */
  function visible() {
    var arr = CABS.filter(function (c) {
      if (state.zone !== "Tous" && c.zone !== state.zone) return false;
      if (state.country && c.country !== state.country) return false;
      if (state.group && c.group !== state.group) return false;
      return EXCO.hasServices(c, state.services);
    });
    if (state.point) {
      arr = arr.map(function (c) { c._d = c.lat != null ? EXCO.km(state.point, c) : 1e9; return c; }).sort(function (a, b) { return a._d - b._d; });
    } else {
      arr.forEach(function (c) { c._d = null; });
      arr.sort(function (a, b) { return (ZORDER[a.zone] - ZORDER[b.zone]) || a.city.localeCompare(b.city, "fr") || a.name.localeCompare(b.name, "fr"); });
    }
    return arr;
  }
  function hoursTable(c) {
    if (!c.hours || !c.hours.length) return '<p class="note">Horaires à compléter.</p>';
    var today = EXCO.localNow(c.country).day;
    return '<table class="hours"><caption class="sr">Horaires d’ouverture</caption><tbody>' + c.hours.map(function (h) {
      return '<tr' + (h[0] === today ? ' class="is-today"' : "") + '><td>' + h[0] + '</td><td>' + esc(h[1]) + '</td></tr>';
    }).join("") + '</tbody></table>';
  }
  function item(c) {
    var o = EXCO.isOpen(c);
    var right = (c._d != null && c._d < 1e8 ? '<span class="km">' + (c._d < 10 ? EXCO.fmt(c._d, 1) : EXCO.fmt(Math.round(c._d))) + ' km</span>' : '<span>' + esc(c.zone === "France" ? (c.dep ? "Dép. " + c.dep : "") : c.country) + '</span>') +
      (o === null ? "" : '<span class="open-dot' + (o ? " is-open" : "") + '">' + (o ? "Ouvert" : "Fermé") + '</span>');
    var team = c.team && c.team.length ? '<ul class="team-list">' + c.team.map(function (t) { return '<li>' + esc(t[0]) + '<small>' + esc(t[1]) + '</small></li>'; }).join("") + '</ul>' : '<p class="note">Équipe à compléter.</p>';
    var svcs = c.services.length ? '<div class="svc-list">' + c.services.map(function (s) { return '<span>' + esc(s) + '</span>'; }).join("") + '</div>' : '<p class="note">Métiers non détaillés sur la fiche actuelle.</p>';
    return '<li class="cab" data-id="' + c.id + '"><button class="cab-btn" type="button" aria-expanded="false" aria-controls="d-' + c.id + '"><span class="cab-city">' + esc(c.city) + '</span><span class="cab-name">' + esc(c.name) + '</span><span class="cab-right">' + right + '</span></button>' +
      '<div class="cab-detail" id="d-' + c.id + '"><div class="cab-inner">' +
      '<div><h4>Adresse</h4><address>' + (c.address ? esc(c.address) : "Adresse à compléter") + '</address>' + (c.tel ? '<a class="tel" href="tel:' + esc(c.tel.replace(/[^\d+]/g, "")) + '">' + esc(c.tel) + '</a>' : '<p class="note">Téléphone à compléter.</p>') +
      '<h4 style="margin-top:16px">Groupe</h4><p class="small">' + esc(c.group) + '</p></div>' +
      '<div><h4>Horaires, heure locale</h4>' + hoursTable(c) + '</div>' +
      '<div><h4>Métiers proposés</h4>' + svcs + '</div>' +
      '<div><h4>Équipe</h4>' + team + '</div>' +
      '<div class="cab-actions"><a class="btn btn-sm" href="index.html?cabinet=' + encodeURIComponent(c.id) + '#rendez-vous">Prendre rendez-vous</a><a class="btn btn-line btn-sm" href="' + esc(c.url) + '" target="_blank" rel="noopener">Fiche actuelle sur exco.fr ↗</a></div>' +
      '</div></div></li>';
  }
  var first = true;
  function render() {
    var arr = visible();
    list.innerHTML = arr.length ? arr.map(item).join("") : '<li class="loc-empty">Aucun cabinet ne propose tous ces métiers dans cette zone. Retirez un filtre ou choisissez « Tous ».</li>';
    var ids = new Set(arr.map(function (c) { return c.id; }));
    mapFr.filter(ids); mapW.filter(ids);
    var parts = ["<b>" + arr.length + "</b> cabinet" + (arr.length > 1 ? "s" : "")];
    if (state.services.length) parts.push("proposant " + state.services.join(" + "));
    if (state.group) parts.push("du groupe " + state.group);
    if (state.country) parts.push("en " + state.country);
    if (state.point) parts.push("classés du plus proche au plus éloigné de " + state.pointLabel);
    status.innerHTML = parts.join(", ") + "." + (state.group || state.country || state.point || state.services.length ? ' <button type="button" class="link" data-clear style="background:none;border:0;cursor:pointer;font:inherit;padding:0">Tout effacer</button>' : "");
    var clr = $("[data-clear]", status);
    if (clr) clr.addEventListener("click", function () {
      state.group = null; state.country = null; state.point = null; state.services = []; input.value = "";
      $$("[data-filters] input").forEach(function (i) { i.checked = false; }); setZone("Tous"); render();
    });
    $$(".cab", list).forEach(function (li) {
      var id = li.getAttribute("data-id");
      $(".cab-btn", li).addEventListener("click", function () { open(id); });
      li.addEventListener("pointerenter", function () { mapFr.highlight(id); mapW.highlight(id); });
      li.addEventListener("pointerleave", function () { mapFr.highlight(null); mapW.highlight(null); });
    });
    if (!calm && G) {
      var rows = $$(".cab", list).slice(0, 14);
      gsap.from(rows, { y: first ? 30 : 12, opacity: 0, stagger: .035, duration: first ? 1 : .5, ease: "expo.out", clearProps: "transform,opacity" });
    }
    first = false;
    if (G) ScrollTrigger.refresh();
  }
  function open(id, fromMap) {
    id = String(id).replace(/^exco-/, "");
    var c = CABS.filter(function (x) { return x.id === id; })[0]; if (!c) return;
    var li = list.querySelector('[data-id="' + id + '"]');
    if (!li) { state.zone = "Tous"; state.services = []; state.group = null; state.country = null; $$("[data-filters] input").forEach(function (i) { i.checked = false; }); setZone(c.zone === "France" ? "France" : c.zone); render(); li = list.querySelector('[data-id="' + id + '"]'); }
    var wasOpen = li.classList.contains("is-sel");
    $$(".cab.is-sel", list).forEach(function (o) {
      o.classList.remove("is-sel"); $(".cab-btn", o).setAttribute("aria-expanded", "false");
      var d = $(".cab-detail", o); if (G && !calm) gsap.to(d, { height: 0, duration: .45, ease: "expo.inOut" }); else d.style.height = "0px";
    });
    if (wasOpen && !fromMap) { mapFr.select(null); mapW.select(null); state.sel = null; return; }
    li.classList.add("is-sel"); $(".cab-btn", li).setAttribute("aria-expanded", "true");
    var det = $(".cab-detail", li);
    if (G && !calm) gsap.to(det, { height: "auto", duration: .6, ease: "expo.inOut", onComplete: function () { ScrollTrigger.refresh(); } }); else det.style.height = "auto";
    state.sel = id;
    if (c.zone === "France") { if (state.zone !== "France" && state.zone !== "Tous") setZone("France"); showMapFor("fr"); mapFr.select(id); }
    else if (c.zone !== "Outre-mer" || c.country === "La Réunion") { showMapFor("world"); mapW.select(id); }
    if (fromMap) setTimeout(function () { EXCO.scrollTo(li, -110); }, 120);
  }
  function showMapFor(kind) {
    $("[data-map-fr]").hidden = kind !== "fr"; $("[data-map-world]").hidden = kind !== "world"; om.hidden = true;
    $("[data-map-label]").textContent = kind === "fr" ? "France métropolitaine" : "Europe et Afrique";
  }

  /* ---------- recherche ---------- */
  function runSearch(q) {
    state.group = null;
    var r = EXCO.search(q);
    if (!q.trim()) { state.point = null; state.country = null; render(); return; }
    if (!r) {
      status.innerHTML = "Aucune ville, aucun département ni pays ne correspond à « " + esc(q) + " ». Essayez un code postal (par exemple 64100), un département (33) ou « Me localiser ».";
      return;
    }
    if (r.type === "zone") { state.point = null; state.country = r.country; setZone(r.zone); render(); return; }
    state.country = null; state.point = { lat: r.lat, lng: r.lng }; state.pointLabel = r.label;
    if (state.zone !== "Tous" && r.zone && state.zone !== r.zone) setZone(r.zone);
    render();
    var top = visible()[0];
    if (top) { if (top.zone === "France") { showMapFor("fr"); mapFr.select(top.id); } else { showMapFor("world"); mapW.select(top.id); } }
  }
  $("[data-search]").addEventListener("submit", function (e) { e.preventDefault(); runSearch(input.value); });
  var tmr; input.addEventListener("input", function () { clearTimeout(tmr); tmr = setTimeout(function () { if (input.value.trim().length > 1 || !input.value.trim()) runSearch(input.value); }, 350); });
  function locate() {
    if (!navigator.geolocation) { status.textContent = "La géolocalisation n’est pas disponible sur cet appareil. Tapez votre ville ou votre code postal."; return; }
    status.textContent = "Localisation en cours…";
    navigator.geolocation.getCurrentPosition(function (p) {
      state.point = { lat: p.coords.latitude, lng: p.coords.longitude }; state.pointLabel = "votre position"; state.country = null; state.group = null;
      setZone("Tous"); render();
      var top = visible()[0]; if (top) { if (top.zone === "France") { showMapFor("fr"); mapFr.select(top.id); } else { showMapFor("world"); mapW.select(top.id); } }
    }, function () { status.textContent = "Localisation refusée ou impossible. Tapez votre ville, votre code postal ou votre département."; render(); }, { timeout: 9000 });
  }
  $("[data-locate]").addEventListener("click", locate);

  /* vue liste / carte sur mobile */
  $$(".view-toggle button").forEach(function (b) {
    b.addEventListener("click", function () {
      $(".loc-main").setAttribute("data-view", b.getAttribute("data-view"));
      $$(".view-toggle button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    });
  });

  /* ---------- index des villes ---------- */
  var cities = {};
  CABS.forEach(function (c) { cities[c.city] = (cities[c.city] || 0) + 1; });
  var names = Object.keys(cities).sort(function (a, b) { return a.localeCompare(b, "fr"); });
  var byL = {};
  names.forEach(function (n) { var l = EXCO.norm(n).charAt(0).toUpperCase(); (byL[l] = byL[l] || []).push(n); });
  $("[data-az]").innerHTML = Object.keys(byL).map(function (l) {
    return '<div class="az-group"><h3>' + l + '</h3>' + byL[l].map(function (n) { return '<a href="cabinets.html?q=' + encodeURIComponent(n) + '" data-city="' + esc(n) + '">' + esc(n) + (cities[n] > 1 ? ' <span class="note">×' + cities[n] + '</span>' : "") + '</a>'; }).join("") + '</div>';
  }).join("");
  $$("[data-az] a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault(); input.value = a.getAttribute("data-city"); setZone("Tous"); runSearch(input.value); EXCO.scrollTo($(".loc-tools"), -100);
    });
  });
  if (!calm && G) gsap.from($$(".az-group"), { y: 24, opacity: 0, stagger: .025, duration: .8, scrollTrigger: { trigger: "[data-az]", start: "top 85%", once: true } });

  /* ---------- groupes ---------- */
  var groups = {};
  CABS.forEach(function (c) { groups[c.group] = (groups[c.group] || 0) + 1; });
  $("[data-groups]").innerHTML = Object.keys(groups).sort(function (a, b) { return groups[b] - groups[a] || a.localeCompare(b, "fr"); }).map(function (g) {
    var logo = LOGOS[g];
    return '<li><button type="button" data-group="' + esc(g) + '">' + (logo ? '<img src="assets/img/membres/' + logo + '-480.webp" alt="" loading="lazy">' : "<span></span>") + '<span>' + esc(g) + '</span><b>' + groups[g] + ' cabinet' + (groups[g] > 1 ? "s" : "") + '</b></button></li>';
  }).join("");
  $$("[data-group]").forEach(function (b) {
    b.addEventListener("click", function () { state.group = b.getAttribute("data-group"); state.point = null; state.country = null; input.value = ""; setZone("Tous"); render(); EXCO.scrollTo($(".loc-tools"), -100); });
  });
  if (!calm && G) gsap.from($$("[data-groups] li"), { y: 20, opacity: 0, stagger: .03, duration: .8, scrollTrigger: { trigger: "[data-groups]", start: "top 85%", once: true } });

  /* ---------- démarrage ---------- */
  showMap();
  render();
  if (!calm && G) {
    var tlp = mapFr.stampIn(null); if (tlp) tlp.play();
    gsap.from(".loc-tools > *", { y: 24, opacity: 0, stagger: .08, duration: 1, delay: .25 });
  }
  if (params.get("q")) { input.value = params.get("q"); runSearch(params.get("q")); }
  if (params.get("cabinet")) setTimeout(function () { open(params.get("cabinet"), true); }, 400);
  if (params.get("geo") === "1") locate();
})();
