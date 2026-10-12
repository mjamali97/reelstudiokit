// Brutal, 30 s: neo-brutalism. Off-white, thick black borders, hard offset shadows, loud flat colours (yellow, pink, mint,
// lilac), stickers slapped on at an angle, boxes that press down like buttons. Young, loud, internet-native: streetwear,
// online shops, apps, courses, Gen-Z food.
window.STYLES = window.STYLES || {};
window.STYLES.brutal = {
  cap: { on: { color: "#111111", backgroundColor: "#FFE14D" }, off: { color: "#111111", backgroundColor: "#FFFFFF" } },
  css: `
  .st-brutal .cap-c{font-family:"Fa",sans-serif;font-weight:900;font-size:54px;line-height:1.7}
  .st-brutal .cap-c span{border:5px solid #111;border-radius:12px;padding:0 14px 4px;box-shadow:6px 6px 0 #111;margin:0 4px}
  .br-bg{position:absolute;inset:0;background:#FFFDF5;background-image:radial-gradient(#111 2.4px,transparent 2.6px);background-size:44px 44px;background-position:22px 22px}
  .br-box{position:absolute;border:8px solid #111;border-radius:28px;box-shadow:16px 16px 0 #111}
  .br-t{font-family:"Fa",sans-serif;font-weight:900;color:#111;line-height:1.25}
  .br-m{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-weight:800;color:#111}
  .br-st{position:absolute;border:6px solid #111;border-radius:18px;box-shadow:8px 8px 0 #111;padding:10px 30px 14px;font-family:"Fa",sans-serif;font-weight:900;color:#111}
  .br-frame{position:absolute;inset:30px;border:10px solid #111;border-radius:40px}
  .br-tab{position:absolute;top:240px;right:70px;border:6px solid #111;border-radius:16px;box-shadow:8px 8px 0 #111;background:#FFE14D;padding:6px 26px 10px;font-family:"Fa",sans-serif;font-weight:900;font-size:40px;color:#111}
  .br-tag{display:inline-block;margin:12px 9px;border:5px solid #111;border-radius:14px;box-shadow:6px 6px 0 #111;padding:8px 22px;font-family:ui-monospace,Menlo,monospace;font-weight:800;font-size:40px;color:#111}
  `,
  html: `
  <div class="sc" id="bF"><div class="br-frame"></div><div class="br-tab fa">${BRAND.nameFa}</div></div>

  <div class="sc" id="bB1"><div class="br-bg"></div>
    <div class="br-box" id="bB1x" style="left:80px;right:80px;top:300px;height:520px;background:#FFE14D;display:flex;flex-direction:column;justify-content:center;padding:0 60px">
      <div class="br-t fa" id="bB1a" style="font-size:170px">قبل از</div><div class="br-t fa" id="bB1b" style="font-size:150px">سفارشش،</div></div>
    <div class="br-box" id="bB1y" style="left:120px;right:120px;top:960px;height:330px;background:#FF7AA8;display:grid;place-items:center;transform:rotate(-3deg)">
      <div class="br-t fa" style="font-size:118px">این منو رو ببین.</div></div>
    <div class="br-st ltr" id="bB1s" style="left:690px;top:1290px;background:#7EE0B5;font-size:48px;transform:rotate(8deg)">👀 menu</div></div>

  <div class="sc" id="bB2"><div class="br-bg"></div>
    ${[["قیمت", "هر کیلو چنده؟", "#FFE14D"], ["طعم‌ها", "کدوما رو داریم؟", "#FF7AA8"], ["اندازه", "برای چند نفر؟", "#7EE0B5"], ["تحویل", "کِی و کجا؟", "#B9A6FF"]].map(([w, s, c], i) => `
    <div class="br-box" id="bQ${i}" style="left:90px;right:90px;top:${470 + i * 26}px;height:820px;background:${c};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px">
      <div class="br-st" style="position:relative;background:#fff;font-size:64px;box-shadow:6px 6px 0 #111">${["۰۱", "۰۲", "۰۳", "۰۴"][i]}</div>
      <div class="br-t fa" style="font-size:200px">${w}</div>
      <div class="br-t fa" style="font-size:66px;font-weight:700">${s}</div></div>`).join("")}</div>

  <div class="sc" id="bB3"><div class="br-bg"></div>
    <div class="br-box" id="bB3w" style="left:80px;right:80px;top:300px;height:1150px;background:#fff;overflow:hidden">
      <div style="height:110px;border-bottom:8px solid #111;background:#B9A6FF;display:flex;align-items:center;gap:20px;padding:0 40px">
        ${["#FF7AA8", "#FFE14D", "#7EE0B5"].map((c) => `<span style="width:40px;height:40px;border-radius:50%;border:5px solid #111;background:${c}"></span>`).join("")}</div>
      <div class="br-t fa" id="bB3a" style="position:absolute;right:50px;left:50px;top:160px;font-size:66px">یه منو، دقیقاً واسه همین ساخته شده</div>
      <div class="br-m ltr" id="bB3n" style="position:absolute;left:50px;top:420px;font-size:74px">sweet-corner/</div>
      <div class="br-m ltr" id="bB3o" style="position:absolute;left:50px;top:520px;font-size:74px;background:#FFE14D;padding:0 12px">bakery</div>
      <div class="br-st ltr" id="bB3s" style="left:50px;top:700px;background:#FF7AA8;font-size:96px">★ <span id="bStar">0</span></div>
      <div class="br-st ltr" id="bB3t" style="left:330px;top:900px;background:#7EE0B5;font-size:46px;transform:rotate(-4deg)">FRESH · HANDMADE</div></div></div>

  <div class="sc" id="bB4"><div class="br-bg"></div>
    <div class="br-st fa" id="bB4k" style="left:250px;top:300px;background:#fff;font-size:60px">شیرینی‌فروشی نمونه</div>
    <div class="br-box" id="bB4f" style="left:80px;right:80px;top:480px;height:330px;background:#FFE14D;display:grid;place-items:center"><div class="br-t ltr" style="font-size:210px;line-height:1">SWEET</div></div>
    <div class="br-box" id="bB4s" style="left:80px;right:80px;top:880px;height:330px;background:#FF7AA8;display:grid;place-items:center"><div class="br-t ltr" style="font-size:200px;line-height:1">CORNER</div></div>
    <div class="br-st" id="bB4b" style="left:700px;top:1240px;background:#7EE0B5;font-size:60px;transform:rotate(10deg)">★ ★ ★</div></div>

  <div class="sc" id="bB5"><div class="br-bg"></div>
    <div class="br-t fa" id="bB5a" style="position:absolute;right:80px;top:270px;font-size:64px">یه منوی ساده با</div>
    <div class="br-box" id="bN" style="left:80px;top:250px;width:380px;height:300px;background:#FFE14D;display:grid;place-items:center"><div class="br-t" id="bN13" style="font-size:210px;line-height:1">۰</div></div>
    <div class="ltr" id="bTags" style="position:absolute;left:50px;right:50px;top:640px;text-align:center">${["chocolate", "vanilla", "carrot-cake", "red-velvet", "cheesecake", "tiramisu", "lemon-tart", "pistachio",
      "saffron-rose", "coffee-walnut", "strawberry", "caramel", "date-cake"].map((s, i) => `<span class="br-tag" style="background:${["#fff", "#FF7AA8", "#7EE0B5", "#B9A6FF", "#FFE14D"][i % 5]};transform:rotate(${(i % 3) - 1}deg)">${s}</span>`).join("")}</div>
    <div class="br-box" id="bB5b" style="left:110px;right:110px;top:1300px;height:190px;background:#111;display:grid;place-items:center;box-shadow:16px 16px 0 #FF7AA8"><div class="br-t fa" style="font-size:84px;color:#fff">طعم واسه هر جشن</div></div></div>

  <div class="sc" id="bB6"><div class="br-bg"></div>
    <div class="br-box" id="bS1" style="left:90px;right:90px;top:320px;height:380px;background:#FFE14D;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div class="br-t fa" style="font-size:150px">سفارش</div><div class="br-m ltr" style="font-size:50px">/order</div></div>
    <div class="br-box" id="bBar" style="left:90px;right:90px;top:800px;height:90px;background:#fff;overflow:hidden;box-shadow:10px 10px 0 #111">
      <div id="bFill" style="position:absolute;inset:0;background:repeating-linear-gradient(-45deg,#111 0 22px,#B9A6FF 22px 44px);transform-origin:0 50%"></div></div>
    <div class="br-box" id="bS2" style="left:90px;right:90px;top:1000px;height:380px;background:#7EE0B5;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div class="br-t fa" style="font-size:150px">تحویل</div><div class="br-m ltr" style="font-size:50px">/deliver</div></div>
    <div class="br-st" id="bOk" style="left:620px;top:1380px;background:#FF7AA8;font-size:64px;transform:rotate(-8deg)">✓ DONE</div></div>`,
  build(H) {
    const { tl, T, count, scene, drift, q } = H;
    // a box drops in and lands with its shadow: the "press" of a physical button
    const slap = (el, t, r = 0) => tl.fromTo(el, { y: -70, x: -70, opacity: 0, rotation: r - 6, scale: 1.08 }, { y: 0, x: 0, opacity: 1, rotation: r, scale: 1, duration: .32, ease: "back.out(2.6)" }, t);
    const press = (el, t) => { tl.to(el, { x: 12, y: 12, boxShadow: "4px 4px 0 #111", duration: .08, ease: "power2.in" }, t); tl.to(el, { x: 0, y: 0, boxShadow: "16px 16px 0 #111", duration: .18, ease: "back.out(3)" }, t + .1); };
    const shove = (el, t) => tl.fromTo(el, { xPercent: 105 }, { xPercent: 0, duration: .35, ease: "power4.out" }, t);
    const sticker = (el, t, r) => tl.fromTo(el, { scale: 2.2, opacity: 0, rotation: r + 25 }, { scale: 1, opacity: 1, rotation: r, duration: .3, ease: "power4.out" }, t);
    [[0, T.qabl + .2], [T.ya - .2, T.gheymat + .2], [T.in2 - .2, T.repo + .2], [T.in3 - .2, 20.75]].forEach(([a, b]) => scene("#bF", a, b));
    // the dot grid slides and the camera floats, so no hold is ever still
    [["#bB1", T.qabl, T.ya], ["#bB2", T.gheymat, T.in2], ["#bB3", T.repo, T.in3], ["#bB4", 20.55, T.ye], ["#bB5", T.ye, T.az], ["#bB6", T.az, 30]].forEach(([el, a, b]) => {
      H.camera(el, a, b, { amp: 10 }); tl.fromTo(el + " .br-bg", { backgroundPosition: "22px 22px" }, { backgroundPosition: `${22 + 44 * 3}px ${22 + 44 * 6}px`, duration: b - a, ease: "none" }, a); });
    sticker(".br-tab", .1, 0);

    scene("#bB1", T.qabl - .2, T.ya + .1); shove("#bB1", T.qabl - .2);
    slap("#bB1x", T.qabl); tl.set("#bB1b", { opacity: 0 }, 0); tl.to("#bB1b", { opacity: 1, duration: .05 }, T.sakhtan); press("#bB1x", T.sakhtan);
    slap("#bB1y", T.abzar, -3); sticker("#bB1s", T.bebini, 8);

    scene("#bB2", T.gheymat - .2, T.in2 + .1); shove("#bB2", T.gheymat - .2);
    [T.gheymat, T.reghabat, T.mvp, T.bazar].forEach((t, i) => { tl.set("#bQ" + i, { opacity: 0 }, 0); slap("#bQ" + i, t - .05, [-2, 2, -1, 1][i]); press("#bQ" + i, t + .45); });

    scene("#bB3", T.repo - .2, T.in3 + .1); shove("#bB3", T.repo - .2);
    slap("#bB3w", T.repo - .1); ["#bB3a", "#bB3n", "#bB3o"].forEach((e, i) => tl.fromTo(e, { opacity: 0 }, { opacity: 1, duration: .05 }, T.repo + .2 + i * .3));
    sticker("#bB3s", T.sakhte - .4, 0); count("#bStar", T.sakhte - .4, 1.0, 0, 502, (v) => String(v)); sticker("#bB3t", T.sakhte + .2, -4);

    scene("#bB4", 20.55, T.ye + .1); shove("#bB4", 20.55);
    sticker("#bB4k", 20.6, 0); slap("#bB4f", T.founder, -1); slap("#bB4s", T.skills, 1); sticker("#bB4b", T.skills + .4, 10);
    press("#bB4f", T.skills + .9); press("#bB4s", T.skills + 1.1);

    scene("#bB5", T.ye - .2, T.az + .1); shove("#bB5", T.ye - .2);
    sticker("#bB5a", T.ye, 0); slap("#bN", 22.5); count("#bN13", 22.6, 1.75, 0, 13);
    q("#bTags").querySelectorAll(".br-tag").forEach((n, i) => sticker(n, 22.6 + i * .13, (i % 3) - 1));
    slap("#bB5b", T.eskil2 - .1); press("#bN", T.n13);

    scene("#bB6", T.az - .2, 30); shove("#bB6", T.az - .2);
    slap("#bS1", T.az - .05); slap("#bBar", T.etebar + .2);
    tl.fromTo("#bFill", { scaleX: 0 }, { scaleX: 1, duration: 1.9, ease: "power1.inOut" }, T.etebar + .5);
    tl.fromTo("#bFill", { backgroundPositionX: 0 }, { backgroundPositionX: 400, duration: 30 - T.etebar, ease: "none" }, T.etebar + .5);
    slap("#bS2", T.reghaba); sticker("#bOk", T.reghaba + .25, -8);
  },
};
