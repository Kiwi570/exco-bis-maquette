/* Accueil Exco — orchestration des folios */
(function () {
  "use strict";
  var EXCO = window.EXCO, $ = EXCO.$, $$ = EXCO.$$, CABS = window.EXCO_CABINETS || [];
  var calm = EXCO.calm, G = !!window.gsap;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var count = function (svc) { return CABS.filter(function (c) { return c.services.indexOf(svc) >= 0; }).length; };

  /* ================= données de contenu (reprises d’exco.fr) ================= */
  var SERVICES = [
    { n: "Expertise comptable", k: "Expertise comptable", img: "service-expertise-comptable", d: "Déléguez vos obligations réglementaires, identifiez les risques, optimisez vos options comptables et fiscales. Un interlocuteur unique et durable, et une restitution personnalisée de nos travaux.", page: "expertise-comptable.html" },
    { n: "Audit", k: "Audit", img: "service-audit", d: "Certification des comptes lorsque la taille ou la nature de votre entreprise impose la nomination d’un commissaire aux comptes. L’auditeur détecte les facteurs de risque et alerte le dirigeant." },
    { n: "Conseil", k: "Conseil", img: "service-conseil", d: "Des solutions de conseil et d’accompagnement sur mesure et collaboratives, pour la réussite de vos projets à chaque étape clé de la vie de l’entreprise." },
    { n: "Gestion sociale, paie et RH", k: "Social, paie et ressources humaines", img: "service-social-paie-rh", d: "Gestion de la paie, conseil en droit du travail et en droit social, audit social, management du personnel." },
    { n: "Juridique et fiscal", k: "Juridique et fiscal", viz: "colonnes", d: "Conseil, optimisation, conformité et sécurisation de vos décisions d’entreprise, en droit fiscal comme en droit des sociétés." },
    { n: "Évaluation d’entreprise", k: "Évaluation d'entreprise", viz: "bloc", d: "Exco guide les entreprises dans les situations complexes, en s’appuyant sur son expérience des opérations de rapprochement et d’acquisition." },
    { n: "International", k: "International", viz: "globe", d: "Notre zone d’intervention est internationale : où que vous alliez, Exco vous accompagne, avec ses cabinets en Europe et en Afrique et le réseau Kreston Global." },
    { n: "Formation", k: "Formation", viz: "livre", d: "Des programmes pour renforcer les compétences de vos équipes en matière financière et comptable, de l’intégration des nouveaux salariés au perfectionnement." },
    { n: "RSE et durabilité", viz: "nervures", d: "Aller au-delà des chiffres financiers en prenant en compte l’impact de vos activités sur la société et l’environnement." },
    { n: "Vérification OTI", viz: "coches", d: "Vérification des reportings de durabilité et ESG, et de la qualité de société à mission, notamment pour les déclarations de performance extra-financière.", tbc: "Formulation à revoir avec Exco au regard du rapport de durabilité (CSRD)." },
    { n: "Forensics", viz: "loupe", d: "Intervention à la demande des entreprises et de leurs avocats, avant contentieux et lors de litiges économiques et financiers." },
    { n: "Exco Consulting", viz: "rose", d: "Présentation à compléter : le site actuel cite cette offre dans son menu sans la décrire.", tbc: "à compléter" },
    { n: "Exco Finance et Transactions", k: "Exco finance et transactions", viz: "entrelacs", d: "Fusions, acquisitions et transmissions rendues simples et accessibles, avec un haut niveau de compétences sur les territoires.", ext: "https://finance.exco.fr/" },
    { n: "Exco Gestion Privée", k: "Exco gestion privée", viz: "cercles", d: "Un accompagnement des dirigeants dans leurs projets patrimoniaux.", ext: "https://gestionprivee.exco.fr/" }
  ];
  var SECTORS = [
    ["Agriculture et agroalimentaire", "vignes"], ["Automobile", "route"], ["Banque et assurance", "colonnes"], ["BTP et immobilier", "charpente"],
    ["Économie sociale et solidaire", "anneaux"], ["Entreprises innovantes et start-up", "constellation"], ["Hôtellerie, cafés, restaurants", "terrasse"],
    ["Industrie", "pieces"], ["Loisirs et tourisme", "vagues"], ["Professions libérales", "feuillets"], ["Pharmacie", "tiroirs"],
    ["Santé, établissements médico-sociaux", "arches"], ["Secteur public", "facade"], ["Transports et logistique", "allees"]
  ];
  var CYCLE = [
    { t: "Créer", s: "Vous lancez votre activité.", img: "cycle-creer", alt: "Un établi en bois avec un carnet, des clés et un café, dans un atelier vide au petit matin",
      deb: ["Choisir sa forme juridique", "Bâtir un business plan crédible", "Démarrer sa comptabilité sur de bonnes bases"],
      cre: [["Établissement du business plan", "expertise-comptable.html"], ["Juridique et fiscal", "#metiers"], ["Conseil", "#metiers"]] },
    { t: "Structurer", s: "Votre entreprise prend de l’ampleur.", img: "cycle-structurer", alt: "Deux personnes vues de dos rangent des classeurs sur des étagères",
      deb: ["Recruter et payer ses salariés", "Fiabiliser ses chiffres", "Tenir ses obligations fiscales et sociales"],
      cre: [["Gestion sociale, paie et RH", "#metiers"], ["Expertise comptable", "expertise-comptable.html"], ["Juridique et fiscal", "#metiers"]] },
    { t: "Développer", s: "Vous changez d’échelle.", img: "cycle-developper", alt: "Un grand atelier de fabrication vu d’une mezzanine, avec des rangées de machines",
      deb: ["Piloter ses marges", "Faire certifier ses comptes", "S’ouvrir à l’international", "Mesurer son impact"],
      cre: [["Analyse des marges et révision", "expertise-comptable.html"], ["Audit", "#metiers"], ["International", "#metiers"], ["RSE et durabilité", "#metiers"]] },
    { t: "Transmettre", s: "Vous préparez la suite.", img: "cycle-transmettre", alt: "Deux tabliers de cuir, l’un usé et l’autre neuf, suspendus côte à côte dans un atelier",
      deb: ["Connaître la valeur de son entreprise", "Céder ou transmettre", "Organiser son patrimoine"],
      cre: [["Évaluation d’entreprise", "#metiers"], ["Exco Finance et Transactions ↗", "https://finance.exco.fr/"], ["Exco Gestion Privée ↗", "https://gestionprivee.exco.fr/"]] }
  ];
  var BUREAU = [
    ["philippe-lafargue", "Philippe Lafargue", "Groupe Exco Fiduciaire du Sud-Ouest", "Président Exco"],
    ["franck-huyghe", "Franck Huyghe", "Groupe Exco Valliance"],
    ["benjamin-poulard", "Benjamin Poulard", "Exco AVEC"],
    ["bruno-geeraert", "Bruno Geeraert", "Groupe Exco Omniconseils"],
    ["bruno-da-silva", "Bruno Da Silva", "Groupe Exco Nexiom"],
    ["sebastien-trescartes", "Sébastien Trescartes", "Groupe Exco Loire"],
    ["christel-sadoine", "Christel Sadoine", "Groupe Exco Socodec"],
    ["thierry-pouyet", "Thierry Pouyet", "Groupe Exco Clermont-Ferrand"],
    ["franck-parker", "Franck Parker", "Directeur général Exco", "Membre du Board Kreston"]
  ];
  var COMITE = [
    ["francois-regis-vignon", "François Régis Vignon", "Groupe Exco Hesio"], ["vincent-faure", "Vincent Faure", "Groupe Exco AESE Lyon"],
    ["christian-perrin-bondoux", "Christian Perrin Bondoux", "Groupe Exco Alpha"], ["lauriane-strock", "Lauriane Strock", "Groupe Exco Naxis"],
    ["isabelle-de-lepine", "Isabelle de l’Epine", "Groupe Exco A²A Toulouse"], ["abdoulaye-camara", "Abdoulaye Camara", "Groupe Exco Afrique"],
    ["naim-ingar", "Naïm Ingar", "Groupe Exco Anis Expert"], ["florence-de-pompignan", "Florence de Pompignan", "Groupe Exco Antilles Guyane"],
    ["xavier-margottin", "Xavier Margottin", "Groupe Exco AR MEN"], ["pierre-bertrand", "Pierre Bertrand", "Groupe Exco Bertrand & Associés"],
    ["david-box", "David Box", "Groupe Exco Cogéfi"], ["christian-dorange", "Christian Dorange", "Groupe Exco Côte d’Azur"], ["pierre-burnel", "Pierre Burnel", "Groupe Exco P2B"]
  ];
  var METIERS = [
    ["Expert-comptable", "L’expertise comptable est certes un métier de chiffres, mais c’est avant tout un métier de proximité, de conseil et d’écoute. L’expert-comptable accompagne au quotidien le dirigeant dans l’optimisation de ses résultats et le pilotage de ses projets.", "https://exco.fr/carrieres/le-metier-dexpert-comptable/"],
    ["Auditeur comptable et financier", "Au-delà de la certification des comptes, l’auditeur appréhende l’entreprise dans sa globalité pour détecter les facteurs de risque et alerter le dirigeant. Impartial, il l’aide à prendre les bonnes décisions.", "https://exco.fr/carrieres/le-metier-dauditeur-comptable-et-financier/"],
    ["Social et ressources humaines", "Le pôle social et RH connaît un fort développement dans le réseau. Il est un maillon essentiel du conseil aux dirigeants et propose des stages et des emplois aux jeunes diplômés comme aux profils expérimentés.", "https://exco.fr/carrieres/les-metiers-du-social-et-ressources-humaines/"],
    ["Juriste", "La filière juridique et fiscale capitalise sur la proximité et la relation de confiance durable avec nos clients, pour accompagner leur croissance en toute sécurité.", "https://exco.fr/carrieres/le-metier-de-juriste/"],
    ["Consultant", "Immergés dans la réalité quotidienne des entreprises, nos consultants interviennent à chaque étape clé de leur vie, en synergie avec les autres métiers du cabinet.", "https://exco.fr/carrieres/le-metier-de-consultant-comptable-et-financier/"]
  ];

  /* ================= ouverture du registre ================= */
  var opening = $(".opening");
  var heroGL = null;
  function startHero() {
    var hero = $(".hero");
    heroGL = EXCO.strips($(".hero-media"), { autoReveal: false });
    if (calm || !G) return;
    $$(".hero-title .line").forEach(function (l) { l.innerHTML = '<span class="li" style="display:inline-block">' + l.innerHTML + "</span>"; });
    var tl = gsap.timeline();
    heroGL.reveal(2.6);
    tl.from(".hero-title .li", { yPercent: 115, duration: 1.4, stagger: .1, ease: "expo.out" }, .15)
      .from(".hero-sub", { y: 24, opacity: 0, duration: 1 }, .55)
      .from(".hero-cta > *", { y: 24, opacity: 0, duration: 1, stagger: .08 }, .7)
      .from(".hero-ticker", { yPercent: 100, opacity: 0, duration: 1 }, .8)
      .from(".hd", { opacity: 0, duration: .9, clearProps: "opacity" }, .4)
      .from(".margin-label", { opacity: 0, duration: .8 }, 1);
    gsap.to(".hero-body", { yPercent: -18, opacity: .2, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  }
  function runOpening() {
    if (!opening) return startHero();
    if (calm || !G) { opening.remove(); return startHero(); }
    var seen = false; try { seen = sessionStorage.getItem("exco-opened") === "1"; sessionStorage.setItem("exco-opened", "1"); } catch (e) {}
    if (seen || EXCO.arrivedByTurn) { opening.remove(); return startHero(); }
    if (EXCO.lenis) EXCO.lenis.stop();
    var box = $(".opening-lines", opening), n = Math.ceil(innerHeight / 32);
    for (var i = 1; i < n; i++) { var l = document.createElement("i"); l.style.top = (i * 32) + "px"; box.appendChild(l); }
    var head = $(".opening-head", opening);
    var tl = gsap.timeline({ onComplete: function () { opening.remove(); if (EXCO.lenis) EXCO.lenis.start(); ScrollTrigger.refresh(); } });
    tl.to(".opening-lines i", { scaleX: 1, duration: .9, ease: "expo.inOut", stagger: { each: .018, from: "start" } }, 0)
      .to(".opening-margin", { scaleY: 1, duration: .8, ease: "expo.inOut" }, .1)
      .from(head.children, { opacity: 0, y: 8, duration: .5, stagger: .07 }, .45)
      .fromTo(".opening-core img", { opacity: 0, scale: 1.25, rotate: -4 }, { opacity: 1, scale: 1, rotate: 0, duration: .5, ease: "back.out(2.5)" }, .75)
      .to(".opening-solde", { opacity: 1, duration: .4 }, 1.05)
      .add(function () { $("[data-solde]").classList.add("is-in"); }, 1.15)
      .to(opening, { yPercent: -100, duration: 1, ease: "expo.inOut" }, 2.05)
      .add(startHero, 2.15);
  }
  runOpening();

  /* bandeau défilant */
  var track = $(".ticker-track");
  if (track && !calm && G) {
    track.innerHTML += track.innerHTML;
    var tw = gsap.to(track, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
    ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom top", onUpdate: function (s) { tw.timeScale(1 + Math.abs(s.getVelocity()) / 600); gsap.to(tw, { timeScale: 1, duration: 1, overwrite: true }); } });
  }

  /* ================= f°02 bilan ================= */
  $$("#bilan [data-flip]").forEach(function (el, i) { EXCO.flip(el, el.getAttribute("data-flip"), { trigger: el.closest(".ledger-row"), start: "top 85%", delay: .25 }); });
  if (!calm && G) {
    $$("#bilan .ledger-row").forEach(function (r) {
      gsap.fromTo(r.querySelector(".lead"), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "expo.inOut", scrollTrigger: { trigger: r, start: "top 85%", once: true } });
      gsap.from(r.querySelector(".lbl"), { x: -20, opacity: 0, duration: 1, scrollTrigger: { trigger: r, start: "top 85%", once: true } });
    });
  }
  var sh = $("#bilan [data-stamp-host]");
  if (sh) EXCO.stamp(sh, "EXCO • CABINETS INDÉPENDANTS • ", "f°02", { trigger: sh.parentElement, start: "top 55%" });

  /* ================= f°03 manifeste : du crayon à l’encre ================= */
  var ink = $("[data-ink]");
  if (ink) {
    if (!calm && G && window.SplitText) {
      SplitText.create(ink, { type: "words", wordsClass: "w" });
      gsap.to($$(".w", ink), { color: "#1B1A16", stagger: .1, ease: "none", scrollTrigger: { trigger: ink, start: "top 78%", end: "bottom 45%", scrub: true } });
    } else ink.classList.add("is-inked");
  }

  /* ================= f°04 cycle de vie ================= */
  var ct = $("[data-cycle-track]");
  if (ct) {
    ct.innerHTML = CYCLE.map(function (c, i) {
      return '<article class="cycle-panel" aria-label="Étape ' + (i + 1) + ' : ' + c.t + '">' +
        '<div class="cycle-img" data-tilt="5"><img src="assets/img/grok/' + c.img + '-784.webp" srcset="assets/img/grok/' + c.img + '-480.webp 480w, assets/img/grok/' + c.img + '-784.webp 784w" sizes="(max-width: 999px) 90vw, 36vw" alt="' + esc(c.alt) + '" loading="lazy"></div>' +
        '<div><p class="num-step">Étape ' + (i + 1) + ' sur 4</p><h3 class="d2 cycle-title">' + c.t + '</h3><p class="lede" style="margin-top:8px">' + c.s + '</p>' +
        '<div class="entry"><div class="entry-cols"><div class="entry-col"><h4>Vos enjeux</h4><ul>' + c.deb.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + '</ul></div>' +
        '<div class="entry-col"><h4>Notre accompagnement</h4><ul>' + c.cre.map(function (d) { var ext = /^https?:/.test(d[1]); return '<li><a href="' + d[1] + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + '>' + esc(d[0]) + "</a></li>"; }).join("") + '</ul></div></div></div>' +
        '<div class="balance"><svg viewBox="0 0 92 46" aria-hidden="true"><path d="M6 44 A40 40 0 0 1 86 44" fill="none" stroke="currentColor" stroke-width="1"/><line x1="46" y1="4" x2="46" y2="9" stroke="currentColor"/><line class="needle" x1="46" y1="44" x2="46" y2="10" stroke="#DA5914" stroke-width="2"/><circle cx="46" cy="44" r="3" fill="#1B1A16"/></svg><span>Écriture <span class="ok">équilibrée</span></span></div>' +
        '</div></article>';
    }).join("");
    if (!calm && G) {
      var mm = gsap.matchMedia();
      mm.add("(min-width: 1000px)", function () {
        var panels = $$(".cycle-panel", ct);
        var scrollTween = gsap.to(ct, { x: function () { return -(ct.scrollWidth - innerWidth); }, ease: "none",
          scrollTrigger: { trigger: ".cycle-pin", pin: true, scrub: 1, start: "top top", end: function () { return "+=" + (ct.scrollWidth - innerWidth); }, invalidateOnRefresh: true } });
        gsap.to(".cycle-progress i", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".cycle-pin", start: "top top", end: function () { return "+=" + (ct.scrollWidth - innerWidth); }, scrub: true } });
        panels.forEach(function (p, i) {
          var items = $$(".entry-col li", p);
          var st1 = i === 0 ? { trigger: ".cycle-pin", start: "top 70%", toggleActions: "play none none reverse" } : { trigger: p, containerAnimation: scrollTween, start: "left 65%", toggleActions: "play none none reverse" };
          var st2 = i === 0 ? { trigger: ".cycle-pin", start: "top 45%", toggleActions: "play none none reverse" } : { trigger: p, containerAnimation: scrollTween, start: "left 45%", toggleActions: "play none none reverse" };
          gsap.from(items, { x: 30, opacity: 0, stagger: .06, duration: .8, scrollTrigger: st1 });
          gsap.fromTo($(".needle", p), { rotation: -38, svgOrigin: "46 44" }, { rotation: 0, svgOrigin: "46 44", ease: "elastic.out(1, .35)", duration: 1.8, scrollTrigger: st2 });
          gsap.fromTo($(".cycle-img img", p), { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: p, containerAnimation: scrollTween, start: "left right", end: "right left", scrub: true } });
        });
      });
      mm.add("(max-width: 999px)", function () {
        $$(".cycle-panel", ct).forEach(function (p) {
          gsap.from($$(".entry-col li", p), { x: 20, opacity: 0, stagger: .05, duration: .8, scrollTrigger: { trigger: p, start: "top 70%", once: true } });
          gsap.fromTo($(".needle", p), { rotation: -38, svgOrigin: "46 44" }, { rotation: 0, svgOrigin: "46 44", ease: "elastic.out(1,.35)", duration: 1.8, scrollTrigger: { trigger: $(".balance", p), start: "top 90%", once: true } });
        });
      });
    }
  }

  /* ================= f°05 plan de comptes ================= */
  var acc = $("[data-accounts]"), prev = $(".preview");
  if (acc) {
    acc.innerHTML = SERVICES.map(function (s, i) {
      var c = s.k ? count(s.k) : null;
      var media = s.img ? '<img src="assets/img/grok/' + s.img + '-480.webp" alt="">' : EXCO.viz(s.viz, .8, i + 3);
      var actions = s.page ? '<a class="btn btn-sm" href="' + s.page + '">Voir le métier</a>' : s.ext ? '<a class="btn btn-sm" href="' + s.ext + '" target="_blank" rel="noopener">Ouvrir le site dédié ↗</a>' : "";
      if (s.k) actions += '<a class="btn btn-line btn-sm" href="cabinets.html?service=' + encodeURIComponent(s.k) + '">Les ' + c + ' cabinets</a>';
      return '<div class="acc" data-i="' + i + '"><button class="acc-btn" type="button" aria-expanded="false" aria-controls="acc-' + i + '"><span class="acc-name">' + esc(s.n) + (s.ext ? ' <span class="note" style="vertical-align:middle">site dédié</span>' : "") + '</span>' +
        '<span class="acc-amt">' + (c != null ? "<b>" + c + "</b> <span>cabinets</span>" : '<span class="note">réseau</span>') + '</span><span class="acc-sign" aria-hidden="true"></span></button>' +
        '<div class="acc-body" id="acc-' + i + '"><div class="acc-inner"><p>' + esc(s.d) + (s.tbc ? ' <span class="tbc">' + esc(s.tbc.length > 14 ? "à vérifier" : s.tbc) + '</span>' : "") + (s.tbc && s.tbc.length > 14 ? '<br><span class="note">' + esc(s.tbc) + "</span>" : "") + '</p><div class="actions">' + actions + '</div></div></div>' +
        '<template>' + media + '</template></div>';
    }).join("");
    $$(".acc", acc).forEach(function (a) {
      var b = $(".acc-btn", a), body = $(".acc-body", a);
      b.addEventListener("click", function () {
        var open = !a.classList.contains("is-open");
        $$(".acc.is-open", acc).forEach(function (o) { if (o !== a) { o.classList.remove("is-open"); $(".acc-btn", o).setAttribute("aria-expanded", "false"); if (G && !calm) gsap.to($(".acc-body", o), { height: 0, duration: .5, ease: "expo.inOut" }); else $(".acc-body", o).style.height = "0px"; } });
        a.classList.toggle("is-open", open); b.setAttribute("aria-expanded", open ? "true" : "false");
        if (G && !calm) gsap.to(body, { height: open ? "auto" : 0, duration: .6, ease: "expo.inOut", onComplete: function () { ScrollTrigger.refresh(); } });
        else { body.style.height = open ? "auto" : "0px"; }
      });
    });
    if (!calm && G) {
      gsap.from($$(".acc", acc), { y: 30, opacity: 0, stagger: .045, duration: .9, scrollTrigger: { trigger: acc, start: "top 82%", once: true } });
      if (EXCO.fine && prev) {
        var px = gsap.quickTo(prev, "x", { duration: .55, ease: "power3" }), py = gsap.quickTo(prev, "y", { duration: .55, ease: "power3" }), pr = gsap.quickTo(prev, "rotation", { duration: .8, ease: "power3" });
        var lastX = 0, cur = -1;
        acc.addEventListener("pointermove", function (e) { px(e.clientX + 28); py(e.clientY - 160); pr(Math.max(-8, Math.min(8, (e.clientX - lastX) * .6))); lastX = e.clientX; });
        $$(".acc", acc).forEach(function (a) {
          a.addEventListener("pointerenter", function () {
            var i = +a.getAttribute("data-i");
            if (i !== cur) { prev.innerHTML = $("template", a).innerHTML; cur = i; gsap.fromTo(prev.firstElementChild, { clipPath: "inset(100% 0 0 0)", scale: 1.15 }, { clipPath: "inset(0% 0 0 0)", scale: 1, duration: .7, ease: "expo.out" }); }
            gsap.to(prev, { opacity: 1, scale: 1, duration: .4 });
          });
        });
        acc.addEventListener("pointerleave", function () { gsap.to(prev, { opacity: 0, scale: .9, duration: .3 }); });
      }
    }
  }

  /* ================= f°06 secteurs ================= */
  var sl = $("[data-sectors]"), stage = $("[data-sector-stage]");
  if (sl && stage) {
    sl.innerHTML = SECTORS.map(function (s, i) { return '<li><button type="button" aria-pressed="' + (i === 0) + '" data-i="' + i + '">' + esc(s[0]) + '<span>' + (i + 1 < 10 ? "0" : "") + (i + 1) + '</span></button></li>'; }).join("");
    var show = function (i, instant) {
      var s = SECTORS[i];
      var slide = document.createElement("div"); slide.className = "slide";
      slide.innerHTML = EXCO.viz(s[1], 3 / 2.3, i + 11) + '<div class="sector-caption">' + esc(s[0]) + '</div>';
      stage.appendChild(slide);
      $$("button", sl).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-i") == i ? "true" : "false"); });
      if (!calm && G && !instant) {
        var bands = []; for (var k = 0; k < 6; k++) bands.push(k);
        gsap.fromTo(slide, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: .9, ease: "expo.inOut", onComplete: function () { while (stage.children.length > 1) stage.removeChild(stage.firstChild); } });
        gsap.from($("svg g", slide), { scale: 1.12, transformOrigin: "50% 50%", duration: 1.4, ease: "expo.out" });
      } else { while (stage.children.length > 1) stage.removeChild(stage.firstChild); }
    };
    show(0, true);
    var curS = 0;
    $$("button", sl).forEach(function (b) {
      var go = function () { var i = +b.getAttribute("data-i"); if (i !== curS) { curS = i; show(i); } };
      b.addEventListener("click", go);
      if (EXCO.fine) b.addEventListener("pointerenter", go);
      b.addEventListener("focus", go);
    });
    if (!calm && G) gsap.from($$("li", sl), { x: -24, opacity: 0, stagger: .04, duration: .8, scrollTrigger: { trigger: sl, start: "top 82%", once: true } });
  }

  /* ================= f°07 réseau ================= */
  var mapHost = $("[data-home-map]");
  if (mapHost && window.EXCO_GEO) {
    var fr = CABS.filter(function (c) { return c.zone === "France"; });
    var map = EXCO.makeMap(mapHost, "fr", fr);
    map.onPick = function (c) { location.href = "cabinets.html?cabinet=" + encodeURIComponent(c.id); };
    map.stampIn($("#reseau"));
    var byReg = {};
    fr.forEach(function (c) { byReg[c.region] = (byReg[c.region] || 0) + 1; });
    var regs = Object.keys(byReg).sort(function (a, b) { return byReg[b] - byReg[a]; });
    $("[data-regions]").innerHTML = regs.map(function (r) { return '<li data-region="' + esc(r) + '"><span>' + esc(r) + '</span><i class="lead"></i><b>' + byReg[r] + '</b></li>'; }).join("") +
      '<li><span><b style="font-family:var(--f-serif);font-size:17px;font-weight:600">France métropolitaine</b></span><i class="lead"></i><b class="dbl">' + fr.length + '</b></li>';
    $$("[data-regions] li[data-region]").forEach(function (li) {
      li.addEventListener("pointerenter", function () { var r = li.getAttribute("data-region"); var set = new Set(fr.filter(function (c) { return c.region === r; }).map(function (c) { return c.id; })); map.filter(set); });
      li.addEventListener("pointerleave", function () { map.filter(null); });
    });
    var zone = function (z) { return CABS.filter(function (c) { return c.zone === z; }); };
    var byCountry = function (list) { var o = {}; list.forEach(function (c) { o[c.country] = (o[c.country] || 0) + 1; }); return o; };
    var om = byCountry(zone("Outre-mer")), eu = byCountry(zone("Europe")), af = zone("Afrique").length;
    var cells = Object.keys(om).map(function (k) { return [k, om[k]]; }).concat(Object.keys(eu).map(function (k) { return [k, eu[k]]; })).concat([["Afrique (12 pays)", af]]);
    $("[data-insets]").innerHTML = cells.map(function (c) { return '<div><span>' + esc(c[0]) + '</span><b>' + c[1] + '</b></div>'; }).join("");
    EXCO.flip($("[data-count-cabs]"), CABS.length, { trigger: $("#reseau"), start: "top 60%" });
  }

  /* ================= f°08 gouvernance ================= */
  var ppl = $("[data-people]");
  if (ppl) {
    ppl.innerHTML = BUREAU.map(function (p) {
      return '<figure class="person" style="margin:0"><div class="ph"><img src="assets/img/portraits/' + p[0] + '-320.webp" srcset="assets/img/portraits/' + p[0] + '-320.webp 320w, assets/img/portraits/' + p[0] + '-640.webp 640w" sizes="200px" alt="Portrait de ' + esc(p[1]) + '" loading="lazy"><i class="scan"></i></div><div class="sig"></div>' +
        '<figcaption><h3>' + esc(p[1]) + '</h3><p>' + esc(p[2]) + (p[3] ? '<br><span class="role">' + esc(p[3]) + '</span>' : "") + '</p></figcaption></figure>';
    }).join("");
    $("[data-board]").innerHTML = COMITE.map(function (p) {
      return '<li><img src="assets/img/portraits/' + p[0] + '-320.webp" alt="" loading="lazy"><div><b>' + esc(p[1]) + '</b><span>' + esc(p[2]) + '</span></div></li>';
    }).join("");
    if (!calm && G) {
      $$(".person", ppl).forEach(function (p, i) {
        var tl = gsap.timeline({ scrollTrigger: { trigger: p, start: "top 88%", once: true }, delay: (i % 4) * .12 });
        tl.fromTo($(".ph", p), { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.2, ease: "expo.inOut" })
          .fromTo($(".scan", p), { top: "0%", opacity: 1 }, { top: "100%", opacity: 0, duration: 1.2, ease: "expo.inOut" }, 0)
          .fromTo($(".sig", p), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "expo.inOut" }, .6)
          .from($("figcaption", p), { y: 14, opacity: 0, duration: .8 }, .7);
      });
      gsap.from($$("[data-board] li"), { y: 16, opacity: 0, stagger: .04, duration: .7, scrollTrigger: { trigger: "[data-board]", start: "top 85%", once: true } });
      if (window.SplitText) {
        var gq = SplitText.create("#gov-title", { type: "chars" });
        gsap.from(gq.chars, { opacity: 0, y: 30, rotate: 8, stagger: .03, duration: .9, ease: "back.out(2)", scrollTrigger: { trigger: "#gov-title", start: "top 80%", once: true } });
      }
    }
  }

  /* ================= f°09 engagements : coches à la plume ================= */
  $$("[data-checklist] .box").forEach(function (b) {
    b.innerHTML = '<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M7 18 L14 25 L30 4"/></svg>';
  });
  if (!calm && G && window.DrawSVGPlugin) {
    $$("[data-checklist] li").forEach(function (li, i) {
      gsap.from($("path", li), { drawSVG: "0%", duration: .7, ease: "power2.inOut", scrollTrigger: { trigger: li, start: "top 80%", once: true }, delay: .1 });
      gsap.from($("div", li), { x: 18, opacity: 0, duration: .9, scrollTrigger: { trigger: li, start: "top 85%", once: true } });
    });
    var col = $(".collage");
    if (col) {
      $$("figure", col).forEach(function (f, i) { gsap.from(f, { y: 60 + i * 30, rotate: i % 2 ? 3 : -3, opacity: 0, duration: 1.4, scrollTrigger: { trigger: col, start: "top 80%", once: true }, delay: i * .12 }); });
      EXCO.stamp(col, "EXCO • ENGAGEMENTS RSE • EXCO • ", "RSE", { orange: true, trigger: col, start: "top 40%" });
    }
  }

  /* ================= f°10 recrutement ================= */
  $$("#carrieres [data-flip]").forEach(function (el) { EXCO.flip(el, +el.getAttribute("data-flip"), { trigger: el.closest(".figures") }); });
  var tabs = $("[data-tabs]");
  if (tabs) {
    var tl2 = $(".tab-list", tabs);
    tl2.innerHTML = METIERS.map(function (m, i) { return '<button role="tab" id="tab-' + i + '" aria-controls="panel-' + i + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + esc(m[0]) + '</button>'; }).join("");
    tabs.insertAdjacentHTML("beforeend", METIERS.map(function (m, i) {
      return '<div class="tab-panel" role="tabpanel" id="panel-' + i + '" aria-labelledby="tab-' + i + '"' + (i ? " hidden" : "") + '><p class="lede" style="color:var(--ink)">' + esc(m[1]) + '</p><a class="btn btn-line btn-sm" href="' + m[2] + '" target="_blank" rel="noopener">Le métier en détail ↗</a></div>';
    }).join(""));
    var tbs = $$("[role=tab]", tabs), pnls = $$("[role=tabpanel]", tabs);
    var sel = function (i, focus) {
      tbs.forEach(function (t, k) { t.setAttribute("aria-selected", k === i); t.tabIndex = k === i ? 0 : -1; });
      pnls.forEach(function (p, k) { p.hidden = k !== i; });
      if (focus) tbs[i].focus();
      if (!calm && G) gsap.from(pnls[i].children, { y: 14, opacity: 0, stagger: .06, duration: .6 });
    };
    tbs.forEach(function (t, i) {
      t.addEventListener("click", function () { sel(i); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); sel((i + 1) % tbs.length, true); }
        if (e.key === "ArrowLeft") { e.preventDefault(); sel((i - 1 + tbs.length) % tbs.length, true); }
      });
    });
  }

  /* ================= f°11 compte à rebours ================= */
  var cd = $("[data-countdown]");
  if (cd) {
    var target = new Date(cd.getAttribute("data-countdown")).getTime();
    var tick = function () {
      var ms = target - Date.now();
      if (ms <= 0) { cd.innerHTML = '<div><b>Passé</b></div>'; return; }
      var d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
      cd.innerHTML = [[d, "jours"], [h, "heures"], [m, "minutes"]].map(function (x) { return '<div><b class="num">' + (x[0] < 10 ? "0" : "") + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join("");
    };
    tick(); setInterval(tick, 30000);
  }

  /* ================= f°12 rendez-vous ================= */
  var rdvHost = $("[data-rdv]");
  if (rdvHost) EXCO.rdv(rdvHost, {});
  if (!calm && G) {
    gsap.from(".rdv-sheet", { y: 60, rotate: -1.5, opacity: 0, duration: 1.4, scrollTrigger: { trigger: "#rendez-vous .rdv", start: "top 80%", once: true } });
  }
})();
