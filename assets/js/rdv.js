/* Prise de rendez-vous en quatre écritures — simulation, aucun envoi */
(function () {
  "use strict";
  var EXCO = window.EXCO, CABS = window.EXCO_CABINETS || [];
  var SUBJECTS = ["Devis", "Demande d'informations", "Client Exco", "Recrutement", "Autres"];
  var STEPS = ["Votre demande", "Vos besoins", "Votre cabinet", "Vos coordonnées"];

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  EXCO.rdv = function (host, opts) {
    opts = opts || {};
    var params = new URLSearchParams(location.search);
    var preCab = (params.get("cabinet") || "").replace(/^exco-/, "") || null;
    var preSvc = opts.service ? [opts.service] : [];
    var uid = "rdv" + Math.random().toString(36).slice(2, 6);

    host.innerHTML =
      '<div class="rdv-sheet">' +
      '<ol class="rdv-steps" aria-label="Étapes">' + STEPS.map(function (s, i) { return '<li' + (i === 0 ? ' class="is-on" aria-current="step"' : "") + '><span class="st-l">Écriture </span>' + (i + 1) + '<b>' + s + '</b></li>'; }).join("") + '</ol>' +
      '<form class="rdv-body" novalidate>' +
      '<fieldset class="rdv-step" data-step="0" style="border:0;margin:0;padding:0"><legend class="d4" style="margin-bottom:18px">Quel est l’objet de votre demande ?</legend><div class="choices">' +
      SUBJECTS.map(function (s, i) { return '<label class="chip"><input type="radio" name="sujet" value="' + esc(s) + '"' + (i === 0 ? " checked" : "") + '><span>' + esc(s) + '</span></label>'; }).join("") +
      '</div><p class="note" style="margin-top:22px">Ce sont les mêmes rubriques que le formulaire actuel d’exco.fr.</p></fieldset>' +
      '<fieldset class="rdv-step" data-step="1" hidden style="border:0;margin:0;padding:0"><legend class="d4" style="margin-bottom:18px">Quels métiers vous concernent ?</legend><div class="choices">' +
      EXCO.SERVICES.map(function (s) { return '<label class="chip"><input type="checkbox" name="services" value="' + esc(s) + '"' + (preSvc.indexOf(s) >= 0 ? " checked" : "") + '><span>' + esc(s) + '</span></label>'; }).join("") +
      '</div><p class="note" style="margin-top:22px">Vous pouvez en cocher plusieurs, ou aucun si vous ne savez pas encore.</p></fieldset>' +
      '<fieldset class="rdv-step" data-step="2" hidden style="border:0;margin:0;padding:0"><legend class="d4" style="margin-bottom:18px">Où se trouve votre entreprise ?</legend>' +
      '<div class="search-line" style="margin-top:0"><div class="field"><label for="' + uid + '-where">Ville, code postal ou département</label><input id="' + uid + '-where" name="where" autocomplete="address-level2" placeholder="Par exemple : Metz, 33000 ou 64"></div>' +
      '<button type="button" class="btn btn-line" data-locate style="align-self:flex-end">Me localiser</button></div>' +
      '<p class="note" data-where-status style="margin-top:10px" aria-live="polite"></p><ul class="suggest" data-suggest></ul></fieldset>' +
      '<fieldset class="rdv-step" data-step="3" hidden style="border:0;margin:0;padding:0"><legend class="d4" style="margin-bottom:18px">Vos coordonnées</legend><div class="form-grid">' +
      '<div class="field"><label for="' + uid + '-civ">Civilité</label><select id="' + uid + '-civ" name="civilite"><option value="">Non précisée</option><option>Madame</option><option>Monsieur</option></select></div>' +
      '<div class="field"><label for="' + uid + '-ent">Entreprise</label><input id="' + uid + '-ent" name="entreprise" autocomplete="organization"></div>' +
      '<div class="field"><label for="' + uid + '-pre">Prénom</label><input id="' + uid + '-pre" name="prenom" autocomplete="given-name"></div>' +
      '<div class="field"><label for="' + uid + '-nom">Nom *</label><input id="' + uid + '-nom" name="nom" autocomplete="family-name" required></div>' +
      '<div class="field"><label for="' + uid + '-mail">E-mail *</label><input id="' + uid + '-mail" name="email" type="email" autocomplete="email" required></div>' +
      '<div class="field"><label for="' + uid + '-tel">Téléphone</label><input id="' + uid + '-tel" name="tel" type="tel" autocomplete="tel"></div>' +
      '<div class="field full"><label for="' + uid + '-msg">Votre message</label><textarea id="' + uid + '-msg" name="message" placeholder="Votre activité, votre projet, vos disponibilités…"></textarea></div>' +
      '<label class="full small" style="display:flex;gap:10px;align-items:flex-start"><input type="checkbox" name="rgpd" style="margin-top:6px;accent-color:var(--blue-deep)"> <span>J’accepte que mes informations soient utilisées pour répondre à ma demande. *</span></label>' +
      '</div><p class="legal-mini">Les informations recueillies sont enregistrées par Exco SAS, 42 avenue de la Grande Armée, 75017 Paris, pour gérer votre demande. Vous pouvez exercer vos droits en écrivant à info@exco.fr. Détail dans la politique de confidentialité.</p></fieldset>' +
      '<div class="rdv-step rdv-done" data-step="4" hidden></div>' +
      '<p class="rdv-error" role="alert" aria-live="assertive"></p>' +
      '</form>' +
      '<div class="rdv-nav"><button type="button" class="btn btn-line btn-sm" data-prev hidden>Écriture précédente</button><span class="note" data-pos>1 / 4</span><button type="button" class="btn btn-sm" data-next data-magnetic>Écriture suivante</button></div>' +
      '</div>';

    var form = host.querySelector("form"), steps = host.querySelectorAll(".rdv-step"), bar = host.querySelectorAll(".rdv-steps li");
    var prev = host.querySelector("[data-prev]"), next = host.querySelector("[data-next]"), pos = host.querySelector("[data-pos]");
    var err = host.querySelector(".rdv-error"), sug = host.querySelector("[data-suggest]"), wstat = host.querySelector("[data-where-status]");
    var whereIn = host.querySelector("[name=where]");
    var cur = 0;
    var chosen = null;

    function selected(name) { return Array.prototype.map.call(form.querySelectorAll("[name=" + name + "]:checked"), function (i) { return i.value; }); }
    function renderSuggest(pt, label) {
      var svcs = selected("services");
      var pool = CABS.filter(function (c) { return c.lat != null && EXCO.hasServices(c, svcs); });
      if (!pool.length) pool = CABS.filter(function (c) { return c.lat != null; });
      var list = EXCO.nearest(pt, pool, 4);
      wstat.textContent = label ? "Cabinets les plus proches de " + label + (svcs.length ? ", pour les métiers choisis" : "") + " :" : "";
      sug.innerHTML = list.map(function (o, i) {
        var c = o.c;
        return '<li><label><input type="radio" name="cab" value="' + c.id + '"' + (i === 0 ? " checked" : "") + '><span><b>' + esc(c.name) + '</b><small>' + esc(c.address || c.city) + '</small></span><span class="km">' + EXCO.fmt(o.d < 10 ? o.d : Math.round(o.d), o.d < 10 ? 1 : 0) + ' km</span></label></li>';
      }).join("") + '<li><label><input type="radio" name="cab" value="reseau"><span><b>Laissez Exco m’orienter</b><small>Exco France transmet votre demande au cabinet le plus adapté.</small></span><span></span></label></li>';
      if (!EXCO.calm && window.gsap) gsap.from(sug.children, { x: -18, opacity: 0, stagger: .06, duration: .7 });
    }
    function preselect(id) {
      var c = CABS.filter(function (x) { return x.id === id; })[0];
      if (!c) return;
      whereIn.value = c.city;
      sug.innerHTML = '<li><label><input type="radio" name="cab" value="' + c.id + '" checked><span><b>' + esc(c.name) + '</b><small>' + esc(c.address || c.city) + '</small></span><span class="km">choisi</span></label></li>';
      wstat.textContent = "Cabinet sélectionné depuis la page Trouver un cabinet. Tapez une autre ville pour changer.";
    }
    if (preCab) preselect(preCab);
    var tmr;
    whereIn.addEventListener("input", function () {
      clearTimeout(tmr);
      tmr = setTimeout(function () {
        var r = EXCO.search(whereIn.value);
        if (!whereIn.value.trim()) { sug.innerHTML = ""; wstat.textContent = ""; return; }
        if (!r) { sug.innerHTML = ""; wstat.textContent = "Aucune ville ni département ne correspond à « " + whereIn.value + " ». Essayez un code postal ou « Me localiser »."; return; }
        if (r.type === "zone") {
          var inZone = CABS.filter(function (c) { return r.country ? c.country === r.country : c.zone === r.zone; });
          renderSuggest({ lat: inZone[0].lat, lng: inZone[0].lng }, r.label);
        } else renderSuggest(r, r.label);
      }, 220);
    });
    host.querySelector("[data-locate]").addEventListener("click", function () {
      if (!navigator.geolocation) { wstat.textContent = "La géolocalisation n’est pas disponible sur cet appareil. Tapez votre ville."; return; }
      wstat.textContent = "Localisation en cours…";
      navigator.geolocation.getCurrentPosition(function (p) {
        renderSuggest({ lat: p.coords.latitude, lng: p.coords.longitude }, "votre position");
      }, function () { wstat.textContent = "Localisation refusée ou impossible. Tapez votre ville ou votre code postal."; }, { timeout: 8000 });
    });

    function validate(i) {
      if (i === 0 && !selected("sujet").length) return "Choisissez l’objet de votre demande pour continuer.";
      if (i === 2 && !selected("cab").length) return "Indiquez votre ville pour voir les cabinets proches, ou choisissez « Laissez Exco m’orienter ».";
      if (i === 3) {
        if (!form.nom.value.trim()) { form.nom.focus(); return "Indiquez votre nom."; }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.value.trim())) { form.email.focus(); return "Indiquez une adresse e-mail valide, par exemple nom@entreprise.fr."; }
        if (!form.rgpd.checked) return "Cochez la case d’accord pour que la demande puisse être traitée.";
      }
      return "";
    }
    function go(n) {
      var from = steps[cur], to = steps[n];
      err.textContent = "";
      Array.prototype.forEach.call(bar, function (li, k) {
        li.classList.toggle("is-on", k === n); li.classList.toggle("is-done", k < n);
        if (k === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      });
      var show = function () {
        from.hidden = true; to.hidden = false;
        if (!EXCO.calm && window.gsap) gsap.fromTo(to, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .6 });
        var f = to.querySelector("input, select, textarea"); if (f && n > 0 && n < 4) f.focus({ preventScroll: true });
      };
      if (!EXCO.calm && window.gsap) gsap.to(from, { opacity: 0, y: -12, duration: .25, onComplete: show }); else show();
      cur = n;
      prev.hidden = n === 0 || n === 4;
      next.hidden = n === 4;
      next.textContent = n === 3 ? "Enregistrer la demande" : "Écriture suivante";
      pos.textContent = n < 4 ? (n + 1) + " / 4" : "Demande enregistrée";
      if (n === 2 && !sug.children.length && !preCab && opts.city) { whereIn.value = opts.city; whereIn.dispatchEvent(new Event("input")); }
    }
    function done() {
      var cabId = selected("cab")[0], c = CABS.filter(function (x) { return x.id === cabId; })[0];
      var rows = [
        ["Date", new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date())],
        ["Objet", selected("sujet")[0]],
        ["Métiers", selected("services").join(", ") || "À préciser avec le cabinet"],
        ["Cabinet", c ? c.name + (c.tel ? " · " + c.tel : "") : "Exco France orientera la demande"],
        ["Contact", [form.civilite.value, form.prenom.value, form.nom.value].filter(Boolean).join(" ") + " · " + form.email.value]
      ];
      var box = steps[4];
      box.innerHTML = '<h3 class="d4">Votre demande est enregistrée.</h3><p class="small" style="margin-top:8px;color:var(--ink-2)">Ceci est une maquette : aucune information n’a été envoyée. Sur le site final, le cabinet choisi recevra la demande.</p>' +
        '<dl class="recap">' + rows.map(function (r) { return '<div><dt class="k">' + r[0] + '</dt><dd style="margin:0">' + esc(r[1]) + '</dd></div>'; }).join("") + '</dl>' +
        '<p style="margin-top:18px"><button type="button" class="btn btn-line btn-sm" data-restart>Nouvelle demande</button></p>';
      EXCO.stamp(box, "SIMULATION • AUCUN ENVOI • EXCO • ", "Visé", { orange: true, trigger: box, start: "top 95%" });
      var s = box.querySelector(".stamp");
      if (!EXCO.calm && window.gsap) gsap.fromTo(s, { opacity: 0, scale: 1.8, rotate: -24 }, { opacity: .88, scale: 1, rotate: -9, duration: .55, ease: "back.out(2.4)", delay: .5 });
      box.querySelector("[data-restart]").addEventListener("click", function () { form.reset(); sug.innerHTML = ""; wstat.textContent = ""; go(0); });
      go(4);
    }
    next.addEventListener("click", function () {
      var m = validate(cur);
      if (m) { err.textContent = m; if (!EXCO.calm && window.gsap) gsap.fromTo(err, { x: -6 }, { x: 0, duration: .5, ease: "elastic.out(1,.3)" }); return; }
      if (cur === 3) done(); else go(cur + 1);
    });
    prev.addEventListener("click", function () { if (cur > 0) go(cur - 1); });
    form.addEventListener("submit", function (e) { e.preventDefault(); next.click(); });
    return { go: go };
  };
})();
