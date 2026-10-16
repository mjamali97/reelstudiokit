// Depth, 30 s: the talking head stays on screen and the words live in the room with the speaker. Lead-in lines pop in
// front of the chest as they are said; the punch word of each line sits BEHIND the head (assets/subject.webm, the speaker
// cut out by tools/take/cutout.py), placed from window.HEAD (tools/take/headpos.py) so only the lower ~30 % of its letters
// hide. Every cut gets a short punch-in. Brand colours (BRAND.colors), any grade. Closes on a follow + comment card.
window.STYLES = window.STYLES || {};
(() => {
  const C = Object.assign({ accent: "#E4572E", accent2: "#F2C14E", ink: "#111111", surface: "#FFFFFF" }, (window.BRAND && BRAND.colors) || {});
  const HEADS = window.HEAD || [{ start: 0, end: 999, head_top: 520, head_x: [340, 740], face_bottom: 1000 }];
  const head = (t) => HEADS.find((h) => t >= h.start && t < h.end) || HEADS[HEADS.length - 1];
  // top of a word of size S whose baseline sits 30 % of an x-height below the head top (line-height 1)
  const behindTop = (t, S) => Math.max(230, head(t).head_top + 0.15 * S - 0.8 * S);
  // a front line never covers the face: under the chin when it fits above y 1470 (safe zone), else in the top band
  const leadTop = (t, h = 110) => { const fb = head(t).face_bottom + 24; return fb + h <= 1460 ? Math.max(fb, 960) : 240; };
  window.STYLES.depth = {
    subject: true,
    grade: "natural",
    css: `
  .st-depth .dw{position:absolute;left:60px;right:60px;text-align:center;font-family:"Fa",sans-serif;color:#fff;line-height:1;
    text-shadow:0 10px 40px rgba(0,0,0,.5);white-space:nowrap}
  .st-depth .lead{font-weight:800;font-size:76px;line-height:1.35}
  .st-depth .big{font-weight:900}
  .st-depth .hl{color:${C.accent2}}
  .st-depth .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,0) 26%,rgba(0,0,0,0) 55%,rgba(0,0,0,.45) 100%)}
  .st-depth .chip{display:inline-block;background:${C.accent};color:#fff;border-radius:999px;padding:6px 34px 12px;font:800 58px/1.3 "Fa",sans-serif}
  .dp-card{position:absolute;left:150px;right:150px;top:1000px;height:440px;background:rgba(18,18,22,.92);border-radius:44px;padding:40px 44px;
    box-shadow:0 30px 80px rgba(0,0,0,.45);color:#fff;font-family:"Fa",sans-serif}
  .dp-av{width:132px;height:132px;border-radius:50%;background:linear-gradient(135deg,${C.accent2},${C.accent});display:grid;place-items:center;
    font:900 64px/1 "Fa",sans-serif;color:#fff;box-shadow:0 0 0 6px rgba(255,255,255,.12)}
  .dp-btn{border-radius:18px;padding:14px 0 18px;text-align:center;font:800 40px/1 "Fa",sans-serif}
  .dp-dot{position:absolute;width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.55);box-shadow:0 0 0 10px rgba(255,255,255,.18)}
  `,
    html: `
  ${[["dB1", "سفارش", 230], ["dQ0", "قیمت", 280], ["dQ1", "طعم", 300], ["dQ2", "اندازه", 250], ["dQ3", "تحویل", 260], ["dB5", "★ ۵۰۲", 230]].map(([id, w, S]) =>
    `<div class="dw big fa" id="${id}" style="font-size:${S}px;opacity:0">${w}</div>`).join("")}
  <div class="dw big ltr" id="dS1" style="font-size:250px;opacity:0;letter-spacing:-.03em">SWEET</div>
  <div class="dw big" id="dN" style="font-size:300px;opacity:0">۰</div>`,
    front: `
  <div class="shade"></div>
  <div class="dw lead fa" id="dL1" style="top:1160px;opacity:0">قبل از <span class="hl">سفارشِ</span> کیک تولد</div>
  <div class="dw lead fa" id="dL2" style="top:1160px;opacity:0">این <span class="hl">منو</span> رو ببین.</div>
  <div class="dw lead fa" id="dL3" style="top:1160px;opacity:0">چهار تا سؤال بپرس</div>
  <div class="dw fa" id="dQn" style="top:1180px;opacity:0"><span class="chip" id="dQc">۱ از ۴</span></div>
  <div class="dw lead fa" id="dL4" style="top:1160px;opacity:0">یه منو، <span class="hl">دقیقاً</span> واسه همین</div>
  <div class="dw lead fa" id="dL5" style="top:1160px;opacity:0">از نظر مشتری‌ها</div>
  <div class="dw lead fa" id="dL6" style="top:1160px;opacity:0">${BRAND.nameFa}</div>
  <div class="dw big ltr hl" id="dS2" style="font-size:200px;top:1120px;opacity:0;letter-spacing:-.03em">CORNER</div>
  <div class="dw lead fa" id="dL7" style="top:1160px;opacity:0">طعم، <span class="hl">واسه هر جشن</span></div>
  <div class="dp-card" id="dCard" style="opacity:0">
    <div style="display:flex;align-items:center;gap:30px;direction:rtl">
      <div class="dp-av">${(BRAND.nameFa || "B").trim().charAt(0)}</div>
      <div><div style="font:900 48px/1.3 'Fa'">${BRAND.nameFa}</div><div class="ltr" style="font:600 32px/1.3 system-ui;opacity:.75">${BRAND.handle || ""}</div></div></div>
    <div class="dp-btn" id="dFollow" style="margin-top:36px;background:${C.accent};color:#fff">دنبال کنید</div>
    <div class="dp-btn" id="dFollowing" style="margin-top:-72px;background:rgba(255,255,255,.14);color:#fff;opacity:0">دنبال می‌کنید ✓</div>
    <div style="margin-top:30px;border-radius:999px;background:rgba(255,255,255,.1);padding:16px 30px 20px;font:700 38px/1.2 'Fa';direction:rtl;display:flex;justify-content:space-between">
      <span id="dType" style="color:#fff"></span><span style="opacity:.5">ارسال</span></div>
    <div class="dp-dot" id="dDot" style="left:300px;top:250px;opacity:0"></div>
  </div>`,
    build(H) {
      const { tl, T, count, q } = H;
      // a word arrives on its spoken frame: blur and scale settle in .2 s; a group leaves with a quick blur, then is gone
      const pop = (el, t, s = 1.22) => tl.fromTo(el, { opacity: 0, scale: s, filter: "blur(18px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: .22, ease: "power3.out", immediateRender: false }, t);
      const out = (el, t) => { tl.to(el, { opacity: 0, filter: "blur(14px)", duration: .12, ease: "power2.in" }, t); tl.set(el, { opacity: 0 }, t + .13); };
      const front = (id, t, h) => tl.set("#" + id, { top: leadTop(t, h) }, t - .01);
      const place = (id, t) => { const S = parseFloat(q("#" + id).style.fontSize); tl.set("#" + id, { top: behindTop(t, S) }, 0); };
      // numbers stay whole: above the head, never behind it
      const above = (id, t) => { const S = parseFloat(q("#" + id).style.fontSize); tl.set("#" + id, { top: Math.max(230, head(t).head_top - S * .92) }, 0); };
      // every cut (a new segment, or a new beat in the demo) gets a short punch-in on the footage and its cutout together
      const cuts = (window.HEAD && window.HEAD.length > 1 ? window.HEAD.map((h) => h.start).slice(1) : [T.qabl, T.ya, T.gheymat, T.in2, T.repo, T.in3, 20.7, T.ye, T.az]).map((c) => c - .002);
      cuts.forEach((c) => tl.fromTo("#face, #subject", { scale: 1.06 }, { scale: 1, duration: .32, ease: "power2.out", immediateRender: false }, c));
      // a cut can move the face (a punch-in, another angle): lines already on screen move with it, never onto the face
      if (window.HEAD && window.HEAD.length > 1) window.HEAD.slice(1).forEach((h) =>
        ["dL1", "dL2", "dL3", "dL4", "dL5", "dL6", "dL7"].forEach((id) => tl.set("#" + id, { top: leadTop(h.start + .01) }, h.start - .002)));
      // a slow drift so no hold is ever still
      tl.fromTo("#face, #subject", { x: 0 }, { x: -10, duration: 30, ease: "none" }, 0);

      front("dL1", .3); pop("#dL1", .3); out("#dL1", T.abzar - .2);
      place("dB1", T.sakhtan); pop("#dB1", T.sakhtan, 1.35); out("#dB1", T.ya - .1);
      front("dL2", T.abzar); pop("#dL2", T.abzar); out("#dL2", T.ya - .1);
      front("dL3", T.ya + .1); pop("#dL3", T.ya + .1); out("#dL3", T.gheymat - .1);
      [T.gheymat, T.reghabat, T.mvp, T.bazar].forEach((t, i) => {
        place("dQ" + i, t); pop("#dQ" + i, t, 1.35); out("#dQ" + i, i < 3 ? [T.reghabat, T.mvp, T.bazar][i] - .05 : T.in2 - .1);
        tl.set("#dQc", { textContent: ["۱ از ۴", "۲ از ۴", "۳ از ۴", "۴ از ۴"][i] }, t);
      });
      [T.gheymat, T.reghabat, T.mvp, T.bazar].forEach((t) => front("dQn", t + .01, 90)); pop("#dQn", T.gheymat + .1, 1.1); out("#dQn", T.in2 - .1);
      front("dL4", T.in2 + .05); pop("#dL4", T.in2 + .05); out("#dL4", T.repo - .1);
      front("dL5", T.repo); pop("#dL5", T.repo); above("dB5", T.sakhte - .4); pop("#dB5", T.sakhte - .4, 1.3); out("#dL5", T.in3 - .1); out("#dB5", T.in3 - .1);
      front("dL6", T.in3 + .05); pop("#dL6", T.in3 + .05); out("#dL6", 20.6);
      place("dS1", T.founder);   // the first word behind the head, the second in front over the chest: never hide a word's middle
      front("dS2", T.skills, 200); pop("#dS1", T.founder, 1.3); pop("#dS2", T.skills, 1.3); out("#dS1, #dS2", T.ye - .1);
      above("dN", 22.6); pop("#dN", 22.5, 1.2); count("#dN", 22.6, 1.75, 0, 13); front("dL7", T.eskil2 - .1); pop("#dL7", T.eskil2 - .1); out("#dN, #dL7", T.az - .1);
      // the close: follow, then the comment word typed; the card starts below the chin and ends above y 1470 (safe zone)
      tl.set("#dCard", { top: Math.min(1030, Math.max(960, head(T.az).face_bottom + 10)) }, 0);
      tl.fromTo("#dCard", { opacity: 0, y: 160, scale: .94 }, { opacity: 1, y: 0, scale: 1, duration: .45, ease: "power3.out", immediateRender: false }, T.az);
      tl.fromTo("#dDot", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: .2, immediateRender: false }, T.etebar + .5);
      tl.set("#dFollow", { opacity: 0 }, T.etebar + .75); tl.set("#dFollowing", { opacity: 1 }, T.etebar + .75); tl.to("#dDot", { opacity: 0, duration: .2 }, T.etebar + .9);
      const word = "منو";
      [...word].forEach((ch, i) => tl.set("#dType", { textContent: word.slice(0, i + 1) }, T.reghaba - .9 + i * .14));
      tl.fromTo("#dCard", { scale: 1 }, { scale: 1.02, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: 1, immediateRender: false }, T.etebar);
    },
  };
})();
