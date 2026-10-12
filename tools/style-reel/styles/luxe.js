// Luxe, 30 s: black and champagne gold. Markazi for Persian, Bodoni for Latin, hairline gold rules that draw themselves,
// slow mask reveals and a soft light sweep across the gold. Never fast, never loud. Jewellery, salons, fine dining,
// perfume, wedding cakes, premium services.
window.STYLES = window.STYLES || {};
window.STYLES.luxe = {
  cap: { on: { color: "#0B0B0B", backgroundColor: "#D8BE86" }, off: { color: "#F3EAD6", backgroundColor: "rgba(11,11,11,.55)" } },
  css: `
  .st-luxe .cap-c{font-family:"Markazi",serif;font-weight:700;font-size:64px;line-height:1.45}
  .st-luxe .cap-c span{border-radius:4px;padding:0 14px 4px}
  .st-luxe:not(.face-color) #face{filter:contrast(1.05) saturate(.85) brightness(.97)}
  .lx-bg{position:absolute;inset:0;background:radial-gradient(90% 60% at 50% 35%,#1E1A13 0%,#0B0B0B 70%)}
  .lx-leak{position:absolute;width:1400px;height:1400px;border-radius:50%;background:radial-gradient(circle,rgba(216,190,134,.30) 0%,rgba(216,190,134,.10) 35%,rgba(216,190,134,0) 65%)}
  .lx-gold{background:linear-gradient(100deg,#9C7A3C 0%,#D8BE86 28%,#FFF1CF 42%,#D8BE86 56%,#9C7A3C 100%);background-size:260% 100%;
    -webkit-background-clip:text;background-clip:text;color:transparent}
  .lx{position:absolute;left:90px;right:90px;text-align:center;font-family:"Markazi",serif;font-weight:700;line-height:1.3}
  .lx-b{font-family:"Bodoni",serif;font-weight:500}
  .lx-w{color:#F3EAD6}.lx-mut{color:#9D927E}
  .lx-rule{position:absolute;height:3px;background:linear-gradient(90deg,transparent,#D8BE86 20%,#D8BE86 80%,transparent);transform-origin:50% 50%}
  .lx-frame{position:absolute;inset:44px;border:2px solid rgba(216,190,134,.8)}
  .lx-frame::after{content:"";position:absolute;inset:14px;border:1px solid rgba(216,190,134,.45)}
  .lx-mono{position:absolute;top:240px;left:0;right:0;text-align:center;font-family:"Markazi",serif;font-weight:700;font-size:48px;color:#D8BE86;letter-spacing:2px}
  .lx-panel{position:absolute;left:130px;right:130px;border:2px solid rgba(216,190,134,.7);background:rgba(20,18,14,.6)}
  .lx-item{font-family:"Bodoni",serif;font-style:italic;font-size:46px;color:#F3EAD6;line-height:72px;height:72px;text-align:center}
  svg.lx-svg{position:absolute;overflow:visible} svg.lx-svg path{fill:none;stroke:#D8BE86;stroke-width:3}
  `,
  html: `
  <div class="sc" id="xF"><div class="lx-frame"></div><div class="lx-mono fa">${BRAND.nameFa}</div></div>

  <div class="sc" id="xB1"><div class="lx-bg"></div><div class="lx-leak"></div>
    <div class="lx lx-b lx-mut ltr" id="xB1k" style="top:300px;font-size:40px;letter-spacing:12px">— N° 01 —</div>
    <div class="lx fa lx-gold" id="xB1a" style="top:420px;font-size:200px">قبل از سفارشش،</div>
    <div class="lx-rule" id="xB1r" style="left:240px;right:240px;top:900px"></div>
    <div class="lx fa lx-w" id="xB1b" style="top:960px;font-size:110px">این منو رو ببین.</div></div>

  <div class="sc" id="xB2"><div class="lx-bg"></div><div class="lx-leak"></div>
    ${[["قیمت", "هر کیلو چنده؟", "I"], ["طعم‌ها", "کدوما رو داریم؟", "II"], ["اندازه", "برای چند نفر؟", "III"], ["تحویل", "کِی و کجا؟", "IV"]].map(([w, s, n], i) => `
    <div class="abs" id="xQ${i}" style="inset:0;opacity:0">
      <div class="lx lx-b lx-gold ltr" style="top:380px;font-size:150px;font-style:italic">${n}</div>
      <div class="lx-rule" style="left:300px;right:300px;top:610px"></div>
      <div class="lx fa lx-w" style="top:680px;font-size:230px;line-height:1.2">${w}</div>
      <div class="lx fa lx-mut" style="top:1000px;font-size:74px">${s}</div></div>`).join("")}</div>

  <div class="sc" id="xB3"><div class="lx-bg"></div><div class="lx-leak"></div>
    <div class="lx fa lx-w" id="xB3a" style="top:270px;font-size:80px">یه منو، دقیقاً واسه همین ساخته شده</div>
    <div class="lx-panel" id="xB3p" style="top:500px;height:920px">
      <svg class="lx-svg" style="left:310px;top:70px;width:200px;height:200px"><path id="xDia" d="M100 10 L180 80 L100 190 L20 80 Z M20 80 L180 80 M60 10 L100 80 L140 10"/></svg>
      <div class="lx lx-b lx-gold ltr" id="xB3n" style="left:0;right:0;top:330px;font-size:84px">Sweet Corner</div>
      <div class="lx lx-b lx-mut ltr" id="xB3o" style="left:0;right:0;top:450px;font-size:36px;letter-spacing:10px">PÂTISSERIE · EST. 2026</div>
      <div class="lx lx-b lx-w ltr" id="xB3s" style="left:0;right:0;top:580px;font-size:96px">★ <span id="xStar">0</span></div>
      <div class="lx fa lx-mut" id="xB3t" style="left:0;right:0;top:740px;font-size:56px">تازه · دست‌ساز · هر روز صبح</div></div></div>

  <div class="sc" id="xB4"><div class="lx-bg"></div><div class="lx-leak"></div>
    <div class="lx fa lx-mut" id="xB4k" style="top:360px;font-size:70px">شیرینی‌فروشی نمونه</div>
    <div class="lx lx-b lx-gold ltr" id="xB4f" style="top:560px;font-size:230px;line-height:1;font-style:italic">Sweet</div>
    <div class="lx-rule" id="xB4r" style="left:200px;right:200px;top:830px"></div>
    <div class="lx lx-b lx-w ltr" id="xB4s" style="top:880px;font-size:150px;line-height:1;letter-spacing:20px">CORNER</div></div>

  <div class="sc" id="xB5"><div class="lx-bg"></div><div class="lx-leak"></div>
    <div class="lx fa lx-mut" id="xB5a" style="top:250px;font-size:64px">یه منوی ساده با</div>
    <div class="lx lx-b lx-gold" id="xN13" style="top:320px;font-size:260px;line-height:1.1">۰</div>
    <div class="lx-panel" style="top:690px;height:600px;overflow:hidden"><div class="abs" id="xList" style="left:0;right:0;top:20px">${["Chocolate", "Vanilla", "Carrot cake", "Red velvet", "Cheesecake", "Tiramisu", "Lemon tart", "Pistachio",
      "Saffron & rose", "Coffee walnut", "Strawberry", "Caramel", "Date cake"].map((s, i) => `<div class="lx-item ltr" id="xL${i}">${s}</div>`).join("")}</div></div>
    <div class="lx fa lx-gold" id="xB5b" style="top:1340px;font-size:104px">طعم واسه هر جشن</div></div>

  <div class="sc" id="xB6"><div class="lx-bg"></div><div class="lx-leak"></div>
    <div class="lx fa lx-gold" id="xC1" style="top:340px;font-size:200px">سفارش</div>
    <div class="lx lx-b lx-mut ltr" id="xC1m" style="top:610px;font-size:44px;letter-spacing:8px">/ORDER</div>
    <svg class="lx-svg" style="left:440px;top:720px;width:200px;height:420px"><path id="xLine" d="M100 0 L100 380 M70 350 L100 382 L130 350"/></svg>
    <div class="lx fa lx-w" id="xC2" style="top:1150px;font-size:200px">تحویل</div>
    <div class="lx lx-b lx-mut ltr" id="xC2m" style="top:1420px;font-size:44px;letter-spacing:8px">/DELIVER</div></div>`,
  build(H) {
    const { tl, T, count, scene, drift, q } = H;
    // slow, expensive motion: a mask lifts from below, a slight blur clears, never a bounce
    const rise = (el, t, d = .9) => tl.fromTo(el, { clipPath: "inset(100% 0 -20% 0)", y: 30, filter: "blur(6px)" }, { clipPath: "inset(-20% 0 -20% 0)", y: 0, filter: "blur(0px)", duration: d, ease: "power3.out" }, t);
    const fade = (el, t, d = .8) => tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: d, ease: "power1.out" }, t);
    const rule = (el, t) => tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.0, ease: "power2.inOut" }, t);
    const sweep = (el, t0, t1) => tl.fromTo(el, { backgroundPosition: "100% 0" }, { backgroundPosition: "0% 0", duration: t1 - t0, ease: "sine.inOut" }, t0);
    const draw = (el, t, d) => { const p = q(el), L = p.getTotalLength(); tl.set(p, { opacity: 0 }, 0); tl.set(p, { opacity: 1 }, t); tl.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: d, ease: "power2.inOut" }, t); };
    const dissolve = (el, t) => tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: .45, ease: "power1.inOut" }, t);
    [[0, T.qabl + .4], [T.ya - .4, T.gheymat + .4], [T.in2 - .4, T.repo + .4], [T.in3 - .4, 20.95]].forEach(([a, b]) => scene("#xF", a, b));
    // never still: a handheld camera and a slow gold light drifting through every scene
    [["#xB1", T.qabl - .4, T.ya + .3], ["#xB2", T.gheymat - .4, T.in2 + .3], ["#xB3", T.repo - .4, T.in3 + .3], ["#xB4", 20.45, T.ye + .3], ["#xB5", T.ye - .4, T.az + .3], ["#xB6", T.az - .4, 30]]
      .forEach(([el, a, b], i) => { H.camera(el, a, b, { amp: 10, per: 2 });
        tl.fromTo(el + " .lx-leak", { x: i % 2 ? 500 : -900, y: i % 2 ? 900 : -300 }, { x: i % 2 ? -900 : 500, y: i % 2 ? -300 : 900, duration: b - a, ease: "none" }, a); });
    fade(".lx-mono", .1, 1.2); tl.fromTo(".lx-frame", { scale: 1.04, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" }, 0);

    scene("#xB1", T.qabl - .4, T.ya + .3); dissolve("#xB1", T.qabl - .4); 
    fade("#xB1k", T.qabl - .4, .4); rise("#xB1a", T.qabl); sweep("#xB1a", T.qabl, T.ya); rule("#xB1r", T.hatman - .3); rise("#xB1b", T.abzar);

    scene("#xB2", T.gheymat - .4, T.in2 + .3); dissolve("#xB2", T.gheymat - .4);
    [T.gheymat, T.reghabat, T.mvp, T.bazar].forEach((t, i) => {
      // crossfade; the fade-out is a plain .to so it never renders early (a fromTo would show every card at time 0)
      if (i) tl.to("#xQ" + (i - 1), { opacity: 0, duration: .35, ease: "power1.inOut" }, t - .25);
      tl.fromTo("#xQ" + i, { opacity: 0 }, { opacity: 1, duration: .35, ease: "power1.inOut", immediateRender: false }, t - .25);
      rule(`#xQ${i} .lx-rule`, t - .2); rise(`#xQ${i} .lx-w`, t); sweep(`#xQ${i} .lx-gold`, t - .2, t + 1.8);
    });
    

    scene("#xB3", T.repo - .4, T.in3 + .3); dissolve("#xB3", T.repo - .4);
    rise("#xB3a", T.repo - .2); tl.fromTo("#xB3p", { opacity: 0, scale: .97 }, { opacity: 1, scale: 1, duration: .9, ease: "power2.out" }, T.repo);
    draw("#xDia", T.repo + .2, 1.2); rise("#xB3n", T.repo + .5); sweep("#xB3n", T.repo + .5, T.in3); fade("#xB3o", T.repo + .9);
    fade("#xB3s", T.sakhte - .4, .4); count("#xStar", T.sakhte - .4, 1.2, 0, 502, (v) => String(v)); fade("#xB3t", T.sakhte + .2);

    scene("#xB4", 20.45, T.ye + .3); dissolve("#xB4", 20.45);
    fade("#xB4k", 20.45, .4); rise("#xB4f", T.founder, 1.0); sweep("#xB4f", T.founder, T.ye); rule("#xB4r", T.skills - .2); rise("#xB4s", T.skills);
    

    scene("#xB5", T.ye - .4, T.az + .3); dissolve("#xB5", T.ye - .4);
    fade("#xB5a", T.ye - .4, .4); fade("#xN13", 22.5, .4); count("#xN13", 22.6, 1.75, 0, 13); sweep("#xN13", 22.6, T.az);
    tl.fromTo("#xList", { y: 0 }, { y: -(13 * 72 - 560), duration: 3.6, ease: "sine.inOut" }, 22.6);
    for (let i = 0; i < 13; i++) tl.fromTo("#xL" + i, { opacity: 0 }, { opacity: 1, duration: .5 }, 22.6 + i * .13);
    rise("#xB5b", T.eskil2 - .1); sweep("#xB5b", T.eskil2, T.az);

    scene("#xB6", T.az - .4, 30); dissolve("#xB6", T.az - .4);
    rise("#xC1", T.az - .4, .7); sweep("#xC1", T.az, 30); fade("#xC1m", T.etebar); draw("#xLine", T.etebar + .7, 1.6);
    rise("#xC2", T.reghaba - .05); fade("#xC2m", T.reghaba + .3, .5);
    
  },
};
