// Pop, 30 s: a comic page. Halftone dots, primary red/yellow/blue, thick ink outlines, speech bubbles and BAM bursts that
// punch in on the beat, panels that slam into a grid. Playful and loud: snacks, toys, games, kids' parties, street food.
window.STYLES = window.STYLES || {};
window.STYLES.pop = {
  cap: { on: { color: "#111111", backgroundColor: "#FFD500" }, off: { color: "#111111", backgroundColor: "#FFFFFF" } },
  css: `
  .st-pop .cap-c{font-family:"Lalezar","Fa",sans-serif;font-size:60px;line-height:1.6}
  .st-pop .cap-c span{border:5px solid #111;border-radius:18px;padding:0 16px 4px;margin:0 3px}
  .pp-dots{position:absolute;inset:-20px;background-image:radial-gradient(rgba(0,0,0,.22) 30%,transparent 32%);background-size:26px 26px}
  .pp-ray{position:absolute;left:-700px;top:-400px;width:2500px;height:2500px;border-radius:50%;background:repeating-conic-gradient(rgba(255,255,255,.35) 0 6deg,transparent 6deg 12deg)}
  .pp{position:absolute;left:60px;right:60px;text-align:center;font-family:"Lalezar","Fa",sans-serif;color:#FFD500;line-height:1.15;
    -webkit-text-stroke:10px #111;paint-order:stroke fill;text-shadow:10px 10px 0 #111}
  .pp-burst{position:absolute;display:grid;place-items:center;text-align:center;font-family:"Lalezar","Fa",sans-serif;color:#111;
    clip-path:polygon(50% 0%,59% 22%,80% 8%,75% 32%,100% 30%,82% 48%,100% 66%,76% 66%,84% 92%,62% 78%,50% 100%,40% 78%,16% 92%,24% 66%,0% 66%,18% 48%,0% 30%,25% 32%,20% 8%,41% 22%)}
  .pp-bub{position:absolute;background:#fff;border:8px solid #111;border-radius:60px;display:grid;place-items:center;text-align:center;font-family:"Lalezar","Fa",sans-serif;color:#111}
  .pp-bub::after{content:"";position:absolute;bottom:-58px;right:160px;border-left:30px solid transparent;border-right:50px solid transparent;border-top:60px solid #111}
  .pp-panel{position:absolute;border:10px solid #111;overflow:hidden}
  .pp-frame{position:absolute;inset:26px;border:14px solid #111;box-shadow:inset 0 0 0 8px #FFD500}
  .pp-name{position:absolute;top:236px;right:70px;background:#E8202A;color:#fff;border:6px solid #111;padding:4px 26px 10px;font-family:"Lalezar","Fa",sans-serif;font-size:44px;transform:rotate(-3deg)}
  .pp-chip{display:inline-block;margin:10px 8px;border:5px solid #111;border-radius:12px;padding:6px 20px 10px;font-family:"Lalezar",sans-serif;font-size:44px;color:#111}
  `,
  html: `
  <div class="sc" id="pF"><div class="pp-frame"></div><div class="pp-name fa">${BRAND.nameFa}</div></div>

  <div class="sc" id="pB1"><div class="abs" style="inset:0;background:#E8202A"></div><div class="pp-ray" id="pRay1"></div><div class="pp-dots"></div>
    <div class="pp fa" id="pB1a" style="top:300px;font-size:220px">قبل از</div>
    <div class="pp fa" id="pB1b" style="top:570px;font-size:190px;color:#fff">سفارشش،</div>
    <div class="pp-bub fa" id="pB1c" style="left:120px;right:120px;top:960px;height:300px;font-size:110px">این منو رو ببین!</div>
    <div class="pp-burst ltr" id="pB1d" style="left:700px;top:1300px;width:300px;height:300px;background:#FFD500;font-size:80px">WOW</div></div>

  <div class="sc" id="pB2"><div class="abs" style="inset:0;background:#FFD500"></div><div class="pp-dots"></div>
    ${[["قیمت", "هر کیلو چنده؟", "#E8202A", [60, 250, 960, 520]], ["طعم‌ها", "کدوما رو داریم؟", "#1E5BD8", [60, 800, 470, 480]], ["اندازه", "برای چند نفر؟", "#21A65A", [550, 800, 470, 480]], ["تحویل", "کِی و کجا؟", "#7A3FD0", [60, 1310, 960, 270]]].map(([w, s, c, [x, y, wd, ht]], i) => `
    <div class="pp-panel" id="pQ${i}" style="left:${x}px;top:${y}px;width:${wd}px;height:${ht}px;background:${c};display:flex;flex-direction:${i === 3 ? "row" : "column"};align-items:center;justify-content:center;gap:${i === 3 ? 40 : 8}px">
      <div class="pp-dots" style="opacity:.6"></div>
      <div class="fa" style="position:relative;font-family:'Lalezar','Fa';font-size:${i === 0 ? 210 : i === 3 ? 150 : 140}px;line-height:1.1;color:#fff;-webkit-text-stroke:8px #111;paint-order:stroke fill;text-shadow:7px 7px 0 #111">${w}</div>
      <div class="fa" style="position:relative;font-family:'Lalezar','Fa';font-size:${i === 3 ? 56 : 52}px;color:#111;background:#fff;border:5px solid #111;padding:0 18px 4px">${s}</div></div>`).join("")}</div>

  <div class="sc" id="pB3"><div class="abs" style="inset:0;background:#1E5BD8"></div><div class="pp-ray" id="pRay3"></div><div class="pp-dots"></div>
    <div class="pp-bub fa" id="pB3a" style="left:90px;right:90px;top:270px;height:230px;font-size:70px;line-height:1.3">یه منو، دقیقاً<br>واسه همین ساخته شده</div>
    <div class="pp-panel" id="pB3p" style="left:120px;right:120px;top:640px;height:620px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">
      <img src="assets/icons/icon-cake.svg" id="pIcon" style="width:200px;height:200px">
      <div class="ltr" style="font-family:'Lalezar';font-size:84px;color:#111">sweet-corner</div>
      <div class="ltr" style="font-family:'Lalezar';font-size:60px;color:#E8202A">bakery</div></div>
    <div class="pp-burst ltr" id="pB3s" style="left:600px;top:1180px;width:400px;height:400px;background:#FFD500;font-size:84px">★ <span id="pStar">0</span></div></div>

  <div class="sc" id="pB4"><div class="abs" style="inset:0;background:#FFD500"></div><div class="pp-ray" id="pRay4"></div><div class="pp-dots"></div>
    <div class="pp fa" id="pB4k" style="top:300px;font-size:84px;color:#fff">شیرینی‌فروشی نمونه</div>
    <div class="pp ltr" id="pB4f" style="top:480px;font-size:250px;color:#E8202A;transform:rotate(-4deg)">SWEET</div>
    <div class="pp ltr" id="pB4s" style="top:780px;font-size:230px;color:#1E5BD8;transform:rotate(3deg)">CORNER!</div>
    <div class="pp-burst ltr" id="pB4b" style="left:80px;top:1150px;width:360px;height:360px;background:#E8202A;color:#fff;font-size:90px">BAM!</div></div>

  <div class="sc" id="pB5"><div class="abs" style="inset:0;background:#21A65A"></div><div class="pp-dots"></div>
    <div class="pp fa" id="pB5a" style="top:250px;font-size:80px;color:#fff">یه منوی ساده با</div>
    <div class="pp-burst" id="pN" style="left:330px;top:380px;width:420px;height:420px;background:#FFD500"><div id="pN13" style="font-size:200px;line-height:1">۰</div></div>
    <div class="ltr" id="pChips" style="position:absolute;left:40px;right:40px;top:830px;text-align:center">${["chocolate", "vanilla", "carrot-cake", "red-velvet", "cheesecake", "tiramisu", "lemon-tart", "pistachio",
      "saffron-rose", "coffee-walnut", "strawberry", "caramel", "date-cake"].map((s, i) => `<span class="pp-chip" style="background:${["#FFD500", "#fff", "#E8202A", "#7EC8FF"][i % 4]}">${s}</span>`).join("")}</div>
    <div class="pp fa" id="pB5b" style="top:1400px;font-size:110px">طعم واسه هر جشن</div></div>

  <div class="sc" id="pB6"><div class="abs" style="inset:0;background:#fff"></div><div class="pp-dots" style="opacity:.5"></div>
    <div class="pp-panel" id="pS1" style="left:60px;right:60px;top:280px;height:560px;background:#E8202A;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div class="pp-dots" style="opacity:.5"></div>
      <div class="fa" style="position:relative;font-family:'Lalezar','Fa';font-size:190px;line-height:1.1;color:#FFD500;-webkit-text-stroke:9px #111;paint-order:stroke fill;text-shadow:8px 8px 0 #111">سفارش</div>
      <div class="ltr" style="position:relative;font-family:'Lalezar';font-size:56px;color:#fff">/order</div></div>
    <div class="pp-panel" id="pS2" style="left:60px;right:60px;top:880px;height:560px;background:#1E5BD8;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div class="pp-dots" style="opacity:.5"></div>
      <div class="fa" style="position:relative;font-family:'Lalezar','Fa';font-size:190px;line-height:1.1;color:#fff;-webkit-text-stroke:9px #111;paint-order:stroke fill;text-shadow:8px 8px 0 #111">تحویل</div>
      <div class="ltr" style="position:relative;font-family:'Lalezar';font-size:56px;color:#FFD500">/deliver</div></div>
    <div class="pp-burst ltr" id="pZip" style="left:640px;top:700px;width:340px;height:340px;background:#FFD500;font-size:84px">ZIP!</div></div>`,
  build(H) {
    const { tl, T, count, scene, drift, q } = H;
    const punch = (el, t, r = 0) => tl.fromTo(el, { scale: 2.4, opacity: 0, rotation: r - 20 }, { scale: 1, opacity: 1, rotation: r, duration: .22, ease: "back.out(3)" }, t);
    const slam = (el, t, from) => tl.fromTo(el, { [from[0]]: from[1] }, { [from[0]]: 0, duration: .26, ease: "power4.out" }, t);
    const shake = (el, t) => tl.fromTo(el, { x: -14 }, { x: 0, duration: .3, ease: "elastic.out(1.5,.2)" }, t);
    const spin = (el, t0, t1) => tl.fromTo(el, { rotation: 0 }, { rotation: 36, duration: t1 - t0, ease: "none" }, t0);
    const cut = (el, t) => tl.fromTo(el, { clipPath: "polygon(0 0,0 0,0 100%,0 100%)" }, { clipPath: "polygon(0 0,120% 0,100% 100%,0 100%)", duration: .25, ease: "power3.out" }, t);
    [[0, T.qabl + .15], [T.ya - .15, T.gheymat + .15], [T.in2 - .15, T.repo + .15], [T.in3 - .15, 20.7]].forEach(([a, b]) => scene("#pF", a, b));
    punch(".pp-name", .1, -3);
    // never still: the camera floats and the halftone dots slide
    [["#pB1", T.qabl, T.ya], ["#pB2", T.gheymat, T.in2], ["#pB3", T.repo, T.in3], ["#pB4", 20.55, T.ye], ["#pB5", T.ye, T.az], ["#pB6", T.az, 30]].forEach(([el, a, b]) => {
      H.camera(el, a, b, { amp: 12, per: 1.4 }); tl.fromTo(el + " > .pp-dots", { backgroundPosition: "0px 0px" }, { backgroundPosition: "104px 208px", duration: b - a, ease: "none" }, a); });

    scene("#pB1", T.qabl - .15, T.ya + .1); cut("#pB1", T.qabl - .15); spin("#pRay1", T.qabl, T.ya);
    punch("#pB1a", T.qabl); punch("#pB1b", T.sakhtan, 2); shake("#pB1", T.sakhtan);
    tl.fromTo("#pB1c", { scale: 0, transformOrigin: "75% 100%" }, { scale: 1, duration: .3, ease: "back.out(2.5)" }, T.abzar);
    punch("#pB1d", T.bebini, 12); tl.to("#pB1d", { scale: 1.12, duration: .15, yoyo: true, repeat: 3 }, T.bebini + .3);

    scene("#pB2", T.gheymat - .15, T.in2 + .1); cut("#pB2", T.gheymat - .15);
    const from = [["y", -700], ["x", -600], ["x", 600], ["y", 500]];
    [T.gheymat, T.reghabat, T.mvp, T.bazar].forEach((t, i) => { tl.set("#pQ" + i, { opacity: 0 }, 0); tl.set("#pQ" + i, { opacity: 1 }, t - .05); slam("#pQ" + i, t - .05, from[i]); shake("#pB2", t + .2); });

    scene("#pB3", T.repo - .15, T.in3 + .1); cut("#pB3", T.repo - .15); spin("#pRay3", T.repo, T.in3);
    tl.fromTo("#pB3a", { scale: 0, transformOrigin: "75% 100%" }, { scale: 1, duration: .3, ease: "back.out(2.5)" }, T.repo);
    tl.fromTo("#pB3p", { y: 900 }, { y: 0, duration: .35, ease: "power4.out" }, T.repo + .25);
    tl.fromTo("#pIcon", { rotation: -30 }, { rotation: 0, duration: .6, ease: "elastic.out(1,.4)" }, T.repo + .5);
    punch("#pB3s", T.sakhte - .4, 8); count("#pStar", T.sakhte - .4, 1.0, 0, 502, (v) => String(v));

    scene("#pB4", 20.55, T.ye + .1); cut("#pB4", 20.55); spin("#pRay4", 20.55, T.ye);
    punch("#pB4k", 20.6); punch("#pB4f", T.founder, -4); punch("#pB4s", T.skills, 3); shake("#pB4", T.skills); punch("#pB4b", T.skills + .35, -10);

    scene("#pB5", T.ye - .15, T.az + .1); cut("#pB5", T.ye - .15);
    punch("#pB5a", T.ye); punch("#pN", 22.5, 0); count("#pN13", 22.6, 1.75, 0, 13);
    tl.to("#pN", { rotation: 20, duration: 4, ease: "none" }, 23);
    q("#pChips").querySelectorAll(".pp-chip").forEach((n, i) => punch(n, 22.6 + i * .13, (i % 3) - 1));
    punch("#pB5b", T.eskil2 - .1);

    scene("#pB6", T.az - .15, 30); cut("#pB6", T.az - .15);
    tl.set("#pS2", { opacity: 0 }, 0); slam("#pS1", T.az - .05, ["x", -1100]);
    punch("#pZip", T.etebar + 1.6, 10); tl.set("#pS2", { opacity: 1 }, T.reghaba - .05); slam("#pS2", T.reghaba - .05, ["x", 1100]); shake("#pB6", T.reghaba + .2);
  },
};
