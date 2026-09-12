/* ============================================================
   gl.js — Motore WebGL leggero, zero dipendenze
   1) IntroScene  : wordmark 3D che si compone da particelle
   2) HeroScene   : campo di particelle + onde reattive a mouse/scroll
   ============================================================ */
(function (w) {
  'use strict';

  /* ---------------- mini gl helpers ---------------- */
  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('shader', gl.getShaderInfoLog(s)); return null;
    }
    return s;
  }
  function program(gl, vs, fs) {
    var v = compile(gl, gl.VERTEX_SHADER, vs), f = compile(gl, gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    var p = gl.createProgram();
    gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(p)); return null; }
    return p;
  }
  function ctx(canvas) {
    var o = { alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: 'high-performance' };
    return canvas.getContext('webgl', o) || canvas.getContext('experimental-webgl', o);
  }

  /* ---------------- sampling: testo -> punti ---------------- */
  function samplePointsFromText(lines, opts) {
    opts = opts || {};
    var W = opts.width || 1400, H = opts.height || 420;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var x = c.getContext('2d');
    x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#fff';
    x.textAlign = 'center'; x.textBaseline = 'middle';

    var n = lines.length;
    var size = opts.fontSize || Math.floor(H / (n * 1.22));
    var fam = opts.font || "'Anton','Haettenschweiler','Arial Narrow',Impact,sans-serif";
    var lh = size * 1.02;
    var startY = H / 2 - ((n - 1) * lh) / 2;

    for (var i = 0; i < n; i++) {
      var fs = size;
      x.font = '400 ' + fs + "px " + fam;
      // shrink-to-fit
      var guard = 0;
      while (x.measureText(lines[i]).width > W * 0.92 && guard < 60) {
        fs -= 4; x.font = '400 ' + fs + 'px ' + fam; guard++;
      }
      x.fillText(lines[i], W / 2, startY + i * lh);
    }

    var d = x.getImageData(0, 0, W, H).data;
    var step = opts.step || 4;
    var pts = [];
    for (var py = 0; py < H; py += step) {
      for (var px = 0; px < W; px += step) {
        var idx = (py * W + px) * 4;
        if (d[idx] > 128) {
          pts.push(
            (px / W - 0.5) * 2.0,
            -(py / H - 0.5) * 2.0 * (H / W)
          );
        }
      }
    }
    return { pts: pts, aspect: W / H };
  }

  /* ================= INTRO SCENE ================= */
  function IntroScene(canvas, lines, onReady) {
    var gl = ctx(canvas);
    if (!gl) { if (onReady) onReady(false); return null; }

    var sampled = samplePointsFromText(lines, { width: 1500, height: 470, step: 3 });
    var src = sampled.pts;
    var COUNT = src.length / 2;
    if (COUNT < 40) { if (onReady) onReady(false); return null; }

    // attributi: target(2) + seme random(3)
    var target = new Float32Array(COUNT * 2);
    var seed = new Float32Array(COUNT * 3);
    for (var i = 0; i < COUNT; i++) {
      target[i * 2] = src[i * 2];
      target[i * 2 + 1] = src[i * 2 + 1];
      seed[i * 3] = Math.random() * 2 - 1;
      seed[i * 3 + 1] = Math.random() * 2 - 1;
      seed[i * 3 + 2] = Math.random();
    }

    var VS = [
      'attribute vec2 aTarget;',
      'attribute vec3 aSeed;',
      'uniform float uT;',      // 0..1 progresso di assemblaggio
      'uniform float uTime;',
      'uniform float uAspect;',
      'uniform float uScale;',
      'uniform float uDisperse;',
      'varying float vA;',
      'varying float vMix;',
      'void main(){',
      '  float d = aSeed.z;',
      '  float t = clamp((uT - d*0.30) / 0.70, 0.0, 1.0);',
      '  t = 1.0 - pow(1.0 - t, 3.0);',            // easeOutCubic
      '  vec2 chaos = aSeed.xy * 2.2;',
      '  float ang = aSeed.z * 6.2831 + uTime*0.35;',
      '  chaos += vec2(cos(ang), sin(ang)) * 0.55;',
      '  vec2 p = mix(chaos, aTarget, t);',
      '  p += vec2(cos(uTime*0.7 + d*9.0), sin(uTime*0.6 + d*7.0)) * 0.012 * (1.0-t*0.8);',
      '  p = mix(p, p + aSeed.xy*1.8, uDisperse);',
      '  float z = mix(aSeed.x*0.6, 0.0, t);',
      '  vec2 pos = p * uScale;',
      '  pos.x /= uAspect;',
      '  gl_Position = vec4(pos, 0.0, 1.0);',
      '  gl_PointSize = mix(1.9, 3.3, t) * (0.85 + aSeed.z*0.8);',
      '  vA = mix(0.20, 0.95, t) * (1.0 - uDisperse);',
      '  vMix = aSeed.z;',
      '}'
    ].join('\n');

    var FS = [
      'precision mediump float;',
      'varying float vA;',
      'varying float vMix;',
      'void main(){',
      '  vec2 uv = gl_PointCoord - 0.5;',
      '  float r = length(uv);',
      '  if(r > 0.5) discard;',
      '  float a = smoothstep(0.5, 0.06, r) * vA;',
      '  vec3 cy = vec3(0.0, 0.898, 1.0);',
      '  vec3 vi = vec3(0.486, 0.235, 1.0);',
      '  vec3 mg = vec3(1.0, 0.180, 0.533);',
      '  vec3 col = mix(vi, cy, smoothstep(0.0,0.55,vMix));',
      '  col = mix(col, mg, smoothstep(0.55,1.0,vMix)*0.85);',
      '  col = mix(col, vec3(1.0), 0.22);',
      '  gl_FragColor = vec4(col, a);',
      '}'
    ].join('\n');

    var prog = program(gl, VS, FS);
    if (!prog) { if (onReady) onReady(false); return null; }
    gl.useProgram(prog);

    var bT = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bT); gl.bufferData(gl.ARRAY_BUFFER, target, gl.STATIC_DRAW);
    var aT = gl.getAttribLocation(prog, 'aTarget');
    gl.enableVertexAttribArray(aT); gl.vertexAttribPointer(aT, 2, gl.FLOAT, false, 0, 0);

    var bS = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bS); gl.bufferData(gl.ARRAY_BUFFER, seed, gl.STATIC_DRAW);
    var aS = gl.getAttribLocation(prog, 'aSeed');
    gl.enableVertexAttribArray(aS); gl.vertexAttribPointer(aS, 3, gl.FLOAT, false, 0, 0);

    var uT = gl.getUniformLocation(prog, 'uT'),
        uTime = gl.getUniformLocation(prog, 'uTime'),
        uAspect = gl.getUniformLocation(prog, 'uAspect'),
        uScale = gl.getUniformLocation(prog, 'uScale'),
        uDisp = gl.getUniformLocation(prog, 'uDisperse');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.clearColor(0, 0, 0, 0);

    var dpr = Math.min(w.devicePixelRatio || 1, 2), aspect = 1;
    function resize() {
      var r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      aspect = (r.width || 1) / (r.height || 1);
    }
    resize();
    w.addEventListener('resize', resize);

    var api = { t: 0, disperse: 0, alive: true, scale: 0.95 };
    var t0 = performance.now();

    function frame() {
      if (!api.alive) return;
      var time = (performance.now() - t0) / 1000;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.uniform1f(uT, api.t);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uAspect, aspect / sampled.aspect * 2.35);
      gl.uniform1f(uScale, api.scale);
      gl.uniform1f(uDisp, api.disperse);
      gl.drawArrays(gl.POINTS, 0, COUNT);
      requestAnimationFrame(frame);
    }
    frame();
    if (onReady) onReady(true);

    api.destroy = function () {
      api.alive = false;
      w.removeEventListener('resize', resize);
      var ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext();
    };
    return api;
  }

  /* ================= HERO SCENE ================= */
  function HeroScene(canvas) {
    var gl = ctx(canvas);
    if (!gl) return null;

    /* --- layer 1: fullscreen nebula (raymarch-lite fbm) --- */
    var quadVS = [
      'attribute vec2 aPos;varying vec2 vUv;',
      'void main(){vUv=aPos*0.5+0.5;gl_Position=vec4(aPos,0.0,1.0);}'
    ].join('\n');

    var quadFS = [
      'precision highp float;',
      'varying vec2 vUv;',
      'uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uScroll;',
      'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      'float noise(vec2 p){',
      '  vec2 i=floor(p),f=fract(p);',
      '  vec2 u=f*f*(3.0-2.0*f);',
      '  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);',
      '}',
      'float fbm(vec2 p){float v=0.0,a=0.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);',
      '  for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=0.5;}return v;}',
      'void main(){',
      '  vec2 uv=vUv;',
      '  vec2 p=(gl_FragCoord.xy-0.5*uRes)/uRes.y;',
      '  float t=uTime*0.055;',
      '  vec2 q=p*1.25;',
      '  q += (uMouse-0.5)*0.42;',
      '  q.y += uScroll*0.55;',
      '  float f1=fbm(q*1.5+vec2(t*1.4,-t));',
      '  float f2=fbm(q*2.6+vec2(-t*0.8,t*1.2)+f1*0.9);',
      '  float f3=fbm(q*4.2+f2*1.4-t*0.4);',
      '  vec3 violet=vec3(0.36,0.14,0.85);',
      '  vec3 cyan  =vec3(0.00,0.78,1.00);',
      '  vec3 mag   =vec3(0.95,0.12,0.50);',
      '  vec3 col=vec3(0.018,0.014,0.035);',
      '  col+=violet*pow(f1,2.1)*0.95;',
      '  col+=cyan  *pow(f2,3.0)*0.80;',
      '  col+=mag   *pow(f3,4.4)*0.72;',
      // beams
      '  float beam=abs(sin((p.x*3.4)+(p.y*1.2)+uTime*0.22));',
      '  col+=cyan*pow(1.0-beam,26.0)*0.30;',
      '  col+=mag*pow(1.0-abs(sin(p.x*2.1-p.y*1.6-uTime*0.16)),34.0)*0.22;',
      // vignette + falloff
      '  float d=length(p*vec2(0.82,1.0));',
      '  col*=smoothstep(1.35,0.12,d);',
      '  col=pow(col,vec3(0.92));',
      // grain
      '  col+=(hash(gl_FragCoord.xy+uTime)-0.5)*0.030;',
      '  gl_FragColor=vec4(col,1.0);',
      '}'
    ].join('\n');

    var pQuad = program(gl, quadVS, quadFS);
    if (!pQuad) return null;
    var quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    /* --- layer 2: particelle 3D --- */
    var N = 900;
    var pdata = new Float32Array(N * 4); // x,y,z,seed
    for (var i = 0; i < N; i++) {
      pdata[i * 4] = Math.random() * 2 - 1;
      pdata[i * 4 + 1] = Math.random() * 2 - 1;
      pdata[i * 4 + 2] = Math.random();
      pdata[i * 4 + 3] = Math.random();
    }
    var ptVS = [
      'attribute vec4 aP;',
      'uniform float uTime; uniform vec2 uMouse; uniform float uAspect; uniform float uScroll;',
      'varying float vA; varying float vS;',
      'void main(){',
      '  float z=fract(aP.z + uTime*0.028 + uScroll*0.25);',
      '  float depth=mix(0.16,1.0,z);',
      '  vec2 pos=aP.xy;',
      '  pos += (uMouse-0.5)*(0.30*depth);',
      '  pos.x += sin(uTime*0.30 + aP.w*8.0)*0.05*depth;',
      '  pos.y += cos(uTime*0.24 + aP.w*6.0)*0.05*depth;',
      '  pos /= depth;',
      '  pos.x /= uAspect;',
      '  gl_Position=vec4(pos,0.0,1.0);',
      '  gl_PointSize=mix(0.7,3.4,1.0-depth)*(0.6+aP.w);',
      '  vA=(1.0-depth)*0.85*smoothstep(0.0,0.14,z)*smoothstep(1.0,0.7,z);',
      '  vS=aP.w;',
      '}'
    ].join('\n');
    var ptFS = [
      'precision mediump float;varying float vA;varying float vS;',
      'void main(){',
      '  vec2 uv=gl_PointCoord-0.5;float r=length(uv);',
      '  if(r>0.5)discard;',
      '  float a=smoothstep(0.5,0.0,r)*vA;',
      '  vec3 c=mix(vec3(0.0,0.9,1.0),vec3(1.0,0.25,0.6),vS);',
      '  c=mix(c,vec3(1.0),0.45);',
      '  gl_FragColor=vec4(c,a);',
      '}'
    ].join('\n');
    var pPts = program(gl, ptVS, ptFS);
    var ptBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
    gl.bufferData(gl.ARRAY_BUFFER, pdata, gl.STATIC_DRAW);

    var uQ = {
      res: gl.getUniformLocation(pQuad, 'uRes'),
      time: gl.getUniformLocation(pQuad, 'uTime'),
      mouse: gl.getUniformLocation(pQuad, 'uMouse'),
      scroll: gl.getUniformLocation(pQuad, 'uScroll')
    };
    var aQ = gl.getAttribLocation(pQuad, 'aPos');
    var uP = pPts ? {
      time: gl.getUniformLocation(pPts, 'uTime'),
      mouse: gl.getUniformLocation(pPts, 'uMouse'),
      aspect: gl.getUniformLocation(pPts, 'uAspect'),
      scroll: gl.getUniformLocation(pPts, 'uScroll')
    } : null;
    var aP = pPts ? gl.getAttribLocation(pPts, 'aP') : -1;

    var dpr = Math.min(w.devicePixelRatio || 1, 1.75);
    var aspect = 1;
    function resize() {
      var r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      aspect = (r.width || 1) / (r.height || 1);
    }
    resize();
    w.addEventListener('resize', resize);

    var mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5, scroll = 0, tscroll = 0;
    w.addEventListener('pointermove', function (e) {
      tmx = e.clientX / w.innerWidth; tmy = 1 - e.clientY / w.innerHeight;
    }, { passive: true });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    var t0 = performance.now(), alive = true, visible = true;
    var api = {};
    api.setScroll = function (v) { tscroll = v; };
    api.setVisible = function (v) { visible = v; };

    function frame() {
      if (!alive) return;
      requestAnimationFrame(frame);
      if (!visible) return;
      mx += (tmx - mx) * 0.055; my += (tmy - my) * 0.055;
      scroll += (tscroll - scroll) * 0.08;
      var time = (performance.now() - t0) / 1000;

      gl.disable(gl.BLEND);
      gl.useProgram(pQuad);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      gl.enableVertexAttribArray(aQ);
      gl.vertexAttribPointer(aQ, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(uQ.res, canvas.width, canvas.height);
      gl.uniform1f(uQ.time, time);
      gl.uniform2f(uQ.mouse, mx, my);
      gl.uniform1f(uQ.scroll, scroll);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (pPts) {
        gl.enable(gl.BLEND);
        gl.useProgram(pPts);
        gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
        gl.enableVertexAttribArray(aP);
        gl.vertexAttribPointer(aP, 4, gl.FLOAT, false, 0, 0);
        gl.uniform1f(uP.time, time);
        gl.uniform2f(uP.mouse, mx, my);
        gl.uniform1f(uP.aspect, aspect);
        gl.uniform1f(uP.scroll, scroll);
        gl.drawArrays(gl.POINTS, 0, N);
      }
    }
    frame();

    api.destroy = function () { alive = false; w.removeEventListener('resize', resize); };
    return api;
  }

  w.GA_GL = { IntroScene: IntroScene, HeroScene: HeroScene };
})(window);
