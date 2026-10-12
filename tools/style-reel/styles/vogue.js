// Vogue editorial, 30 s: a magazine you read. Cream paper, Bodoni for the masthead, Markazi (Persian, by Borna
// Izadpanah) for every Persian line, one red. The face windows are a live cover; b-roll is spreads and pages that turn
// (never past 85 degrees, so the page never swings toward the camera).
window.STYLES = window.STYLES || {};
window.STYLES.vogue = {
  cap: { on: { color: "#F6F1E8", backgroundColor: "#B3122E" }, off: { color: "#F6F1E8", backgroundColor: "rgba(179,18,46,0)" } },
  css: `
  .st-vogue .cap-c{font-family:"Markazi",serif;font-weight:700;font-size:62px;line-height:1.45;text-shadow:0 4px 24px rgba(0,0,0,.55)}
  .st-vogue .s{font-family:"Markazi",serif;color:#121212} .st-vogue .b{font-family:"Bodoni",serif;color:#121212}
  .vg-paper{position:absolute;inset:-60px;background:url(assets/paper-cream.jpg) center/cover}
  .vg-frame{position:absolute;inset:0;box-shadow:inset 0 0 0 34px #F4EFE6}
  .vg-mast{position:absolute;left:0;right:0;top:230px;text-align:center;font-family:"Bodoni",serif;font-weight:500;font-size:228px;line-height:1;letter-spacing:-4px;color:#121212}
  .vg-iss{position:absolute;left:70px;right:70px;top:478px;display:flex;justify-content:space-between;font-family:"Bodoni",serif;font-size:26px;letter-spacing:5px;text-transform:uppercase;color:#121212}
  .vg-red{position:absolute;font-family:"Markazi",serif;font-weight:700;color:#F6F1E8;background:#B3122E;padding:0 20px;line-height:1.5}
  .vg-head{position:absolute;right:80px;left:80px;font-family:"Markazi",serif;font-weight:700;color:#121212;line-height:1.35}
  .vg-kick{position:absolute;right:80px;font-family:"Markazi",serif;font-weight:700;font-size:44px;color:#B3122E;line-height:1.5}
  .vg-rule{position:absolute;height:4px;background:#121212;transform-origin:100% 50%}
  .vg-page{position:absolute;inset:0;background:url(assets/paper-cream.jpg) center/cover;transform-origin:100% 50%;box-shadow:-30px 0 60px rgba(0,0,0,.18)}
  .vg-num{position:absolute;font-family:"Bodoni",serif;font-style:italic;font-weight:500;color:#B3122E;line-height:1}
  svg.vg-bp{position:absolute;left:140px;top:560px;width:800px;height:760px;overflow:visible}
  svg.vg-bp path{fill:none;stroke:#1C3E7A;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
  .vg-bpbg{position:absolute;left:120px;top:540px;width:840px;height:800px;background:
    linear-gradient(rgba(28,62,122,.12) 2px,transparent 2px) 0 0/40px 40px,linear-gradient(90deg,rgba(28,62,122,.12) 2px,transparent 2px) 0 0/40px 40px}
  .vg-tool{position:absolute;left:180px;top:620px;width:720px;height:620px;background:#121212;display:flex;flex-direction:column;align-items:center;justify-content:center;
    box-shadow:0 40px 90px rgba(0,0,0,.35)}
  .vg-idx{position:absolute;width:440px;font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:34px;line-height:1;color:#121212;display:flex;gap:16px;align-items:baseline}
  .vg-idx i{font-family:"Bodoni",serif;font-style:italic;color:#B3122E;font-size:36px;width:56px}
  .vg-hy{font-family:"Markazi",serif;font-style:normal}
  `,
  html: `
  <div class="sc" id="vF1"><div class="vg-mast ltr" id="vMast">${BRAND.mast}</div>
    <div class="vg-iss ltr"><span>N° 01</span><span>${BRAND.handle}</span></div>
    <div class="vg-red fa" style="right:70px;top:540px;font-size:42px">ویژه‌ی جشن‌ها</div></div>
  <div class="sc" id="vF"><div class="vg-frame"></div>
    <div class="b ltr" style="position:absolute;left:0;right:0;top:250px;text-align:center;font-size:40px;letter-spacing:12px;color:#F6F1E8;text-shadow:0 2px 12px rgba(0,0,0,.5)">${BRAND.mast}</div></div>

  <!-- B1 · the blueprint, then the tool -->
  <div class="sc" id="vB1"><div class="vg-paper" id="vB1p"></div>
    <div class="vg-kick fa" style="top:250px">گزارش ویژه</div>
    <div class="vg-head fa" id="vB1h" style="top:300px;font-size:128px">قبل از سفارشش،</div>
    <div class="vg-rule" id="vB1r" style="right:80px;width:920px;top:500px"></div>
    <div class="vg-bpbg" id="vBpBg"></div>
    <svg class="vg-bp" id="vBp" viewBox="0 0 800 760">
      <path id="vBp1" d="M 120 700 L 120 300 L 400 90 L 680 300 L 680 700 Z" /><path id="vBp2" d="M 120 300 L 680 300" />
      <path id="vBp3" d="M 320 700 L 320 500 L 480 500 L 480 700" /><path id="vBp4" d="M 180 380 L 280 380 L 280 460 L 180 460 Z M 520 380 L 620 380 L 620 460 L 520 460 Z" />
      <path id="vBp5" d="M 60 740 L 740 740" /></svg>
    <div class="vg-tool" id="vTool"><div style="font-family:ui-monospace,Menlo,monospace;font-size:170px;color:#F6F1E8;line-height:1.1">&gt;_</div>
      <div class="b" style="font-style:italic;font-size:70px;color:#F6F1E8">The Menu</div></div>
    <div class="vg-head fa" id="vB1b" style="top:1330px;font-size:104px;text-align:center;color:#B3122E">این منو رو حتماً ببین</div></div>

  <!-- B2 · four pages; each turns away on the spoken word -->
  <div class="sc" id="vB2">
    ${[["قیمت", "«هر کیلو چنده»", "I"], ["طعم‌ها", "«کدوما رو داریم»", "II"], ["اندازه", "«برای چند نفر»", "III"], ["تحویل", "«کِی و کجا»", "IV"]].reverse()
      .map(([w, s, n], j) => { const i = 3 - j; return `<div class="vg-page" id="vP${i}">
        <div class="vg-num ltr" style="left:80px;top:250px;font-size:300px;opacity:.9">${n}</div>
        <div class="vg-kick fa" style="top:300px">فصل ${["۰۱", "۰۲", "۰۳", "۰۴"][i]}</div>
        <div class="vg-rule" style="right:80px;width:920px;top:640px"></div>
        <div class="vg-head fa vP-w" id="vPw${i}" style="top:700px;font-size:${i === 0 ? 190 : 260}px;text-align:center">${w}</div>
        <div class="vg-head fa" id="vPs${i}" style="top:1130px;font-size:84px;text-align:center;font-weight:400;font-style:italic;color:#B3122E">${s}</div>
        <div class="vg-rule" style="right:80px;width:920px;top:1330px"></div></div>`; }).join("")}</div>

  <!-- B3 · the feature -->
  <div class="sc" id="vB3"><div class="vg-paper" id="vB3p"></div>
    <div class="vg-kick fa" style="top:250px">منو · رایگان</div>
    <div class="vg-head fa" id="vB3h" style="top:300px;font-size:84px">این منو دقیقاً واسه همین ساخته شده</div>
    <div class="vg-rule" style="right:80px;width:920px;top:560px" id="vB3r"></div>
    <div class="b ltr" id="vB3n1" style="position:absolute;left:80px;top:640px;font-style:italic;font-size:150px;line-height:1.05">sweet<span class="vg-hy">-</span>corner<span class="vg-hy">-</span></div>
    <div class="b ltr" id="vB3n2" style="position:absolute;left:80px;top:810px;font-style:italic;font-size:190px;line-height:1.05;color:#B3122E">bakery</div>
    <div class="b ltr" id="vB3by" style="position:absolute;left:84px;top:1040px;font-size:40px;letter-spacing:6px;text-transform:uppercase">by sweet corner</div>
    <div class="vg-rule" style="right:80px;width:920px;top:1150px"></div>
    <div class="ltr" id="vB3f" style="position:absolute;left:80px;right:160px;top:1190px;display:flex;justify-content:space-between;font-family:'Bodoni',serif;font-size:44px;letter-spacing:4px">
      <span><span style="color:#B3122E">★</span> <span id="vStar">0</span></span><span>FRESH</span><span>HANDMADE</span></div></div>

  <!-- B4 · the cover: the masthead becomes the name -->
  <div class="sc" id="vB4"><div class="vg-paper"></div>
    <div class="b ltr" id="vB4f" style="position:absolute;left:0;right:0;top:250px;text-align:center;font-weight:500;font-size:196px;line-height:1;letter-spacing:-4px">SWEET</div>
    <div class="b ltr" id="vB4s" style="position:absolute;left:0;right:0;top:450px;text-align:center;font-weight:500;font-size:196px;line-height:1;letter-spacing:-4px;color:#B3122E">CORNER</div>
    <img class="abs" id="vB4l" src="assets/icons/icon-cake.svg" style="left:290px;top:720px;width:500px;height:500px" />
    <div class="vg-red fa" id="vB4c" style="left:0;right:0;margin:0 auto;width:max-content;top:1260px;font-size:60px">شیرینی‌فروشی نمونه</div></div>

  <!-- B5 · the index of thirteen -->
  <div class="sc" id="vB5"><div class="vg-paper" id="vB5p"></div>
    <div class="vg-kick fa" style="top:250px">فهرست</div>
    <div class="vg-head fa" id="vB5h" style="top:300px;font-size:84px">یه منوی ساده با</div>
    <div class="b" id="vN13" style="position:absolute;left:80px;top:230px;font-style:italic;font-size:250px;line-height:1;color:#B3122E">0</div>
    <div class="vg-rule" style="right:80px;width:920px;top:520px"></div>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => `<div class="vg-idx ltr" id="vI${i}" style="left:${i < 7 ? 60 : 500}px;top:${580 + (i % 7) * 104}px"><i>${String(i + 1).padStart(2, "0")}</i><span id="vIn${i}"></span></div>`).join("")}
    <div class="vg-head fa" id="vB5b" style="top:1330px;font-size:96px;text-align:center">طعم واسه <span style="color:#B3122E">هر جشن</span></div></div>

  <!-- B6 · the chain -->
  <div class="sc" id="vB6"><div class="vg-paper" id="vB6p"></div>
    <div class="vg-kick fa" style="top:250px">زنجیره</div>
    <div class="vg-head fa" id="vC1" style="top:420px;font-size:130px;text-align:center">ثبت سفارش</div>
    <div class="ltr" id="vC1m" style="position:absolute;left:0;right:0;top:620px;text-align:center;font-family:ui-monospace,Menlo,monospace;font-size:40px;color:#555">/order</div>
    <svg class="abs" style="left:0;top:0;width:1080px;height:1920px;overflow:visible"><path id="vLine" d="M 540 700 C 760 820, 320 900, 540 1020" stroke="#B3122E" stroke-width="6" fill="none" stroke-linecap="round"/></svg>
    <div class="vg-head fa" id="vC2" style="top:1040px;font-size:130px;text-align:center;color:#B3122E">تحویل در خونه</div>
    <div class="ltr" id="vC2m" style="position:absolute;left:0;right:0;top:1240px;text-align:center;font-family:ui-monospace,Menlo,monospace;font-size:40px;color:#555">/deliver</div></div>`,
  build(H) {
    const { tl, T, IN, OUT, reveal, revealL, draw, count, scene, drift, SKILLS, q, fa } = H;
    SKILLS.forEach((s, i) => { q("#vIn" + i).textContent = s; });
    const turnIn = (el, t) => tl.fromTo(el, { rotationY: -80, transformPerspective: 2600, transformOrigin: "0% 50%", opacity: .3 }, { rotationY: 0, opacity: 1, duration: .5, ease: "power3.out" }, t);
    const turnOut = (el, t) => { tl.to(el, { rotationY: 82, transformPerspective: 2600, transformOrigin: "100% 50%", opacity: .2, duration: .45, ease: "power3.in" }, t);
      tl.set(el, { visibility: "hidden" }, t + .46); };
    const pageIn = (el, t) => tl.fromTo(el, { x: -1080 }, { x: 0, duration: .5, ease: "power3.inOut" }, t);
    const pageOut = (el, t) => tl.to(el, { x: 1080, duration: .5, ease: "power3.inOut" }, t);

    // live cover from frame 0: the masthead sits over the speaker's background, they speak under it
    scene("#vF1", 0, T.qabl + .3);
    tl.fromTo("#vMast", { y: -14 }, { y: 0, duration: .6, ease: "expo.out" }, 0);
    scene("#vF", T.ya - .3, 20.9); tl.set("#vF", { visibility: "hidden" }, T.gheymat + .3); tl.set("#vF", { visibility: "visible" }, T.in2 - .3);
    tl.set("#vF", { visibility: "hidden" }, T.repo + .3); tl.set("#vF", { visibility: "visible" }, T.in3 - .3);

    // B1: the blueprint draws itself, the menu card covers it on «منو»
    scene("#vB1", T.qabl - .2, T.ya + .1); pageIn("#vB1", T.qabl - .2); drift("#vB1p", T.qabl, T.ya, { scale: 1 }, { scale: 1.05 });
    reveal("#vB1h", T.qabl + .1, .6); tl.fromTo("#vB1r", { scaleX: 0 }, { scaleX: 1, duration: .5, ease: "expo.out" }, T.qabl + .3);
    tl.fromTo("#vBpBg", { opacity: 0 }, { opacity: 1, duration: .4 }, T.qabl + .2);
    draw("#vBp5", T.qabl + .3, .4); draw("#vBp1", T.qabl + .5, 1.0); draw("#vBp2", T.sakhtan, .4); draw("#vBp3", T.sakhtan + .3, .5); draw("#vBp4", T.hatman - .2, .6);
    tl.fromTo("#vTool", { y: 140, opacity: 0, rotation: -3 }, { y: 0, opacity: 1, rotation: 0, duration: .6, ease: "back.out(1.3)" }, T.abzar - .1);
    tl.to("#vTool", { rotation: 1.5, y: -14, duration: .9, ease: "sine.inOut" }, T.abzar + .5);
    reveal("#vB1b", T.bebini - .15, .6);
    pageOut("#vB1", T.ya - .25);

    // B2: four pages stacked; each turns away on the next word
    scene("#vB2", T.gheymat - .25, T.in2 + .1); pageIn("#vB2", T.gheymat - .25);
    [T.gheymat, T.reghabat, T.mvp, T.bazar].forEach((t, i) => {
      reveal("#vPw" + i, t, .55); reveal("#vPs" + i, t + .35, .6);
      tl.fromTo("#vP" + i, { scale: 1 }, { scale: 1.04, duration: 2.2, ease: "none" }, t - .2);
      if (i < 3) turnOut("#vP" + i, [T.reghabat, T.mvp, T.bazar][i] - .3);
    });
    pageOut("#vB2", T.in2 - .25);

    // B3: the feature page
    scene("#vB3", T.repo - .25, T.in3 + .1); pageIn("#vB3", T.repo - .25); drift("#vB3p", T.repo, T.in3, { scale: 1 }, { scale: 1.06 });
    reveal("#vB3h", T.repo, .6); tl.fromTo("#vB3r", { scaleX: 0 }, { scaleX: 1, duration: .5, ease: "expo.out" }, T.repo + .2);
    revealL("#vB3n1", T.repo + .3, .6); revealL("#vB3n2", T.repo + .6, .6); IN("#vB3by", T.repo + .9, { dx: -30 });
    IN("#vB3f", T.sakhte - .4, { dx: 0, dy: 20 }); count("#vStar", T.sakhte - .3, 1.0, 0, 502, (v) => String(v));
    pageOut("#vB3", T.in3 - .25);

    // B4: the cover with the name as masthead
    scene("#vB4", 20.5, T.ye + .1); pageIn("#vB4", 20.5);
    tl.fromTo("#vB4f", { clipPath: "inset(0 0 100% 0)", y: -20 }, { clipPath: "inset(0 0 0% 0)", y: 0, duration: .45, ease: "expo.out" }, T.founder - .05);
    tl.fromTo("#vB4s", { clipPath: "inset(0 0 100% 0)", y: -20 }, { clipPath: "inset(0 0 0% 0)", y: 0, duration: .45, ease: "expo.out" }, T.skills - .05);
    tl.fromTo("#vB4l", { scale: .6, rotation: -30, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: .8, ease: "expo.out" }, 20.6);
    tl.to("#vB4l", { rotation: 25, duration: 1.4, ease: "none" }, 21.4);
    IN("#vB4c", 20.9);
    // B5: the index fills line by line on the ticks
    scene("#vB5", T.ye - .25, T.az + .1); turnIn("#vB5", T.ye - .25); drift("#vB5p", T.ye, T.az, { scale: 1 }, { scale: 1.05 });
    reveal("#vB5h", T.ye, .5);
    SKILLS.forEach((s, i) => { tl.fromTo("#vI" + i, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: .3, ease: "expo.out" }, 22.65 + i * .13); });
    count("#vN13", 22.6, 1.75, 0, 13, (v) => String(v));
    tl.fromTo("#vN13", { scale: 1 }, { scale: 1.15, duration: .15, yoyo: true, repeat: 1 }, T.n13);
    reveal("#vB5b", T.eskil2 - .1, .6);
    // B6: the chain, a red thread from one to the next
    scene("#vB6", T.az - .25, 30); pageIn("#vB6", T.az - .25); drift("#vB6p", T.az, 30, { scale: 1 }, { scale: 1.05 });
    reveal("#vC1", T.az - .15, .6); IN("#vC1m", T.etebar, { dx: 0, dy: 16 });
    draw("#vLine", T.etebar + 1.2, 1.7, "power1.inOut");
    reveal("#vC2", T.reghaba - .05, .5); IN("#vC2m", T.reghaba + .2, { dx: 0, dy: 16 });
  },
};
