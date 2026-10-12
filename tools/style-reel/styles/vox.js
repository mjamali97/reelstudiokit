// Vox documentary collage, 30 s: one archival tabletop. Tan, ink, one hot red, mustard second. Paper never fades: it
// slides, springs, gets pinned or stamped. The camera pans across the board; the face windows are archival footage.
window.STYLES = window.STYLES || {};
window.STYLES.vox = {
  cap: { on: { color: "#F3EEE3", backgroundColor: "#D62E1F" }, off: { color: "#1A1A1A", backgroundColor: "#F3EEE3" } },
  css: `
  .st-vox .cap-c{font-family:"Fa",sans-serif;font-weight:900;font-size:50px;line-height:1.75}
  .st-vox .cap-c span{box-shadow:0 6px 14px rgba(0,0,0,.3);border-radius:4px;padding:0 14px;margin:0 4px}
  .st-vox .t{font-family:"Fa",sans-serif;color:#1A1A1A}
  .vx-face{position:absolute;inset:0;background:radial-gradient(circle,rgba(0,0,0,.16) 1.3px,transparent 1.8px) 0 0/9px 9px}
  .st-vox:not(.face-color) #face{filter:grayscale(1) contrast(1.22) brightness(1.04)}
  .st-vox.face-color #face{filter:contrast(1.08) saturate(.9)}
  .vx-edge{position:absolute;inset:0;box-shadow:inset 0 0 0 26px #C9BB9C,inset 0 0 90px rgba(60,40,10,.55)}
  .vx-table{position:absolute;inset:-80px;background:url(assets/paper-tan.jpg) center/cover}
  .vx-strip{position:absolute;background:#F3EEE3;box-shadow:0 6px 16px rgba(0,0,0,.28);padding:4px 30px;font-weight:900;line-height:1.55}
  .vx-stamp{position:absolute;border:10px solid #D62E1F;color:#D62E1F;padding:0 34px;font-weight:900;border-radius:12px;mix-blend-mode:multiply;line-height:1.5}
  .vx-tape{position:absolute;width:170px;height:52px;background:rgba(240,228,190,.85);box-shadow:0 2px 6px rgba(0,0,0,.15)}
  .vx-card{position:absolute;background:#F3EEE3;box-shadow:0 16px 32px rgba(0,0,0,.32)}
  .vx-pin{position:absolute;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#F6DE8E,#B8892B 60%,#7A5A1A);box-shadow:0 5px 8px rgba(0,0,0,.4)}
  .vx-ink{background:#1A1A1A}
  .vx-folder{position:absolute;left:80px;top:470px;width:920px;height:1000px;background:#D9A441;border-radius:10px;box-shadow:0 18px 40px rgba(0,0,0,.35)}
  .vx-mono{font-family:ui-monospace,"SF Mono",Menlo,monospace;color:#1A1A1A}
  .vx-news{position:absolute;left:60px;right:60px;background:#F3EEE3;box-shadow:0 10px 24px rgba(0,0,0,.3);text-align:center;font-family:"Fa",sans-serif;font-weight:900;color:#1A1A1A;letter-spacing:-2px}
  .vx-mini{position:absolute;width:290px;height:110px;background:#F3EEE3;box-shadow:0 8px 16px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;
    font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:30px;color:#1A1A1A}
  svg.vx-s{position:absolute;inset:0;width:1080px;height:1920px;overflow:visible} svg.vx-s path{fill:none;stroke:#D62E1F;stroke-width:5}
  `,
  html: `
  <div class="sc" id="xF"><div class="vx-face"></div><div class="vx-edge"></div>
    <div class="t vx-strip fa" id="xF1k" style="right:70px;top:260px;font-size:46px;transform:rotate(-2deg)">پرونده‌ی ۰۱ · ویژه‌ی جشن‌ها</div>
    <div class="vx-tape" style="left:60px;top:250px;transform:rotate(-24deg)"></div></div>

  <!-- B1 · a paper building goes up; a stamp; the menu card is taped on -->
  <div class="sc" id="xB1"><div class="vx-table" id="xT1"></div>
    <div class="t vx-strip fa" id="xB1a" style="right:70px;top:270px;font-size:84px;transform:rotate(-1.5deg)">قبل از سفارشش،</div>
    ${[0, 1, 2, 3, 4].map((i) => `<div class="vx-card" id="xBl${i}" style="left:${270 + (i % 2) * 40}px;top:${1250 - i * 160}px;width:500px;height:150px;transform:rotate(${i % 2 ? 2 : -2}deg)"></div>`).join("")}
    <div class="t vx-stamp fa" id="xSt" style="left:150px;top:820px;font-size:130px;transform:rotate(-12deg)">حتماً</div>
    <div class="vx-card" id="xTool" style="left:170px;top:560px;width:740px;height:700px;transform:rotate(2deg)">
      <div class="vx-tape" style="left:280px;top:-24px;transform:rotate(-4deg)"></div>
      <div class="vx-mono" style="position:absolute;left:0;right:0;top:120px;text-align:center;font-size:190px;line-height:1">&gt;_</div>
      <div class="t fa" style="position:absolute;left:0;right:0;top:400px;text-align:center;font-weight:900;font-size:110px;line-height:1.4">این منو</div>
      <div class="vx-ink" style="position:absolute;left:150px;right:150px;top:590px;height:10px;background:#D62E1F"></div></div>
    <div class="t vx-strip fa" id="xB1b" style="left:120px;top:1340px;font-size:76px;transform:rotate(2deg)">رو حتماً ببین</div></div>

  <!-- B2 · the evidence board, panned right to left -->
  <div class="sc" id="xB2"><div class="abs" id="xBoard" style="left:0;top:0;width:4320px;height:1920px">
      <div class="abs" style="inset:0;background:url(assets/paper-tan.jpg) 0 0/1080px 1920px repeat-x"></div>
      <svg class="vx-s" style="width:4320px" viewBox="0 0 4320 1920"><path id="xStr" d="M 4140 560 C 3700 420, 3500 700, 3060 560 S 2420 420, 1980 560 S 1340 700, 900 560"/></svg>
      ${[["icon-tag", "قیمت", "هر کیلو چنده؟"], ["icon-users", "طعم‌ها", "کدوما رو داریم؟"], ["icon-package", "اندازه", "برای چند نفر؟"], ["icon-store", "تحویل", "کِی و کجا؟"]]
        .map(([ic, w, s], i) => { const x = 3240 - i * 1080 + 140; return `
        <div class="vx-card" id="xK${i}" style="left:${x}px;top:560px;width:800px;height:900px;transform:rotate(${[2, -2, 1.5, -1.5][i]}deg)">
          <div class="mask abs" style="left:250px;top:110px;width:300px;height:300px;background:#1A1A1A;--i:url(assets/icons/${ic}.svg)"></div>
          <div class="t fa" style="position:absolute;left:0;right:0;top:450px;text-align:center;font-weight:900;font-size:${i === 0 ? 120 : 150}px;line-height:1.4">${w === "MVP" ? "اندازه" : w}</div>
          <div class="t fa" style="position:absolute;left:0;right:0;top:680px;text-align:center;font-weight:700;font-size:56px;color:#D62E1F">${s}</div></div>
        <div class="vx-pin" id="xKp${i}" style="left:${x + 380}px;top:540px"></div>
        <div class="t vx-strip" style="left:${x + 40}px;top:430px;font-size:44px">${["۰۱", "۰۲", "۰۳", "۰۴"][i]}</div>`; }).join("")}
    </div></div>

  <!-- B3 · the file on the shop -->
  <div class="sc" id="xB3"><div class="vx-table" id="xT3"></div>
    <div class="t vx-strip fa" id="xB3a" style="right:60px;top:260px;font-size:52px;white-space:nowrap">این منو دقیقاً واسه همین ساخته شده</div>
    <div class="vx-folder" id="xFold"><div class="t fa" style="position:absolute;right:60px;top:-70px;width:420px;height:80px;background:#D9A441;border-radius:14px 14px 0 0;text-align:center;font-weight:700;font-size:42px;line-height:80px">پرونده: منو</div>
      <div class="vx-card" style="left:40px;right:40px;top:40px;height:520px">
        <div class="vx-mono ltr" style="position:absolute;left:50px;top:60px;font-size:46px;color:#555">sweet corner /</div>
        <div class="vx-mono ltr" id="xRn" style="position:absolute;left:50px;right:50px;top:140px;font-size:52px;font-weight:700;white-space:nowrap">sweet-corner-bakery</div>
        <div class="t fa" style="position:absolute;right:50px;top:290px;font-weight:700;font-size:52px">تازه · هر روز صبح</div>
        <div class="t fa" style="position:absolute;right:50px;top:390px;font-weight:500;font-size:44px;color:#555">برای تولد و مهمونی</div></div>
      <div class="abs" id="xStat" style="left:330px;top:600px;width:540px;height:340px;background:#D62E1F;transform:rotate(3deg);box-shadow:0 14px 28px rgba(0,0,0,.3);text-align:center;padding-top:34px">
        <div class="ltr" style="white-space:nowrap;line-height:1.2;color:#F3EEE3"><span style="font-size:90px;vertical-align:18px">★ </span><span id="xNum" style="font-family:'Fa',sans-serif;font-weight:900;font-size:140px">0</span></div>
        <div class="t fa" style="font-weight:700;font-size:44px;line-height:1.5;color:#F3EEE3;white-space:nowrap">نظر پنج‌ستاره</div></div></div></div>

  <!-- B4 · the headline -->
  <div class="sc" id="xB4"><div class="vx-table" id="xT4"></div>
    <div class="t vx-strip fa" id="xB4k" style="left:0;right:0;margin:0 auto;width:max-content;top:330px;font-size:64px">شیرینی‌فروشی نمونه</div>
    <div class="vx-news ltr" id="xH1" style="top:520px;font-size:200px;line-height:1.15;transform:rotate(-2deg)">SWEET</div>
    <div class="vx-news ltr" id="xH2" style="top:790px;font-size:200px;line-height:1.15;transform:rotate(1.5deg)">CORNER</div>
    <div class="abs" id="xU" style="left:200px;top:1090px;width:680px;height:18px;background:#D62E1F;transform-origin:0 50%"></div>
    <div class="mask abs" id="xLogo" style="left:440px;top:1180px;width:200px;height:200px;background:#1A1A1A;--i:url(assets/icons/icon-cake.svg)"></div></div>

  <!-- B5 · thirteen cards pinned -->
  <div class="sc" id="xB5"><div class="vx-table" id="xT5"></div>
    <div class="t vx-strip fa" id="xB5a" style="right:70px;top:260px;font-size:58px">یه منوی ساده با</div>
    <div class="abs" id="xC13" style="left:70px;top:230px;width:300px;height:240px;background:#D62E1F;transform:rotate(-4deg);box-shadow:0 12px 24px rgba(0,0,0,.3);text-align:center">
      <div id="xN13" style="font-family:'Fa',sans-serif;font-weight:900;font-size:180px;line-height:1.3;color:#F3EEE3">۰</div></div>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => `<div class="vx-mini ltr" id="xM${i}" style="left:${[640, 330, 20][i % 3]}px;top:${560 + Math.floor(i / 3) * 150}px;transform:rotate(${((i * 37) % 7) - 3}deg)"><span id="xMn${i}"></span></div>`).join("")}
    <div class="t vx-strip fa" id="xB5b" style="left:0;right:0;margin:0 auto;width:max-content;top:1340px;font-size:72px">طعم واسه هر جشن</div></div>

  <!-- B6 · red string between two cards -->
  <div class="sc" id="xB6"><div class="vx-table" id="xT6"></div>
    <div class="vx-card" id="xN1" style="left:120px;top:400px;width:840px;height:330px;transform:rotate(-2deg)">
      <div class="t fa" style="position:absolute;left:0;right:0;top:60px;text-align:center;font-weight:900;font-size:96px;line-height:1.4;white-space:nowrap">ثبت سفارش</div>
      <div class="vx-mono ltr" style="position:absolute;left:0;right:0;top:230px;text-align:center;font-size:40px;color:#555">/order</div></div>
    <div class="vx-pin" id="xP1" style="left:520px;top:380px"></div>
    <svg class="vx-s"><path id="xS6" d="M 540 400 C 980 700, 100 900, 540 1100" /></svg>
    <div class="vx-card" id="xN2" style="left:120px;top:1100px;width:840px;height:330px;transform:rotate(2deg)">
      <div class="t fa" style="position:absolute;left:0;right:0;top:60px;text-align:center;font-weight:900;font-size:110px;line-height:1.4;color:#D62E1F">تحویل در خونه</div>
      <div class="vx-mono ltr" style="position:absolute;left:0;right:0;top:230px;text-align:center;font-size:40px;color:#555">/deliver</div></div>
    <div class="vx-pin" id="xP2" style="left:520px;top:1080px"></div></div>`,
  build(H) {
    const { tl, T, IN, reveal, revealL, type, draw, count, scene, drift, SKILLS, q } = H;
    SKILLS.forEach((s, i) => { q("#xMn" + i).textContent = s; });
    const slideIn = (el, t) => tl.fromTo(el, { x: -1100, rotation: -3 }, { x: 0, rotation: 0, duration: .45, ease: "power3.out" }, t);
    const slideOut = (el, t) => tl.to(el, { x: 1100, rotation: 3, duration: .4, ease: "power3.in" }, t);
    const pop = (el, t, r = 0) => tl.fromTo(el, { scale: .8, opacity: 0, rotation: r - 4 }, { scale: 1, opacity: 1, rotation: r, duration: .5, ease: "back.out(1.7)" }, t);
    const stamp = (el, t, r) => tl.fromTo(el, { scale: 2, opacity: 0, rotation: r - 8 }, { scale: 1, opacity: .92, rotation: r, duration: .2, ease: "power4.in" }, t);
    const strip = (el, t) => reveal(el, t, .45, "power3.out");

    // face windows: archival footage on the table
    [[0, T.qabl + .3], [T.ya - .3, T.gheymat + .3], [T.in2 - .3, T.repo + .3], [T.in3 - .3, 20.9]].forEach(([a, b]) => scene("#xF", a, b));
    tl.fromTo("#xF1k", { x: 0 }, { x: 0, duration: .01 }, 0);

    // B1
    scene("#xB1", T.qabl - .2, T.ya + .1); slideIn("#xB1", T.qabl - .2); drift("#xT1", T.qabl, T.ya, { x: 0 }, { x: -60 });
    strip("#xB1a", T.qabl + .1);
    [0, 1, 2, 3, 4].forEach((i) => tl.fromTo("#xBl" + i, { y: -400, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: "back.out(1.2)" }, T.qabl + .3 + i * .25));
    stamp("#xSt", T.hatman, -12);
    tl.fromTo("#xTool", { x: 900, rotation: 12 }, { x: 0, rotation: 2, duration: .55, ease: "power3.out" }, T.abzar - .1);
    tl.to("#xTool", { rotation: -1, duration: .8, ease: "sine.inOut" }, T.abzar + .5);
    strip("#xB1b", T.bebini - .1);
    slideOut("#xB1", T.ya - .2);

    // B2: the camera pans the board right to left, one card per word, the string runs across
    scene("#xB2", T.gheymat - .2, T.in2 + .1); slideIn("#xB2", T.gheymat - .2);
    tl.set("#xBoard", { x: -3240 }, 0);
    draw("#xStr", T.gheymat, 6.4, "none");
    [T.gheymat, T.reghabat, T.mvp, T.bazar].forEach((t, i) => {
      if (i) tl.to("#xBoard", { x: -3240 + i * 1080, duration: .55, ease: "power3.inOut" }, t - .3);
      tl.to("#xBoard", { x: "+=30", duration: 1.0, ease: "none" }, t + .3);
      pop("#xK" + i, t - .05, [2, -2, 1.5, -1.5][i]); pop("#xKp" + i, t + .25);
    });
    slideOut("#xB2", T.in2 - .2);

    // B3
    scene("#xB3", T.repo - .2, T.in3 + .1); slideIn("#xB3", T.repo - .2); drift("#xT3", T.repo, T.in3, { x: 0 }, { x: 60 });
    strip("#xB3a", T.repo + .05);
    tl.fromTo("#xFold", { y: 200, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: "back.out(1.2)" }, T.repo);
    type("#xRn", T.repo + .4, .7); pop("#xStat", T.sakhte - .4, 3);
    count("#xNum", T.sakhte - .3, 1.1, 0, 502);
    slideOut("#xB3", T.in3 - .2);

    // B4
    scene("#xB4", 20.5, T.ye + .1); slideIn("#xB4", 20.5); drift("#xT4", 20.5, T.ye, { scale: 1 }, { scale: 1.06 });
    strip("#xB4k", 20.6);
    tl.fromTo("#xH1", { scale: 1.6, opacity: 0, rotation: -6 }, { scale: 1, opacity: 1, rotation: -2, duration: .22, ease: "power4.in" }, T.founder - .1);
    tl.fromTo("#xH2", { scale: 1.6, opacity: 0, rotation: 6 }, { scale: 1, opacity: 1, rotation: 1.5, duration: .22, ease: "power4.in" }, T.skills - .1);
    tl.fromTo("#xU", { scaleX: 0 }, { scaleX: 1, duration: .3, ease: "power2.out" }, T.skills + .25);
    pop("#xLogo", T.skills + .4);
    // B5
    scene("#xB5", T.ye - .25, T.az + .1); slideIn("#xB5", T.ye - .25); drift("#xT5", T.ye, T.az, { x: 0 }, { x: -60 });
    strip("#xB5a", T.ye);
    SKILLS.forEach((s, i) => pop("#xM" + i, 22.6 + i * .13, ((i * 37) % 7) - 3));
    pop("#xC13", 22.55, -4); count("#xN13", 22.6, 1.75, 0, 13);
    tl.fromTo("#xC13", { scale: 1 }, { scale: 1.15, duration: .15, yoyo: true, repeat: 1 }, T.n13);
    strip("#xB5b", T.eskil2 - .1);
    // B6
    scene("#xB6", T.az - .2, 30); slideIn("#xB6", T.az - .2); drift("#xT6", T.az, 30, { scale: 1 }, { scale: 1.06 });
    pop("#xN1", T.az - .15, -2); pop("#xP1", T.etebar);
    draw("#xS6", T.etebar + 1.0, 2.0, "power1.inOut");
    pop("#xN2", T.reghaba - .05, 2); pop("#xP2", T.reghaba + .2);
  },
};
