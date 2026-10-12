// Receipt, 30 s: a thermal printer prints the story. A paper strip feeds up line by line with a printer jitter, mono type
// and dotted leaders, prices, a stamp, a barcode and a torn zig-zag edge. Honest and concrete: shops, takeaways, delivery,
// price lists, "what you get for your money".
window.STYLES = window.STYLES || {};
window.STYLES.receipt = {
  cap: { on: { color: "#FFFFFF", backgroundColor: "#111111" }, off: { color: "#111111", backgroundColor: "rgba(250,248,242,.96)" } },
  css: `
  .st-receipt .cap-c{font-family:"Fa",sans-serif;font-weight:900;font-size:52px;line-height:1.7}
  .st-receipt .cap-c span{padding:0 12px 4px}
  .rc-desk{position:absolute;inset:0;background:radial-gradient(80% 60% at 50% 40%,#C9C2B6,#8F877B)}
  .rc-paper{position:absolute;left:100px;right:100px;background:#FAF8F2;box-shadow:0 30px 60px rgba(0,0,0,.28);
    background-image:linear-gradient(rgba(0,0,0,.025) 1px,transparent 1px);background-size:100% 6px;
    -webkit-mask:linear-gradient(#000,#000) top/100% calc(100% - 26px) no-repeat,conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) bottom/36px 26px repeat-x;
    mask:linear-gradient(#000,#000) top/100% calc(100% - 26px) no-repeat,conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) bottom/36px 26px repeat-x}
  .rc-in{position:absolute;left:60px;right:60px;top:60px}
  .rc{font-family:"Fa",sans-serif;font-weight:900;color:#151515;text-align:center;line-height:1.3}
  .rc-m{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-weight:700;color:#151515}
  .rc-row{display:flex;justify-content:space-between;gap:16px;font-family:ui-monospace,"SF Mono",Menlo,monospace;font-weight:700;font-size:46px;color:#151515;line-height:66px;height:66px}
  .rc-row i{flex:1;border-bottom:4px dotted #151515;margin-bottom:16px;font-style:normal}
  .rc-hr{border-top:5px dashed #151515;margin:26px 0}
  .rc-bar{height:150px;background:repeating-linear-gradient(90deg,#151515 0 6px,transparent 6px 10px,#151515 10px 12px,transparent 12px 20px,#151515 20px 28px,transparent 28px 32px)}
  .rc-stamp{position:absolute;border:10px solid #D23B3B;color:#D23B3B;border-radius:24px;padding:6px 30px 12px;font-family:"Fa",sans-serif;font-weight:900;opacity:.85;mix-blend-mode:multiply}
  .rc-slot{position:absolute;left:70px;right:70px;height:56px;background:#2A2725;border-radius:28px;box-shadow:inset 0 8px 14px rgba(0,0,0,.6)}
  .rc-tag{position:absolute;top:244px;left:0;right:0;text-align:center}
  .rc-tag span{display:inline-block;background:#FAF8F2;color:#151515;padding:6px 26px 10px;font-family:ui-monospace,Menlo,monospace;font-weight:700;font-size:34px;
    box-shadow:0 8px 20px rgba(0,0,0,.25)}
  `,
  html: `
  <div class="sc" id="eF"><div class="rc-tag"><span>${(BRAND.handle || "").toUpperCase()} · RECEIPT</span></div></div>

  <div class="sc" id="eB1"><div class="rc-desk"></div><div class="rc-slot" style="top:230px"></div>
    <div class="rc-paper" id="eP1" style="top:258px;height:1320px"><div class="rc-in">
      <div class="rc-m" style="text-align:center;font-size:36px">*** ${(BRAND.mast || "").slice(0, 20)} ***</div><div class="rc-hr"></div>
      <div class="rc fa" id="eB1a" style="font-size:150px">قبل از</div>
      <div class="rc fa" id="eB1b" style="font-size:140px">سفارشش،</div><div class="rc-hr"></div>
      <div class="rc fa" id="eB1c" style="font-size:96px;background:#151515;color:#FAF8F2;padding:10px 0 20px">این منو رو ببین.</div>
      <div class="rc-m" style="text-align:center;font-size:32px;margin-top:30px">— ${BRAND.year || ""} —</div></div></div></div>

  <div class="sc" id="eB2"><div class="rc-desk"></div><div class="rc-slot" style="top:230px"></div>
    <div class="rc-paper" id="eP2" style="top:258px;height:1300px"><div class="rc-in">
      <div class="rc fa" style="font-size:60px">قبل از سفارش بپرس</div><div class="rc-hr"></div>
      ${[["قیمت", "هر کیلو چنده؟"], ["طعم‌ها", "کدوما رو داریم؟"], ["اندازه", "برای چند نفر؟"], ["تحویل", "کِی و کجا؟"]].map(([w, s], i) => `
      <div id="eQ${i}" style="display:flex;align-items:center;gap:22px;height:250px;border-bottom:4px dotted #151515">
        <div class="rc-m" style="font-size:66px;width:110px">${["۰۱", "۰۲", "۰۳", "۰۴"][i]}</div>
        <div style="flex:1;text-align:right"><div class="rc fa" style="text-align:right;font-size:110px">${w}</div><div class="rc fa" style="text-align:right;font-size:48px;font-weight:700">${s}</div></div>
        <div class="rc-m" id="eCk${i}" style="font-size:80px;width:80px;text-align:center">☐</div></div>`).join("")}</div></div></div>

  <div class="sc" id="eB3"><div class="rc-desk"></div><div class="rc-slot" style="top:230px"></div>
    <div class="rc-paper" id="eP3" style="top:258px;height:1300px"><div class="rc-in">
      <div class="rc fa" style="font-size:62px">یه منو، دقیقاً واسه همین ساخته شده</div><div class="rc-hr"></div>
      <div class="rc-m ltr" style="font-size:66px;text-align:center">SWEET-CORNER</div>
      <div class="rc-m ltr" style="font-size:44px;text-align:center">BAKERY · NO. 0012</div><div class="rc-hr"></div>
      <div class="rc-row ltr" style="font-size:54px;height:90px;line-height:90px"><span>RATING</span><i></i><span>★ <span id="eStar">0</span></span></div>
      <div class="rc-row ltr"><span>FRESH</span><i></i><span>YES</span></div>
      <div class="rc-row ltr"><span>HANDMADE</span><i></i><span>YES</span></div>
      <div class="rc-row ltr"><span>BAKED</span><i></i><span>06:30</span></div><div class="rc-hr"></div>
      <div class="rc-bar"></div></div>
    <div class="rc-stamp fa" id="eSt3" style="left:420px;top:1020px;font-size:80px;transform:rotate(-12deg)">تازه</div></div></div>

  <div class="sc" id="eB4"><div class="rc-desk"></div><div class="rc-slot" style="top:230px"></div>
    <div class="rc-paper" id="eP4" style="top:258px;height:1200px"><div class="rc-in">
      <div class="rc fa" style="font-size:66px">شیرینی‌فروشی نمونه</div><div class="rc-hr"></div>
      <div class="rc-m ltr" id="eB4f" style="font-size:180px;text-align:center;line-height:1.05">SWEET</div>
      <div class="rc-m ltr" id="eB4s" style="font-size:150px;text-align:center;line-height:1.05;background:#151515;color:#FAF8F2">CORNER</div><div class="rc-hr"></div>
      <div class="rc-m ltr" style="font-size:36px;text-align:center">THANK YOU · COME AGAIN</div></div></div></div>

  <div class="sc" id="eB5"><div class="rc-desk"></div><div class="rc-slot" style="top:230px"></div>
    <div class="rc-paper" id="eP5" style="top:258px;height:1330px"><div class="rc-in">
      <div class="rc fa" style="font-size:56px">یه منوی ساده با <span id="eN13">۰</span> طعم</div><div class="rc-hr"></div>
      ${["chocolate", "vanilla", "carrot cake", "red velvet", "cheesecake", "tiramisu", "lemon tart", "pistachio",
        "saffron rose", "coffee walnut", "strawberry", "caramel", "date cake"].map((s, i) => `<div class="rc-row ltr" id="eL${i}" style="height:62px;line-height:62px;font-size:43px"><span>${s.toUpperCase()}</span><i></i><span>${["12", "11", "14", "15", "16", "15", "13", "17", "18", "15", "13", "14", "13"][i]}.00</span></div>`).join("")}
      <div class="rc-hr"></div><div class="rc fa" id="eB5b" style="font-size:70px">طعم واسه هر جشن</div></div></div></div>

  <div class="sc" id="eB6"><div class="rc-desk"></div><div class="rc-slot" style="top:230px"></div>
    <div class="rc-paper" id="eP6" style="top:258px;height:1300px"><div class="rc-in">
      <div class="rc-m ltr" style="font-size:40px;text-align:center">ORDER #0012</div><div class="rc-hr"></div>
      <div class="rc fa" id="eC1" style="font-size:150px">سفارش</div><div class="rc-m ltr" style="font-size:44px;text-align:center">/order</div>
      <div class="rc-m" id="eDots" style="font-size:90px;text-align:center;line-height:1;letter-spacing:10px">· · ·</div>
      <div class="rc fa" id="eC2" style="font-size:150px">تحویل</div><div class="rc-m ltr" style="font-size:44px;text-align:center">/deliver</div><div class="rc-hr"></div>
      <div class="rc-bar"></div></div>
    <div class="rc-stamp ltr" id="eSt6" style="left:330px;top:1040px;font-size:90px;transform:rotate(-10deg)">PAID ✓</div></div></div>`,
  build(H) {
    const { tl, T, count, scene, q } = H;
    // the printer feeds paper upward in small steps (stepped ease + a little jitter), revealing what was printed
    const feed = (el, t, d = 1.2) => { tl.fromTo(el, { clipPath: "inset(0 0 100% 0)", y: -40 }, { clipPath: "inset(0 0 0% 0)", y: 0, duration: d, ease: `steps(${Math.round(d * 14)})` }, t);
      tl.fromTo(el, { x: -2 }, { x: 2, duration: .05, repeat: Math.round(d / .05), yoyo: true, ease: "none" }, t); tl.set(el, { x: 0 }, t + d + .02); };
    const ink = (el, t) => tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: .12, ease: "steps(2)" }, t);
    const stamp = (el, t, r) => tl.fromTo(el, { scale: 2, opacity: 0, rotation: r - 10 }, { scale: 1, opacity: .85, rotation: r, duration: .2, ease: "power4.in" }, t);
    const tear = (el, t) => tl.to(el, { y: -1700, rotation: -4, duration: .35, ease: "power3.in" }, t);
    const enter = (el, t) => tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: .15 }, t);
    [[0, T.qabl + .2], [T.ya - .2, T.gheymat + .2], [T.in2 - .2, T.repo + .2], [T.in3 - .2, 20.75]].forEach(([a, b]) => scene("#eF", a, b));
    tl.fromTo(".rc-tag span", { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: "steps(6)" }, .1);
    // never still: the camera floats over the desk
    [["#eB1", T.qabl, T.ya], ["#eB2", T.gheymat, T.in2], ["#eB3", T.repo, T.in3], ["#eB4", 20.55, T.ye], ["#eB5", T.ye, T.az], ["#eB6", T.az, 30]].forEach(([el, a, b]) => H.camera(el, a, b, { amp: 12, per: 1.6 }));

    scene("#eB1", T.qabl - .2, T.ya + .05); enter("#eB1", T.qabl - .2); feed("#eP1", T.qabl - .15, 1.4);
    tl.set("#eB1b, #eB1c", { opacity: 0 }, 0); ink("#eB1b", T.sakhtan); ink("#eB1c", T.abzar); tear("#eP1", T.ya - .3);

    scene("#eB2", T.gheymat - .2, T.in2 + .05); enter("#eB2", T.gheymat - .2); feed("#eP2", T.gheymat - .15, 1.6);
    [T.gheymat, T.reghabat, T.mvp, T.bazar].forEach((t, i) => { tl.set("#eQ" + i, { opacity: .25 }, 0); tl.set("#eQ" + i, { opacity: 1 }, t); tl.set("#eCk" + i, { textContent: "☑" }, t + .3); });
    tear("#eP2", T.in2 - .3);

    scene("#eB3", T.repo - .2, T.in3 + .05); enter("#eB3", T.repo - .2); feed("#eP3", T.repo - .15, 1.5);
    count("#eStar", T.sakhte - .4, 1.0, 0, 502, (v) => String(v)); tl.set("#eSt3", { opacity: 0 }, 0); stamp("#eSt3", T.sakhte + .2, -12); tear("#eP3", T.in3 - .3);

    scene("#eB4", 20.55, T.ye + .05); enter("#eB4", 20.55); feed("#eP4", 20.6, 1.1);
    tl.set("#eB4f, #eB4s", { opacity: 0 }, 0); ink("#eB4f", T.founder); ink("#eB4s", T.skills); tear("#eP4", T.ye - .3);

    scene("#eB5", T.ye - .2, T.az + .05); enter("#eB5", T.ye - .2); feed("#eP5", T.ye - .15, .8);
    count("#eN13", 22.6, 1.75, 0, 13);
    for (let i = 0; i < 13; i++) { tl.set("#eL" + i, { opacity: 0 }, 0); ink("#eL" + i, 22.6 + i * .13); }
    tl.set("#eB5b", { opacity: 0 }, 0); ink("#eB5b", T.eskil2 - .1); tear("#eP5", T.az - .3);

    scene("#eB6", T.az - .2, 30); enter("#eB6", T.az - .2); feed("#eP6", T.az - .15, 1.2);
    tl.set("#eC2", { opacity: 0 }, 0); ink("#eC2", T.reghaba);
    tl.fromTo("#eDots", { opacity: .2 }, { opacity: 1, duration: .4, repeat: 3, yoyo: true, ease: "steps(2)" }, T.etebar + .5);
    tl.set("#eSt6", { opacity: 0 }, 0); stamp("#eSt6", T.reghaba + .3, -10);
  },
};
