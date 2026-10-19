/* Papier vivant : l'image est découpée en lignes de registre (WebGL / OGL).
   Sans WebGL ou en version calme : image fixe + réglure en CSS. */
(function () {
  "use strict";
  var EXCO = window.EXCO;

  var VERT = "attribute vec2 uv; attribute vec2 position; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 0., 1.); }";
  var FRAG = [
    "precision highp float;",
    "uniform sampler2D tMap; uniform vec2 uRes; uniform vec2 uImg; uniform float uTime; uniform float uReveal; uniform float uScroll; uniform float uRows; uniform vec2 uMouse; uniform float uHover;",
    "varying vec2 vUv;",
    "float rnd(float n){ return fract(sin(n*91.3458)*47453.5453); }",
    "vec2 coverUv(vec2 uv){ float rs = uRes.x/uRes.y; float ri = uImg.x/uImg.y; vec2 s = rs < ri ? vec2(rs/ri, 1.) : vec2(1., ri/rs); return (uv - .5) * s + .5; }",
    "void main(){",
    "  vec2 uv = vUv;",
    "  float rowF = uv.y * uRows; float row = floor(rowF); float r = rnd(row + 1.);",
    "  float st = r * .45; float prog = clamp((uReveal - st) / .55, 0., 1.); prog = 1. - pow(1. - prog, 3.);",
    "  float dy = abs(uv.y - uMouse.y); float infl = smoothstep(.3, 0., dy) * uHover;",
    "  float shift = (r - .5) * (.07 * (1. - prog)) + (r - .5) * .010 * sin(uTime * .7 + row * 1.7) + infl * (uMouse.x - .5) * (r - .3) * .09 + uScroll * (r - .5) * .14;",
    "  vec2 tuv = coverUv(vec2(uv.x + shift, uv.y * (1. - uScroll * .06) + uScroll * .03));",
    "  vec3 col = texture2D(tMap, tuv).rgb;",
    "  vec3 paper = vec3(.933, .914, .863);",
    "  float written = smoothstep(prog * 1.04 + .002, prog * 1.04 - .002, uv.x);",
    "  col = mix(paper, col, written);",
    "  float f = fract(rowF); float line = smoothstep(0., .03, f) * smoothstep(1., .97, f);",
    "  col = mix(mix(col, vec3(0., .384, .518), .30), col, line);",
    "  float g = rnd(dot(floor(gl_FragCoord.xy), vec2(12.9898, 78.233)) + floor(uTime * 12.)) - .5;",
    "  col += g * .03;",
    "  gl_FragColor = vec4(col, 1.);",
    "}"
  ].join("\n");

  function supportsGL() {
    try { var c = document.createElement("canvas"); return !!(c.getContext("webgl") || c.getContext("experimental-webgl")); } catch (e) { return false; }
  }

  EXCO.strips = function (host, opts) {
    opts = opts || {};
    var img = host.querySelector("img.gl-src");
    var api = { reveal: function () {} };
    if (EXCO.calm || !window.OGL || !supportsGL() || !img) {
      var lines = document.createElement("div"); lines.className = "gl-fallback-lines"; host.appendChild(lines);
      if (!EXCO.calm && window.gsap) {
        gsap.set(img, { clipPath: "inset(0 100% 0 0)" });
        api.reveal = function (d) { gsap.to(img, { clipPath: "inset(0 0% 0 0)", duration: d || 2, ease: "expo.inOut" }); };
        if (opts.autoReveal !== false) api.reveal();
      }
      return api;
    }
    var O = window.OGL;
    var renderer = new O.Renderer({ dpr: Math.min(1.5, window.devicePixelRatio || 1), alpha: false, antialias: false });
    var gl = renderer.gl;
    gl.clearColor(.933, .914, .863, 1);
    host.appendChild(gl.canvas);
    host.classList.add("has-gl");
    var tex = new O.Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });
    var program = new O.Program(gl, {
      vertex: VERT, fragment: FRAG,
      uniforms: {
        tMap: { value: tex }, uRes: { value: [1, 1] }, uImg: { value: [16, 9] }, uTime: { value: 0 }, uReveal: { value: 0 },
        uScroll: { value: 0 }, uRows: { value: 20 }, uMouse: { value: [.5, .5] }, uHover: { value: 0 }
      }
    });
    var mesh = new O.Mesh(gl, { geometry: new O.Triangle(gl), program: program });
    var u = program.uniforms;
    var w = 1, h = 1;
    function resize() {
      var r = host.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height);
      renderer.setSize(w, h);
      u.uRes.value = [w, h];
      u.uRows.value = Math.max(8, Math.round(h / (opts.rowPx || 48)));
    }
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(host); else window.addEventListener("resize", resize);

    var loaded = false;
    function load() {
      var im = new Image(); im.decoding = "async";
      im.onload = function () { tex.image = im; u.uImg.value = [im.naturalWidth, im.naturalHeight]; loaded = true; };
      im.src = img.currentSrc || img.src;
    }
    if (img.complete && img.naturalWidth) load(); else img.addEventListener("load", load, { once: true });

    var target = { x: .5, y: .5, hover: 0 };
    host.parentElement.addEventListener("pointermove", function (e) {
      var r = host.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width; target.y = 1 - (e.clientY - r.top) / r.height; target.hover = 1;
    });
    host.parentElement.addEventListener("pointerleave", function () { target.hover = 0; });

    var visible = true, raf = 0, t0 = performance.now();
    function frame(now) {
      raf = 0;
      if (!visible) return;
      u.uTime.value = (now - t0) / 1000;
      u.uMouse.value = [u.uMouse.value[0] + (target.x - u.uMouse.value[0]) * .08, u.uMouse.value[1] + (target.y - u.uMouse.value[1]) * .08];
      u.uHover.value += (target.hover - u.uHover.value) * .05;
      if (loaded) renderer.render({ scene: mesh });
      raf = requestAnimationFrame(frame);
    }
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    }).observe(host);
    raf = requestAnimationFrame(frame);

    if (window.gsap) {
      ScrollTrigger.create({ trigger: host.parentElement, start: "top top", end: "bottom top", scrub: true, onUpdate: function (s) { u.uScroll.value = s.progress; } });
    }
    api.reveal = function (d) {
      if (window.gsap) gsap.to(u.uReveal, { value: 1, duration: d || 2.6, ease: "power2.inOut" });
      else u.uReveal.value = 1;
    };
    if (opts.autoReveal !== false) api.reveal();
    return api;
  };
})();
