/* Exco · maquette « Le Grand Livre » — socle commun à toutes les pages */
(function () {
  "use strict";
  var root = document.documentElement;
  var storedCalm = null;
  try { storedCalm = localStorage.getItem("exco-calm"); } catch (e) {}
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var calm = storedCalm === "1" || (storedCalm === null && mq.matches);
  root.classList.add("js");
  root.classList.toggle("calm", calm);
  root.classList.toggle("motion", !calm);
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  var EXCO = window.EXCO = { calm: calm, fine: fine, ready: [] };
  var hasGsap = typeof window.gsap !== "undefined";
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    if (window.DrawSVGPlugin) gsap.registerPlugin(DrawSVGPlugin);
    if (window.CustomEase) { gsap.registerPlugin(CustomEase); CustomEase.create("ink", "M0,0 C0.2,0 0.1,1 1,1"); }
    gsap.defaults({ ease: "expo.out", duration: 1.1 });
  }

  /* ---------- utilitaires ---------- */
  EXCO.$ = function (s, c) { return (c || document).querySelector(s); };
  EXCO.$$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  EXCO.fmt = function (n, dec) {
    return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 }).format(n);
  };
  EXCO.norm = function (s) {
    return (s || "").toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[’']/g, " ").replace(/-/g, " ").replace(/\bst\b/g, "saint").replace(/\s+/g, " ").trim();
  };
  EXCO.km = function (a, b) {
    var R = 6371, toR = Math.PI / 180;
    var dLat = (b.lat - a.lat) * toR, dLng = (b.lng - a.lng) * toR;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  /* filtre d'encre pour les tampons */
  var defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  defs.setAttribute("width", "0"); defs.setAttribute("height", "0"); defs.setAttribute("aria-hidden", "true");
  defs.style.position = "absolute";
  defs.innerHTML = '<filter id="ink-rough" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="d"/><feComponentTransfer in="n" result="m"><feFuncA type="discrete" tableValues="0 1 1 1 1 0.6 1 1"/></feComponentTransfer><feComposite in="d" in2="m" operator="in"/></filter>';
  document.body.appendChild(defs);

  /* ---------- tampon ---------- */
  EXCO.stamp = function (host, ring, center, opts) {
    opts = opts || {};
    var id = "sp" + Math.random().toString(36).slice(2, 8);
    var s = document.createElement("div");
    s.className = "stamp" + (opts.orange ? " stamp-orange" : "");
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = '<svg viewBox="0 0 132 132"><defs><path id="' + id + '" d="M66,66 m-48,0 a48,48 0 1,1 96,0 a48,48 0 1,1 -96,0"/></defs>' +
      '<circle cx="66" cy="66" r="62" fill="none" stroke="currentColor" stroke-width="2.4"/>' +
      '<circle cx="66" cy="66" r="57" fill="none" stroke="currentColor" stroke-width="1"/>' +
      '<circle cx="66" cy="66" r="36" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
      '<text><textPath href="#' + id + '" startOffset="0">' + ring + '</textPath></text>' +
      '<text class="stamp-center" x="66" y="76" text-anchor="middle">' + center + '</text></svg>';
    host.appendChild(s);
    if (!calm && hasGsap) {
      gsap.to(s, {
        opacity: .86, scale: 1, rotate: opts.rotate || -9, duration: .5, ease: "back.out(2.2)",
        scrollTrigger: { trigger: opts.trigger || host, start: opts.start || "top 70%", once: true }
      });
    }
    return s;
  };

  /* ---------- compteur à volets ---------- */
  EXCO.flip = function (el, value, o) {
    o = o || {};
    var str = typeof value === "string" ? value : EXCO.fmt(value, o.dec);
    el.setAttribute("aria-label", str);
    if (calm || !hasGsap) { el.textContent = str; return null; }
    el.innerHTML = "";
    var wrap = document.createElement("span"); wrap.className = "flip"; wrap.setAttribute("aria-hidden", "true");
    var cols = [];
    str.split("").forEach(function (ch) {
      if (/\d/.test(ch)) {
        var col = document.createElement("span"); col.className = "flip-col";
        var html = ""; for (var r = 0; r < 2; r++) for (var d = 0; d < 10; d++) html += "<span>" + d + "</span>";
        col.innerHTML = html; col.dataset.d = ch; wrap.appendChild(col); cols.push(col);
      } else {
        var st = document.createElement("span"); st.className = "flip-static"; st.textContent = ch === " " || ch === " " ? " " : ch; wrap.appendChild(st);
      }
    });
    el.appendChild(wrap);
    var tl = gsap.timeline({ paused: true });
    cols.forEach(function (c, i) {
      var d = +c.dataset.d;
      tl.fromTo(c, { yPercent: 0 }, { yPercent: -((10 + d) / 20) * 100, duration: 1.6 + (cols.length - i) * .18, ease: "power4.out" }, i * .04);
    });
    if (o.trigger !== false) {
      ScrollTrigger.create({ trigger: o.trigger || el, start: o.start || "top 85%", once: true, onEnter: function () { tl.delay(o.delay || 0).play(); } });
    }
    return tl;
  };

  /* ---------- Lenis ---------- */
  var lenis = null;
  if (!calm && window.Lenis && hasGsap) {
    lenis = new Lenis({ lerp: .095, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  EXCO.lenis = lenis;
  EXCO.scrollTo = function (target, off) {
    var el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: off || -80, duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + (off || -80), behavior: calm ? "auto" : "smooth" });
  };
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (id.length < 2) return;
    var t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    closeMenu();
    EXCO.scrollTo(t);
    history.replaceState(null, "", id);
  });

  /* ---------- en-tête ---------- */
  var hd = EXCO.$(".hd");
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    if (hd) {
      hd.classList.toggle("is-scrolled", y > 40);
      hd.classList.toggle("is-hidden", y > 400 && y > lastY + 2 && !document.body.classList.contains("menu-open"));
      if (y < lastY - 2) hd.classList.remove("is-hidden");
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var menu = EXCO.$(".menu");
  function closeMenu() {
    if (!menu || !menu.classList.contains("is-open")) return;
    menu.classList.remove("is-open"); document.body.classList.remove("menu-open");
    if (lenis) lenis.start();
    var b = EXCO.$(".hd-menu"); if (b) { b.setAttribute("aria-expanded", "false"); b.focus(); }
  }
  EXCO.$$(".hd-menu").forEach(function (b) {
    b.addEventListener("click", function () {
      menu.classList.add("is-open"); document.body.classList.add("menu-open");
      b.setAttribute("aria-expanded", "true");
      if (lenis) lenis.stop();
      var first = menu.querySelector("a, button"); if (first) first.focus();
      if (!calm && hasGsap) gsap.from(EXCO.$$(".menu-item", menu), { yPercent: 40, opacity: 0, stagger: .05, duration: .7 });
    });
  });
  EXCO.$$(".menu-close").forEach(function (b) { b.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ---------- folio, marge et report ---------- */
  var folioEl = EXCO.$("[data-folio-now]");
  var marginLabel = EXCO.$(".margin-label");
  var totalFolios = EXCO.$$("[data-folio]").length;
  function setFolio(sec) {
    var f = sec.getAttribute("data-folio"), n = sec.getAttribute("data-folio-name") || "";
    if (folioEl) folioEl.textContent = f;
    if (marginLabel) marginLabel.innerHTML = "f° <b>" + f + "</b>&nbsp;&nbsp;" + n;
  }
  function initFolios() {
    if (!hasGsap) return;
    EXCO.$$("[data-folio]").forEach(function (sec) {
      ScrollTrigger.create({ trigger: sec, start: "top 55%", end: "bottom 55%", onToggle: function (s) { if (s.isActive) setFolio(sec); } });
    });
  }
  var totalEl = EXCO.$("[data-folio-total]"); if (totalEl && totalFolios) totalEl.textContent = (totalFolios < 10 ? "0" : "") + totalFolios;

  var report = EXCO.$(".report");
  if (report) {
    var rv = report.querySelector("b"), rl = report.querySelector("span");
    var upd = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      var total = p > .995;
      report.classList.toggle("is-total", total);
      rl.textContent = total ? "Total" : "À reporter";
      rv.textContent = EXCO.fmt(p * 100, 1) + " %";
      report.classList.toggle("is-away", window.scrollY < 120);
    };
    window.addEventListener("scroll", upd, { passive: true }); upd();
  }

  /* ---------- double soulignement ---------- */
  var io = new IntersectionObserver(function (ents) {
    ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -12% 0px" });
  EXCO.$$(".dbl").forEach(function (el) { io.observe(el); });

  /* ---------- titres écrits ligne à ligne ---------- */
  EXCO.splitLines = function (el, o) {
    o = o || {};
    if (calm || !hasGsap || !window.SplitText) return null;
    var anim;
    SplitText.create(el, {
      type: "lines", mask: "lines", autoSplit: true, linesClass: "sl",
      onSplit: function (self) {
        anim = gsap.from(self.lines, {
          yPercent: 112, duration: o.duration || 1.25, stagger: o.stagger || .09, ease: "expo.out", delay: o.delay || 0,
          paused: !!o.paused,
          scrollTrigger: o.paused ? null : { trigger: el, start: o.start || "top 86%", once: true }
        });
        if (o.onAnim) o.onAnim(anim);
        return anim;
      }
    });
    return anim;
  };
  /* ---------- parallaxe et révélations (créées après les épinglages de la page) ---------- */
  function initScroll() {
  EXCO.$$("[data-split]").forEach(function (el) { EXCO.splitLines(el); });
  if (!calm && hasGsap) {
    EXCO.$$("[data-parallax]").forEach(function (el) {
      var amt = parseFloat(el.getAttribute("data-parallax")) || 10;
      gsap.fromTo(el, { yPercent: -amt / 2 }, { yPercent: amt / 2, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    EXCO.$$("[data-reveal]").forEach(function (el) {
      var dir = el.getAttribute("data-reveal") || "up";
      var from = { up: "inset(100% 0 0 0)", left: "inset(0 100% 0 0)", rows: "inset(0 0 100% 0)" }[dir] || "inset(100% 0 0 0)";
      gsap.fromTo(el, { clipPath: from }, { clipPath: "inset(0% 0 0 0)", duration: 1.5, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
      var img = el.querySelector("img");
      if (img) gsap.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.9, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
    });
    EXCO.$$("[data-fade]").forEach(function (el) {
      gsap.from(el.children, { y: 26, opacity: 0, stagger: .07, duration: 1, scrollTrigger: { trigger: el, start: "top 86%", once: true } });
    });
  }
  }
  document.addEventListener("DOMContentLoaded", function () {
    initScroll(); initFolios();
    if (hasGsap) { ScrollTrigger.sort(); ScrollTrigger.refresh(); }
  });

  /* ---------- boutons magnétiques ---------- */
  if (!calm && fine && hasGsap) {
    EXCO.$$("[data-magnetic]").forEach(function (b) {
      var xTo = gsap.quickTo(b, "x", { duration: .6, ease: "power3" }), yTo = gsap.quickTo(b, "y", { duration: .6, ease: "power3" });
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .32); yTo((e.clientY - r.top - r.height / 2) * .42);
      });
      b.addEventListener("pointerleave", function () { gsap.to(b, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, .4)" }); });
    });
    /* inclinaison 3D */
    EXCO.$$("[data-tilt]").forEach(function (c) {
      var max = parseFloat(c.getAttribute("data-tilt")) || 8;
      gsap.set(c, { transformPerspective: 900 });
      var rx = gsap.quickTo(c, "rotationX", { duration: .7, ease: "power3" }), ry = gsap.quickTo(c, "rotationY", { duration: .7, ease: "power3" });
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - .5) * max * 2); rx(-((e.clientY - r.top) / r.height - .5) * max * 2);
      });
      c.addEventListener("pointerleave", function () { rx(0); ry(0); });
    });
  }

  /* ---------- curseur plume et traînée d'encre ---------- */
  if (!calm && fine) {
    var cur = document.createElement("div"); cur.className = "cursor";
    var lab = document.createElement("div"); lab.className = "cursor-label";
    var cv = document.createElement("canvas"); cv.className = "ink-canvas";
    document.body.appendChild(cv); document.body.appendChild(cur); document.body.appendChild(lab);
    var ctx = cv.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1);
    var size = function () { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); window.addEventListener("resize", size);
    var pts = [], running = false, mx = -100, my = -100, cx = -100, cy = -100;
    var LIFE = 950;
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX; my = e.clientY;
      var now = performance.now();
      var last = pts[pts.length - 1];
      if (!last || Math.hypot(mx - last.x, my - last.y) > 3) pts.push({ x: mx, y: my, t: now });
      if (pts.length > 70) pts.shift();
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    var loop = function () {
      var now = performance.now();
      cx += (mx - cx) * .35; cy += (my - cy) * .35;
      cur.style.transform = "translate(" + cx + "px," + cy + "px)";
      lab.style.left = cx + "px"; lab.style.top = cy + "px";
      while (pts.length && now - pts[0].t > LIFE) pts.shift();
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i];
        var age = (now - b.t) / LIFE;
        var sp = Math.hypot(b.x - a.x, b.y - a.y);
        var w = Math.max(.6, 2.6 - sp * .05) * (1 - age * .6);
        var wet = 1 - age;
        ctx.strokeStyle = "rgba(" + Math.round(0 + 87 * age) + "," + Math.round(98 - 11 * age) + "," + Math.round(132 - 46 * age) + "," + (.55 * wet) + ")";
        ctx.lineWidth = w; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      if (pts.length || Math.abs(mx - cx) > .5 || Math.abs(my - cy) > .5) requestAnimationFrame(loop);
      else running = false;
    };
    document.addEventListener("pointerover", function (e) {
      var t = e.target.closest && e.target.closest("a, button, [data-cursor], input, label, select, textarea");
      cur.classList.toggle("is-link", !!t);
      var txt = t && t.getAttribute("data-cursor");
      lab.textContent = txt || ""; lab.classList.toggle("is-on", !!txt);
    });
  }

  /* ---------- tourne-page entre les pages ---------- */
  var turn = document.createElement("div"); turn.className = "page-turn"; turn.setAttribute("aria-hidden", "true");
  document.body.appendChild(turn);
  var arrived = false;
  try { arrived = sessionStorage.getItem("exco-turn") === "1"; sessionStorage.removeItem("exco-turn"); } catch (e) {}
  EXCO.arrivedByTurn = arrived;
  if (arrived && !calm && hasGsap) {
    gsap.set(turn, { x: 0 });
    gsap.to(turn, { x: "-105%", duration: .9, ease: "expo.inOut", delay: .1 });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || calm || !hasGsap) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank" || a.hasAttribute("download")) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$|^\/[a-z-]*$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    try { sessionStorage.setItem("exco-turn", "1"); } catch (er) {}
    gsap.fromTo(turn, { x: "105%" }, { x: 0, duration: .65, ease: "expo.inOut", onComplete: function () { location.href = url.href; } });
  });
  window.addEventListener("pageshow", function (e) { if (e.persisted && hasGsap) gsap.set(turn, { x: "105%" }); });

  /* ---------- version calme ---------- */
  EXCO.$$("[data-calm-toggle]").forEach(function (b) {
    b.setAttribute("aria-pressed", calm ? "true" : "false");
    b.textContent = calm ? "Rétablir les animations" : "Réduire les animations";
    b.addEventListener("click", function () {
      try { localStorage.setItem("exco-calm", calm ? "0" : "1"); } catch (e) {}
      location.reload();
    });
  });

  /* ---------- horloge métier : ouvert maintenant ---------- */
  EXCO.TZ = {
    "France": "Europe/Paris", "Pologne": "Europe/Warsaw", "Portugal": "Europe/Lisbon", "Maroc": "Africa/Casablanca", "Tunisie": "Africa/Tunis",
    "Sénégal": "Africa/Dakar", "Mali": "Africa/Bamako", "Mauritanie": "Africa/Nouakchott", "Burkina Faso": "Africa/Ouagadougou",
    "Côte d'Ivoire": "Africa/Abidjan", "Bénin": "Africa/Porto-Novo", "Cameroun": "Africa/Douala", "Gabon": "Africa/Libreville",
    "Congo": "Africa/Brazzaville", "Madagascar": "Indian/Antananarivo", "Guadeloupe": "America/Guadeloupe", "Martinique": "America/Martinique",
    "La Réunion": "Indian/Reunion", "Polynésie française": "Pacific/Tahiti"
  };
  var DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  EXCO.localNow = function (country) {
    var tz = EXCO.TZ[country] || "Europe/Paris";
    var parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
    var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: DAYS[map[o.weekday]], min: (+o.hour % 24) * 60 + (+o.minute) };
  };
  var toMin = function (s) { var m = s.trim().match(/^(\d{1,2})h(\d{2})?$/); return m ? +m[1] * 60 + (+(m[2] || 0)) : null; };
  EXCO.ranges = function (txt) {
    if (!txt || txt === "Fermé" || txt === "à confirmer") return [];
    var parts = txt.split("|").map(function (s) { return s.trim(); });
    var out = [];
    if (parts.length === 2 && parts.every(function (p) { return p.indexOf("-") < 0; })) {
      var a = toMin(parts[0]), b = toMin(parts[1]); if (a !== null && b !== null) out.push([a, b]); return out;
    }
    parts.forEach(function (p) { var ab = p.split("-"); if (ab.length === 2) { var a2 = toMin(ab[0]), b2 = toMin(ab[1]); if (a2 !== null && b2 !== null) out.push([a2, b2]); } });
    return out;
  };
  EXCO.isOpen = function (cab) {
    if (!cab.hours || !cab.hours.length) return null;
    var now = EXCO.localNow(cab.country);
    var row = cab.hours.filter(function (h) { return h[0] === now.day; })[0];
    if (!row) return null;
    if (row[1] === "à confirmer") return null;
    return EXCO.ranges(row[1]).some(function (r) { return now.min >= r[0] && now.min < r[1]; });
  };

  window.addEventListener("load", function () { if (hasGsap) ScrollTrigger.refresh(); });
})();
