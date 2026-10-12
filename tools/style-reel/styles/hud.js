// HUD / terminal, 30 s: a living blue field, a HUD frame that stays on for the whole film (brackets, scene label,
// REC timecode, progress), widgets that move all the time (radar, slot reels, a wireframe cube, a target), real
// real slash commands typed on the spoken words, chromatic slams.
window.STYLES = window.STYLES || {};
window.STYLES.hud = {
  cap: { on: { color: "#3D40FE", backgroundColor: "#FFFFFF" }, off: { color: "#FFFFFF", backgroundColor: "rgba(255,255,255,0)" } },
  css: `
  .st-hud .cap-c{font-family:"Fa",sans-serif;font-weight:900;font-size:56px;line-height:1.55;text-shadow:0 0 30px rgba(10,11,61,.7)}
  .st-hud .t{font-family:"Fa",sans-serif;color:#fff}
  .st-hud .m{font-family:ui-monospace,"SF Mono",Menlo,monospace;color:#fff}
  .hd-bg{position:absolute;inset:0;background:radial-gradient(120% 80% at 50% 45%,#4A4DFF 0%,#3D40FE 45%,#2A2DE0 100%)}
  .hd-spot{position:absolute;width:1000px;height:1000px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.22),rgba(255,255,255,0) 65%)}
  .hd-scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.04) 0 2px,transparent 2px 5px)}
  .hd-br{position:absolute;width:70px;height:70px;border-color:#fff;border-style:solid}
  .hd-lab{position:absolute;font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:28px;letter-spacing:2px;color:#fff;line-height:1.6}
  .hd-term{position:absolute;left:70px;width:940px;background:#0A0B3D;border-radius:26px;box-shadow:0 0 0 2px rgba(201,202,255,.5),0 30px 90px rgba(10,11,61,.6);padding:80px 40px 30px;overflow:hidden}
  .hd-term:before{content:"";position:absolute;left:32px;top:30px;width:18px;height:18px;border-radius:50%;background:#FF5F57;box-shadow:28px 0 0 #FEBC2E,56px 0 0 #28C840}
  .hd-line{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:40px;line-height:70px;height:70px;color:#C9CAFF;white-space:nowrap}
  .hd-line b{color:#fff}
  .hd-ring{position:absolute;border:3px solid rgba(255,255,255,.7);border-radius:50%}
  .hd-blip{position:absolute;width:30px;height:30px;border-radius:50%;background:#fff;box-shadow:0 0 24px #fff}
  .hd-reel{position:absolute;top:640px;width:190px;height:260px;background:#0A0B3D;border-radius:20px;overflow:hidden;box-shadow:0 0 0 3px rgba(201,202,255,.6)}
  .hd-reel div{font-family:ui-monospace,Menlo,monospace;font-size:170px;line-height:260px;text-align:center;color:#fff}
  .hd-cube{position:absolute;left:390px;top:520px;width:300px;height:300px;transform-style:preserve-3d}
  .hd-cube i{position:absolute;inset:0;border:5px solid #fff;background:rgba(255,255,255,.06)}
  .hd-node{position:absolute;left:170px;width:740px;height:220px;border-radius:26px;background:#0A0B3D;box-shadow:0 0 0 3px #C9CAFF,0 0 60px rgba(201,202,255,.45);
    display:flex;flex-direction:column;align-items:center;justify-content:center}
  .hd-pk{position:absolute;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 0 20px #fff}
  .hd-bar{height:12px;background:rgba(255,255,255,.15);border-radius:6px;overflow:hidden;width:240px}
  .hd-bar i{display:block;height:100%;background:#fff;transform-origin:0 50%}
  `,
  html: `
  <!-- B1 -->
  <div class="sc" id="hB1"><div class="hd-bg"></div><div class="hd-spot" id="hS1" style="left:-300px;top:200px"></div>
    <div class="t fa" id="hB1a" style="position:absolute;right:70px;left:70px;top:300px;font-weight:900;font-size:100px;line-height:1.5">قبل از سفارشش،</div>
    <div class="hd-term" id="hT1" style="top:560px;height:640px">
      <div class="hd-line ltr" id="h1l1">$ <b>order --cake</b></div>
      <div class="hd-line ltr" id="h1l2">$ <b>pick --everything</b></div>
      <div class="hd-line ltr" id="h1l3">  choosing <span id="h1p">0</span>%</div>
      <div style="height:16px;margin:6px 0 20px;background:rgba(255,255,255,.12);border-radius:8px;overflow:hidden"><i id="h1bar" style="display:block;height:100%;width:100%;background:#fff;transform-origin:0 50%"></i></div>
      <div class="hd-line ltr" id="h1l4" style="color:#FF5F57">  ⏸  stuck</div>
      <div class="hd-line ltr" id="h1l5" style="color:#28C840">› <b>sweet-corner-bakery</b></div></div>
    <div class="t fa" id="hB1b" style="position:absolute;right:70px;left:70px;top:1260px;font-weight:900;font-size:100px;line-height:1.5;text-align:center">این منو رو ببین</div></div>

  <!-- B2 -->
  <div class="sc" id="hB2"><div class="hd-bg"></div><div class="hd-spot" id="hS2" style="left:400px;top:-200px"></div>
    <div class="abs" id="hW0" style="inset:0">
      ${[0, 1, 2].map((i) => `<div class="hd-reel" style="left:${255 + i * 210}px"><div class="abs ltr" id="hReel${i}" style="left:0;right:0;top:0">${"?0123456789?".split("").map((c) => `<div>${c}</div>`).join("")}</div></div>`).join("")}
      <div class="mask abs" style="left:420px;top:330px;width:240px;height:240px;background:#fff;--i:url(assets/icons/icon-tag.svg)"></div></div>
    <div class="abs" id="hW1" style="inset:0">
      ${[0, 1, 2, 3].map((k) => `<div class="hd-ring" style="left:${540 - (k + 1) * 95}px;top:${700 - (k + 1) * 95}px;width:${(k + 1) * 190}px;height:${(k + 1) * 190}px"></div>`).join("")}
      <div class="abs" id="hSweep" style="left:160px;top:320px;width:760px;height:760px;border-radius:50%;background:conic-gradient(from 0deg,rgba(255,255,255,.45),rgba(255,255,255,0) 60deg,rgba(255,255,255,0))"></div>
      ${[[300, 470], [740, 520], [620, 880], [360, 820], [520, 400]].map(([x, y], k) => `<div class="hd-blip" id="hBl${k}" style="left:${x}px;top:${y}px"></div>`).join("")}</div>
    <div class="abs" id="hW2" style="inset:0;perspective:1400px"><div class="hd-cube" id="hCube">
      <i style="transform:translateZ(150px)"></i><i style="transform:rotateY(180deg) translateZ(150px)"></i><i style="transform:rotateY(90deg) translateZ(150px)"></i>
      <i style="transform:rotateY(-90deg) translateZ(150px)"></i><i style="transform:rotateX(90deg) translateZ(150px)"></i><i style="transform:rotateX(-90deg) translateZ(150px)"></i></div></div>
    <div class="abs" id="hW3" style="inset:0">
      ${[0, 1, 2, 3].map((k) => `<div class="hd-ring" style="left:${540 - (k + 1) * 85}px;top:${700 - (k + 1) * 85}px;width:${(k + 1) * 170}px;height:${(k + 1) * 170}px;${k === 0 ? "background:#fff" : ""}"></div>`).join("")}
      <div class="abs" id="hArrow" style="left:540px;top:690px;width:520px;height:20px;background:#fff;transform-origin:0 50%;transform:rotate(-30deg)"></div></div>
    ${[["قیمت", "/menu:price"], ["طعم‌ها", "/menu:flavors"], ["اندازه", "/menu:size"], ["تحویل", "/menu:delivery"]].map(([w, c], i) => `
      <div class="t fa" id="hQ${i}" style="position:absolute;left:0;right:0;top:1090px;text-align:center;font-weight:900;font-size:${i ? 150 : 130}px;line-height:1.4;opacity:0">${w === "MVP" ? "اندازه" : w}</div>
      <div class="hd-line ltr" id="hC${i}" style="position:absolute;left:0;right:0;top:1310px;text-align:center;opacity:0">› <b>${c}</b></div>`).join("")}</div>

  <!-- B3 -->
  <div class="sc" id="hB3"><div class="hd-bg"></div><div class="hd-spot" id="hS3" style="left:200px;top:600px"></div>
    <div class="t fa" id="hB3a" style="position:absolute;right:70px;left:70px;top:300px;font-weight:900;font-size:84px;line-height:1.5;text-align:center">این منو دقیقاً واسه همین ساخته شده</div>
    <div class="hd-term" id="hT3" style="top:620px;height:560px">
      <div class="hd-line ltr" id="h3l1">$ open <b>order.example/</b></div>
      <div class="hd-line ltr" id="h3l2">  <b>sweet-corner-bakery</b></div>
      <div class="hd-line ltr" id="h3l3" style="color:#28C840">✓ 13 flavors · fresh</div>
      <div class="m ltr" id="h3s" style="margin-top:30px;font-size:120px;line-height:1.2">★ <span id="hStar">0</span></div></div></div>

  <!-- B4 -->
  <div class="sc" id="hB4"><div class="hd-bg"></div><div class="hd-spot" id="hS4" style="left:0;top:400px"></div>
    <img class="abs" id="hLogo" src="assets/icons/icon-cake.svg" style="left:390px;top:330px;width:300px;height:300px;filter:brightness(0) invert(1)" />
    <div class="t fa" id="hB4k" style="position:absolute;left:0;right:0;top:680px;text-align:center;font-weight:700;font-size:64px">شیرینی‌فروشی نمونه</div>
    <div class="t ltr" id="hN" style="position:absolute;left:0;right:0;top:800px;text-align:center;font-weight:900;font-size:190px;line-height:1.05">
      <span class="c1" style="position:absolute;inset:0;color:#FF3B6B;mix-blend-mode:screen">SWEET<br>CORNER</span><span class="c2" style="position:absolute;inset:0;color:#3BE3FF;mix-blend-mode:screen">SWEET<br>CORNER</span><span style="position:relative">SWEET<br>CORNER</span></div></div>

  <!-- B5 -->
  <div class="sc" id="hB5"><div class="hd-bg"></div><div class="hd-spot" id="hS5" style="left:300px;top:300px"></div>
    <div class="t fa" id="hB5a" style="position:absolute;right:70px;top:280px;font-weight:700;font-size:60px;line-height:1.5">یه منوی ساده با</div>
    <div class="t" id="hN13" style="position:absolute;left:70px;top:220px;font-weight:900;font-size:220px;line-height:1.2">۰</div>
    <div class="hd-term" id="hT5" style="top:560px;height:780px;padding:70px 40px 20px"><div class="abs" id="hScan" style="left:0;right:0;top:60px;height:60px;background:linear-gradient(rgba(255,255,255,0),rgba(255,255,255,.14),rgba(255,255,255,0))"></div>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => `<div class="ltr" id="hL${i}" style="display:flex;align-items:center;justify-content:space-between;height:52px;opacity:0">
        <span class="m" style="font-size:34px"><span style="color:#28C840">✓</span> <span id="hLn${i}"></span></span><span class="hd-bar"><i id="hLb${i}"></i></span></div>`).join("")}</div>
    <div class="t fa" id="hB5b" style="position:absolute;left:0;right:0;top:1360px;text-align:center;font-weight:900;font-size:80px">طعم واسه هر جشن</div></div>

  <!-- B6 -->
  <div class="sc" id="hB6"><div class="hd-bg"></div><div class="hd-spot" id="hS6" style="left:-100px;top:700px"></div>
    <div class="hd-node" id="hN1" style="top:430px"><div class="t fa" style="font-weight:900;font-size:84px;line-height:1.4">ثبت سفارش</div><div class="m ltr" style="font-size:36px;color:#C9CAFF">/order</div></div>
    <div class="abs" id="hLink" style="left:536px;top:650px;width:8px;height:370px;background:rgba(255,255,255,.5);transform-origin:50% 0"></div>
    ${[0, 1, 2].map((k) => `<div class="hd-pk" id="hPk${k}" style="left:530px;top:650px;opacity:0"></div>`).join("")}
    <div class="hd-node" id="hN2" style="top:1020px"><div class="t fa" style="font-weight:900;font-size:84px;line-height:1.4">تحویل در خونه</div><div class="m ltr" style="font-size:36px;color:#C9CAFF">/deliver</div></div></div>

  <!-- the HUD frame, on top of everything for the whole film -->
  <div class="abs" style="inset:0">
    <div class="hd-scan"></div>
    <div class="hd-br" style="left:40px;top:220px;border-width:5px 0 0 5px"></div><div class="hd-br" style="right:40px;top:220px;border-width:5px 5px 0 0"></div>
    <div class="hd-br" style="left:40px;top:1460px;border-width:0 0 5px 5px"></div><div class="hd-br" style="right:40px;top:1460px;border-width:0 5px 5px 0"></div>
    <div class="hd-lab ltr" style="left:130px;top:236px">${BRAND.mast} · REEL · ${BRAND.year}</div>
    <div class="hd-lab ltr" style="left:130px;top:1486px"><span id="hRec" style="color:#FF5F57">●</span> REC <span id="hTc">00:00:00</span></div>
    <div class="abs" style="left:40px;right:40px;top:1545px;height:4px;background:rgba(255,255,255,.25)"><i id="hProg" style="position:absolute;inset:0;background:#fff;transform-origin:0 50%"></i></div></div>`,
  build(H) {
    const { tl, T, IN, OUT, reveal, type, count, scene, SKILLS, q } = H;
    SKILLS.forEach((s, i) => { q("#hLn" + i).textContent = s; });
    const glitchIn = (el, t) => { tl.fromTo(el, { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: .3, ease: "power4.inOut" }, t);
      tl.fromTo(el, { x: 26 }, { x: 0, duration: .12, ease: "steps(3)" }, t + .3); };
    const glitchOut = (el, t) => tl.to(el, { clipPath: "inset(0 100% 0 0%)", duration: .3, ease: "power4.inOut" }, t);
    const spot = (el, t0, t1) => tl.fromTo(el, { x: 0, y: 0 }, { x: 500, y: 400, duration: t1 - t0, ease: "sine.inOut" }, t0);
    const chroma = (el, t) => { tl.fromTo(el, { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: .45, ease: "expo.out" }, t);
      tl.fromTo(el + " .c1", { x: -30 }, { x: 0, duration: .5, ease: "expo.out" }, t); tl.fromTo(el + " .c2", { x: 30 }, { x: 0, duration: .5, ease: "expo.out" }, t);
      tl.to(el + " .c1", { x: 16, duration: .05, yoyo: true, repeat: 3 }, t + .7); };
    // the frame: timecode, blinking REC, progress
    const tc = { f: 0 }; tl.fromTo(tc, { f: 0 }, { f: 900, duration: 30, ease: "none", onUpdate: () => { const f = Math.round(tc.f), s = Math.floor(f / 30);
      q("#hTc").textContent = `00:${String(s).padStart(2, "0")}:${String(f % 30).padStart(2, "0")}`; q("#hRec").style.opacity = Math.floor(f / 15) % 2 ? .25 : 1; } }, 0);
    tl.fromTo("#hProg", { scaleX: 0 }, { scaleX: 1, duration: 30, ease: "none" }, 0);

    // B1
    scene("#hB1", T.qabl - .2, T.ya + .1); glitchIn("#hB1", T.qabl - .2); H.camera("#hB1", T.qabl, T.ya, { amp: 10 }); spot("#hS1", T.qabl, T.ya);
    IN("#hB1a", T.qabl + .05);
    ["#h1l1", "#h1l2", "#h1l3", "#h1l4", "#h1l5"].forEach((e) => tl.set(e, { clipPath: "inset(-20% 100% -20% 0%)" }, 0));
    type("#h1l1", T.qabl + .2, .45); type("#h1l2", T.qabl + .8, .45); type("#h1l3", T.qabl + 1.35, .15);
    count("#h1p", T.qabl + 1.4, T.hatman - T.qabl - 1.4, 0, 62, (v) => String(v));
    tl.fromTo("#h1bar", { scaleX: 0 }, { scaleX: .62, duration: T.hatman - T.qabl - 1.4, ease: "power1.out" }, T.qabl + 1.4);
    type("#h1l4", T.hatman, .2); tl.to("#h1bar", { backgroundColor: "#FF5F57", duration: .1 }, T.hatman);
    type("#h1l5", T.abzar - .2, .5);
    tl.to("#hT1", { boxShadow: "0 0 0 4px #28C840, 0 0 90px rgba(40,200,64,.5)", duration: .3 }, T.abzar);
    OUT("#hB1a", T.abzar - .3); tl.fromTo("#hB1b", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .5, ease: "expo.out" }, T.abzar);
    glitchOut("#hB1", T.ya - .2);

    // B2: four widgets, each moving the whole time it is up; glitch cuts between
    scene("#hB2", T.gheymat - .2, T.in2 + .1); glitchIn("#hB2", T.gheymat - .2); spot("#hS2", T.gheymat, T.in2);
    const ts = [T.gheymat, T.reghabat, T.mvp, T.bazar, T.in2];
    [0, 1, 2, 3].forEach((i) => { tl.set("#hW" + i, { opacity: 0 }, 0); tl.set("#hW" + i, { opacity: 1 }, ts[i]); tl.set("#hW" + i, { opacity: 0 }, ts[i + 1]);
      tl.set(["#hQ" + i, "#hC" + i], { opacity: 0 }, ts[i + 1]);
      tl.fromTo("#hQ" + i, { opacity: 0, scale: 1.2 }, { opacity: 1, scale: 1, duration: .25, ease: "power4.out" }, ts[i]);
      tl.set("#hC" + i, { opacity: 1 }, ts[i] + .2); type("#hC" + i, ts[i] + .2, .5);
      tl.fromTo("#hW" + i, { x: 30 }, { x: 0, duration: .12, ease: "steps(3)" }, ts[i]); });
    [0, 1, 2].forEach((k) => tl.fromTo("#hReel" + k, { y: 0 }, { y: -2600, duration: 1.3 + k * .15, ease: "power2.inOut", repeat: 0 }, T.gheymat + k * .05));
    tl.fromTo("#hSweep", { rotation: 0 }, { rotation: 720, duration: T.mvp - T.reghabat, ease: "none" }, T.reghabat);
    [0, 1, 2, 3, 4].forEach((k) => tl.fromTo("#hBl" + k, { scale: 0 }, { scale: 1, duration: .3, ease: "back.out(3)" }, T.reghabat + .2 + k * .3));
    tl.fromTo("#hCube", { rotationX: -20, rotationY: 0 }, { rotationX: 25, rotationY: 260, duration: T.bazar - T.mvp, ease: "none" }, T.mvp);
    tl.fromTo("#hArrow", { x: 700, y: -400, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: .35, ease: "power3.in" }, T.bazar + .1);
    tl.fromTo("#hW3", { scale: 1 }, { scale: 1.04, duration: .12, yoyo: true, repeat: 1 }, T.bazar + .45);
    glitchOut("#hB2", T.in2 - .2);

    // B3
    scene("#hB3", T.repo - .2, T.in3 + .1); glitchIn("#hB3", T.repo - .2); spot("#hS3", T.repo, T.in3);
    IN("#hB3a", T.repo);
    ["#h3l1", "#h3l2", "#h3l3"].forEach((e) => tl.set(e, { clipPath: "inset(-20% 100% -20% 0%)" }, 0));
    type("#h3l1", T.repo + .1, .6); type("#h3l2", T.repo + .75, .4); type("#h3l3", T.sakhte - .4, .3);
    tl.fromTo("#h3s", { opacity: 0 }, { opacity: 1, duration: .2 }, T.sakhte - .1); count("#hStar", T.sakhte - .1, 1.0, 0, 502, (v) => String(v));
    glitchOut("#hB3", T.in3 - .2);
    // B4
    scene("#hB4", 20.5, T.ye + .1); glitchIn("#hB4", 20.5); spot("#hS4", 20.5, T.ye);
    tl.fromTo("#hLogo", { scale: .5, rotation: -60, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: .6, ease: "expo.out" }, 20.55);
    tl.to("#hLogo", { rotation: 30, duration: 1.3, ease: "none" }, 21.15);
    IN("#hB4k", 20.7, { dx: 0, dy: 20 }); chroma("#hN", T.founder - .05);
    // B5
    scene("#hB5", T.ye - .25, T.az + .1); glitchIn("#hB5", T.ye - .25); spot("#hS5", T.ye, T.az);
    IN("#hB5a", T.ye); count("#hN13", 22.6, 1.75, 0, 13);
    SKILLS.forEach((s, i) => { tl.fromTo("#hL" + i, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: .2, ease: "expo.out" }, 22.62 + i * .13);
      tl.fromTo("#hLb" + i, { scaleX: 0 }, { scaleX: 1, duration: .6, ease: "power2.out" }, 22.65 + i * .13); });
    tl.fromTo("#hN13", { scale: 1 }, { scale: 1.15, duration: .15, yoyo: true, repeat: 1 }, T.n13);
    tl.fromTo("#hScan", { y: 0 }, { y: 660, duration: .9, ease: "none", repeat: 3 }, 24.3);
    tl.fromTo("#hT5", { scale: 1 }, { scale: 1.04, duration: 2.1, ease: "sine.inOut" }, 24.3);
    tl.fromTo("#hB5b", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .5, ease: "expo.out" }, T.eskil2 - .1);
    // B6
    scene("#hB6", T.az - .2, 30); glitchIn("#hB6", T.az - .2); spot("#hS6", T.az, 30);
    tl.fromTo("#hN1", { scale: .8, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, ease: "back.out(1.6)" }, T.etebar);
    tl.fromTo("#hLink", { scaleY: 0 }, { scaleY: 1, duration: 1.4, ease: "power1.inOut" }, T.etebar + .9);
    [0, 1, 2].forEach((k) => tl.fromTo("#hPk" + k, { y: 0, opacity: 1 }, { y: 360, opacity: 0, duration: .7, ease: "power1.in", repeat: 2 }, T.etebar + 1.1 + k * .25));
    tl.fromTo("#hN2", { scale: .8, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, ease: "back.out(1.6)" }, T.reghaba);
  },
};
