/* Page métier : Expertise comptable */
(function () {
  "use strict";
  var EXCO = window.EXCO, $ = EXCO.$, $$ = EXCO.$$, CABS = window.EXCO_CABINETS || [];
  var calm = EXCO.calm, G = !!window.gsap;
  var SVC = "Expertise comptable";
  var ec = CABS.filter(function (c) { return c.services.indexOf(SVC) >= 0; });
  $$("[data-count-ec], [data-count-ec2]").forEach(function (e) { e.textContent = ec.length; });

  /* ouverture */
  var gl = EXCO.strips($(".hero-media"), { autoReveal: false });
  if (!calm && G) {
    $$(".svc-hero h1 .line").forEach(function (l) { l.style.display = "block"; l.style.overflow = "hidden"; l.innerHTML = '<span style="display:inline-block">' + l.innerHTML + "</span>"; });
    gl.reveal(2.4);
    var tl = gsap.timeline({ delay: EXCO.arrivedByTurn ? .55 : .1 });
    tl.from(".svc-hero h1 .line > span", { yPercent: 110, duration: 1.4, stagger: .1 })
      .from(".svc-hero .crumbs, .svc-hero .d4, .svc-hero .hero-sub, .svc-hero .hero-cta > *", { y: 22, opacity: 0, stagger: .07, duration: 1 }, .35);
  } else gl.reveal();

  /* engagements tamponnés */
  if (!calm && G) {
    $$("[data-engagements] li").forEach(function (li, i) {
      gsap.from(li, { x: -24, opacity: 0, duration: .9, scrollTrigger: { trigger: li, start: "top 88%", once: true } });
      gsap.to($(".mini-stamp", li), { opacity: .9, scale: 1, duration: .45, ease: "back.out(2.6)", delay: .45, scrollTrigger: { trigger: li, start: "top 80%", once: true } });
    });
  }

  /* missions */
  var MIS = ["Établissement d’un business plan", "Collecte des informations", "Saisie comptable des pièces", "Pointage périodique des comptes", "Inventaire des stocks", "Analyse des marges", "Clôture des comptes", "Révision de la comptabilité", "Établissement des comptes annuels"];
  var ml = $("[data-missions]");
  ml.innerHTML = MIS.map(function (m, i) {
    return '<li><span class="k">' + (i + 1 < 10 ? "0" : "") + (i + 1) + '</span><span class="t">' + m + '</span><svg class="tick" viewBox="0 0 28 28" aria-hidden="true"><path d="M5 15 L11 21 L24 5"/></svg></li>';
  }).join("");
  if (!calm && G) {
    gsap.to(".missions-rail i", { scaleY: 1, ease: "none", scrollTrigger: { trigger: ml, start: "top 65%", end: "bottom 65%", scrub: true } });
    $$("li", ml).forEach(function (li) {
      var st = { trigger: li, start: "top 65%", toggleActions: "play none none reverse" };
      gsap.from($(".t", li), { opacity: .2, x: 12, duration: .6, scrollTrigger: st });
      if (window.DrawSVGPlugin) gsap.from($("path", li), { drawSVG: "0%", duration: .5, scrollTrigger: st });
    });
  } else { var ri = $(".missions-rail i"); if (ri) ri.style.transform = "scaleY(1)"; }

  /* restitution : tableau de bord illustratif (données fictives) */
  var M = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept."];
  var A = [182, 176, 198, 205, 211, 224, 236, 168, 229];
  var B = [188, 181, 214, 226, 232, 241, 258, 174, 247];
  var S = [{ name: "2026", data: B, color: "#008FC3" }, { name: "2025", data: A, color: "#DA5914" }];
  var host = $("[data-chart]");
  if (host) {
    var W = 640, H = 270, pl = 40, pr = 54, pt = 34, pb = 30, y0 = 150, y1 = 270;
    var X = function (i) { return pl + i * (W - pl - pr) / (M.length - 1); };
    var Y = function (v) { return pt + (1 - (v - y0) / (y1 - y0)) * (H - pt - pb); };
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Chiffre d’affaires mensuel fictif, 2026 comparé à 2025, de janvier à septembre">';
    svg += '<g aria-hidden="true">';
    S.forEach(function (s, k) { svg += '<line x1="' + (pl + k * 90) + '" x2="' + (pl + 22 + k * 90) + '" y1="10" y2="10" stroke="' + s.color + '" stroke-width="2" stroke-linecap="round"/><text x="' + (pl + 28 + k * 90) + '" y="14">CA ' + s.name + '</text>'; });
    [150, 200, 250].forEach(function (v) { svg += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="#D8CFB8" stroke-width="1"/><text x="' + (pl - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + '</text>'; });
    M.forEach(function (m, i) { svg += '<text x="' + X(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + m + '</text>'; });
    S.slice().reverse().forEach(function (s) {
      var d = s.data.map(function (v, i) { return (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1); }).join(" ");
      svg += '<path class="ln" d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
      var li = s.data.length - 1;
      svg += '<circle class="end" cx="' + X(li) + '" cy="' + Y(s.data[li]) + '" r="4.5" fill="' + s.color + '" stroke="#F6F2E8" stroke-width="2"/>';
      svg += '<text class="end" x="' + (X(li) + 10) + '" y="' + (Y(s.data[li]) + 4) + '" style="fill:#1B1A16;font-weight:500">' + s.name + '</text>';
    });
    svg += '<line class="xh" x1="0" x2="0" y1="' + pt + '" y2="' + (H - pb) + '" stroke="#66614F" stroke-width="1" opacity="0"/>';
    S.forEach(function (s, k) { svg += '<circle class="hd' + k + '" r="4.5" fill="' + s.color + '" stroke="#F6F2E8" stroke-width="2" opacity="0"/>'; });
    svg += '</g><rect class="hit" x="' + pl + '" y="' + pt + '" width="' + (W - pl - pr) + '" height="' + (H - pt - pb) + '" fill="transparent"/></svg>';
    host.innerHTML = svg + '<div class="map-tip" data-ctip></div>';
    var el = host.querySelector("svg"), hit = el.querySelector(".hit"), xh = el.querySelector(".xh"), tip = host.querySelector("[data-ctip]");
    var dots = [el.querySelector(".hd0"), el.querySelector(".hd1")];
    var move = function (e) {
      var r = el.getBoundingClientRect(), sx = (e.clientX - r.left) / r.width * W;
      var i = Math.max(0, Math.min(M.length - 1, Math.round((sx - pl) / ((W - pl - pr) / (M.length - 1)))));
      xh.setAttribute("x1", X(i)); xh.setAttribute("x2", X(i)); xh.setAttribute("opacity", 1);
      S.forEach(function (s, k) { dots[k].setAttribute("cx", X(i)); dots[k].setAttribute("cy", Y(s.data[i])); dots[k].setAttribute("opacity", 1); });
      tip.innerHTML = "<b>" + M[i] + "</b>2026 : " + B[i] + " k€ · 2025 : " + A[i] + " k€";
      tip.style.left = (X(i) / W * r.width) + "px"; tip.style.top = (Y(Math.max(A[i], B[i])) / H * r.height) + "px";
      tip.classList.add("is-on");
    };
    hit.addEventListener("pointermove", move);
    hit.addEventListener("pointerleave", function () { tip.classList.remove("is-on"); xh.setAttribute("opacity", 0); dots.forEach(function (d) { d.setAttribute("opacity", 0); }); });
    $("[data-table]").innerHTML = '<table class="hours"><thead><tr><td>Mois</td><td>2025</td><td>2026</td></tr></thead><tbody>' + M.map(function (m, i) { return "<tr><td>" + m + "</td><td>" + A[i] + "</td><td>" + B[i] + "</td></tr>"; }).join("") + "</tbody></table>";
    var sum = B.reduce(function (a, b) { return a + b; }, 0);
    EXCO.flip($('[data-k="ca"]'), EXCO.fmt(sum) + " k€", { trigger: host });
    EXCO.flip($('[data-k="mb"]'), "38,2 %", { trigger: host, delay: .15 });
    EXCO.flip($('[data-k="tr"]'), "412 k€", { trigger: host, delay: .3 });
    if (!calm && G && window.DrawSVGPlugin) {
      var t2 = gsap.timeline({ scrollTrigger: { trigger: host, start: "top 75%", once: true } });
      t2.from($$(".ln", el), { drawSVG: "0%", duration: 2, ease: "power2.inOut", stagger: .2 })
        .from($$(".end", el), { opacity: 0, duration: .5 }, "-=.3");
    }
  }

  /* bénéfices */
  if (!calm && G) {
    gsap.from($$("[data-benefits] li"), { x: 26, opacity: 0, stagger: .08, duration: .9, scrollTrigger: { trigger: "[data-benefits]", start: "top 80%", once: true } });
  }

  /* carte des cabinets qui proposent le métier */
  var mh = $("[data-svc-map]");
  if (mh) {
    var fr = CABS.filter(function (c) { return c.zone === "France"; });
    var map = EXCO.makeMap(mh, "fr", fr, { label: "Carte des cabinets proposant l’expertise comptable en France métropolitaine" });
    map.filter(new Set(ec.map(function (c) { return c.id; })));
    map.onPick = function (c) { location.href = "cabinets.html?cabinet=" + encodeURIComponent(c.id); };
    map.stampIn(mh);
  }

  /* autres métiers */
  var CARDS = [["Audit", "service-audit", "Audit"], ["Conseil", "service-conseil", "Conseil"], ["Gestion sociale, paie et RH", "service-social-paie-rh", "Social, paie et ressources humaines"], ["Juridique et fiscal", null, "Juridique et fiscal"]];
  $("[data-cards]").innerHTML = CARDS.map(function (c, i) {
    var n = CABS.filter(function (x) { return x.services.indexOf(c[2]) >= 0; }).length;
    var media = c[1] ? '<img src="assets/img/grok/' + c[1] + '-480.webp" alt="" loading="lazy">' : EXCO.viz("colonnes", .8, 5);
    return '<a class="card" href="cabinets.html?service=' + encodeURIComponent(c[2]) + '" data-tilt="6"><div class="ph">' + media + '</div><h3>' + c[0] + '</h3><p>' + n + ' cabinets le proposent</p></a>';
  }).join("");
  $(".rdv-aside .cards").style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
  if (!calm && G && EXCO.fine) {
    $$("[data-cards] .card").forEach(function (c) {
      gsap.set(c, { transformPerspective: 800 });
      var rx = gsap.quickTo(c, "rotationX", { duration: .6 }), ry = gsap.quickTo(c, "rotationY", { duration: .6 });
      c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 12); rx(-((e.clientY - r.top) / r.height - .5) * 12); });
      c.addEventListener("pointerleave", function () { rx(0); ry(0); });
    });
  }

  /* rendez-vous */
  EXCO.rdv($("[data-rdv]"), { service: SVC });
})();
