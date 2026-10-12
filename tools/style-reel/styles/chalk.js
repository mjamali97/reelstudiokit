// Chalk, 30 s: the menu board behind the counter. Dark green slate with chalk dust, letters that write themselves in
// rough white and coloured chalk, hand-drawn frames, underlines and arrows, a smudge wipe between boards. Cafés,
// restaurants, bakeries, schools and tutors, anything with a "today's special" board.
window.STYLES = window.STYLES || {};
window.STYLES.chalk = {
  cap: { on: { color: "#1F3A2E", backgroundColor: "#F6E27A" }, off: { color: "#F4F1E8", backgroundColor: "rgba(20,38,30,.78)" } },
  css: `
  .st-chalk .cap-c{font-family:"Lalezar","Fa",sans-serif;font-size:60px;line-height:1.6}
  .st-chalk .cap-c span{border-radius:10px 22px 12px 26px;padding:0 16px 4px}
  .ch-board{position:absolute;inset:-30px;background:
    radial-gradient(60% 40% at 30% 25%,rgba(255,255,255,.07),transparent 70%),
    radial-gradient(50% 35% at 70% 75%,rgba(255,255,255,.06),transparent 70%),
    repeating-linear-gradient(105deg,rgba(255,255,255,.018) 0 2px,transparent 2px 9px),
    #213D30}
  .ch-wood{position:absolute;inset:0;box-shadow:inset 0 0 0 34px #8A5A34,inset 0 0 0 40px #5E3A1F,inset 0 0 80px 40px rgba(0,0,0,.45)}
  .ch{position:absolute;left:100px;right:100px;text-align:center;font-family:"Lalezar","Fa",sans-serif;color:#F4F1E8;line-height:1.25;filter:url(#chalkF);opacity:.95}
  .ch-y{color:#F6E27A}.ch-p{color:#F7A8B8}.ch-b{color:#9AD7F0}.ch-g{color:#BDE6A1}
  .ch-hand{font-family:"Markazi","Fa",serif;font-weight:700}
  svg.ch-svg{position:absolute;inset:0;width:1080px;height:1920px;overflow:visible;filter:url(#chalkF)}
  svg.ch-svg path{fill:none;stroke:#F4F1E8;stroke-width:9;stroke-linecap:round;stroke-linejoin:round;opacity:.9}
  .ch-frame{position:absolute;inset:0;box-shadow:inset 0 0 0 26px #8A5A34,inset 0 0 0 32px #5E3A1F}
  .ch-name{position:absolute;top:240px;left:0;right:0;text-align:center;font-family:"Lalezar","Fa",sans-serif;font-size:48px;color:#F4F1E8;
    text-shadow:0 2px 10px rgba(0,0,0,.6)}
  .ch-row{display:flex;justify-content:space-between;align-items:baseline;font-family:"Lalezar",sans-serif;font-size:52px;color:#F4F1E8;line-height:76px;height:76px;border-bottom:3px dashed rgba(244,241,232,.25)}
  `,
  html: `
  <svg width="0" height="0" style="position:absolute"><filter id="chalkF"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="3" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feComponentTransfer in="n" result="g"><feFuncA type="discrete" tableValues="0 1 1 1 0 1 1"/></feComponentTransfer>
    <feComposite in="d" in2="g" operator="in"/></filter></svg>
  <div class="sc" id="kF"><div class="ch-frame"></div><div class="ch-name fa">${BRAND.nameFa}</div></div>

  <div class="sc" id="kB1"><div class="ch-board"></div><div class="ch-wood"></div>
    <div class="ch fa" id="kB1a" style="top:330px;font-size:190px">قبل از</div>
    <div class="ch fa ch-y" id="kB1b" style="top:580px;font-size:180px">سفارشش،</div>
    <svg class="ch-svg"><path id="kU1" d="M260 830 C 420 810, 640 850, 820 815"/><path id="kA1" d="M540 880 C 520 960, 560 1010, 540 1080 M490 1030 L540 1085 L595 1030"/></svg>
    <div class="ch fa ch-p" id="kB1c" style="top:1110px;font-size:140px">این منو رو ببین.</div></div>

  <div class="sc" id="kB2"><div class="ch-board"></div><div class="ch-wood"></div>
    <div class="ch fa ch-hand" style="top:270px;font-size:66px;opacity:.75">قبل از سفارش بپرس:</div>
    ${[["قیمت", "هر کیلو چنده؟", "ch-y"], ["طعم‌ها", "کدوما رو داریم؟", "ch-p"], ["اندازه", "برای چند نفر؟", "ch-b"], ["تحویل", "کِی و کجا؟", "ch-g"]].map(([w, s, c], i) => `
    <div class="abs" id="kQ${i}" style="inset:0;opacity:0">
      <div class="ch fa ${c}" style="top:560px;font-size:240px">${w}</div>
      <div class="ch fa ch-hand" style="top:900px;font-size:90px">${s}</div>
      <div class="ch" style="top:400px;font-size:110px;opacity:.6">${["۱.", "۲.", "۳.", "۴."][i]}</div></div>`).join("")}
    <svg class="ch-svg"><path id="kCirc" d="M540 560 C 860 560, 900 880, 540 890 C 180 900, 170 580, 520 555"/></svg></div>

  <div class="sc" id="kB3"><div class="ch-board"></div><div class="ch-wood"></div>
    <div class="ch fa" id="kB3a" style="top:270px;font-size:70px">یه منو، دقیقاً واسه همین ساخته شده</div>
    <svg class="ch-svg"><path id="kBox" d="M160 520 L930 505 L940 1380 L150 1395 Z"/><path id="kStarP" d="M540 1040 L568 1110 L640 1112 L582 1156 L604 1226 L540 1186 L476 1226 L498 1156 L440 1112 L512 1110 Z"/></svg>
    <img src="assets/icons/icon-cake.svg" id="kIcon" style="position:absolute;left:420px;top:560px;width:240px;height:240px;filter:invert(1) url(#chalkF);opacity:.9">
    <div class="ch ch-y ltr" id="kB3n" style="top:830px;font-size:80px">sweet corner</div>
    <div class="ch ltr" id="kB3s" style="top:1250px;font-size:84px"><span id="kStar">0</span> reviews</div>
    <div class="ch fa ch-hand ch-g" id="kB3t" style="top:1420px;font-size:58px">تازه · دست‌ساز · هر روز صبح</div></div>

  <div class="sc" id="kB4"><div class="ch-board"></div><div class="ch-wood"></div>
    <div class="ch fa ch-hand" id="kB4k" style="top:330px;font-size:84px">شیرینی‌فروشی نمونه</div>
    <div class="ch ltr ch-p" id="kB4f" style="top:520px;font-size:250px;line-height:1">Sweet</div>
    <div class="ch ltr ch-b" id="kB4s" style="top:800px;font-size:250px;line-height:1">Corner</div>
    <svg class="ch-svg"><path id="kU4" d="M220 1110 C 400 1080, 700 1130, 860 1090 M250 1150 C 450 1125, 650 1160, 830 1135"/></svg></div>

  <div class="sc" id="kB5"><div class="ch-board"></div><div class="ch-wood"></div>
    <div class="ch fa" id="kB5a" style="top:250px;font-size:70px">یه منوی ساده با <span class="ch-y" id="kN13" style="font-size:110px">۰</span> طعم</div>
    <div class="abs ltr" style="left:150px;right:150px;top:450px;height:990px;overflow:hidden"><div class="abs" id="kList" style="left:0;right:0;top:0">${["chocolate", "vanilla", "carrot cake", "red velvet", "cheesecake", "tiramisu", "lemon tart", "pistachio",
      "saffron rose", "coffee walnut", "strawberry", "caramel", "date cake"].map((s, i) => `<div class="ch-row" id="kL${i}"><span>${s}</span><span style="color:#F6E27A">${["12", "11", "14", "15", "16", "15", "13", "17", "18", "15", "13", "14", "13"][i]}</span></div>`).join("")}</div></div>
    <div class="ch fa ch-p" id="kB5b" style="top:1460px;font-size:96px">طعم واسه هر جشن</div></div>

  <div class="sc" id="kB6"><div class="ch-board"></div><div class="ch-wood"></div>
    <div class="ch fa ch-y" id="kC1" style="top:330px;font-size:200px">سفارش</div>
    <div class="ch ltr" id="kC1m" style="top:600px;font-size:60px;opacity:.75">/order</div>
    <svg class="ch-svg"><path id="kA6" d="M540 700 C 420 820, 680 920, 540 1050 C 470 1110, 520 1140, 540 1160 M480 1105 L540 1165 L600 1105"/></svg>
    <div class="ch fa ch-g" id="kC2" style="top:1190px;font-size:200px">تحویل</div>
    <div class="ch ltr" id="kC2m" style="top:1460px;font-size:60px;opacity:.75">/deliver</div></div>`,
  build(H) {
    const { tl, T, count, scene, drift, q } = H;
    // chalk writes right to left (Persian) or left to right (Latin): a clip that follows the hand
    const write = (el, t, d = .6) => { const ltr = q(el).classList.contains("ltr") || q("#root").classList.contains("dir-ltr");
      tl.fromTo(el, { clipPath: ltr ? "inset(-30% 100% -30% 0%)" : "inset(-30% 0% -30% 100%)" }, { clipPath: "inset(-30% 0% -30% 0%)", duration: d, ease: "power1.inOut" }, t); };
    const draw = (el, t, d) => { const p = q(el), L = p.getTotalLength(); tl.set(p, { opacity: 0 }, 0); tl.set(p, { opacity: 1 }, t); tl.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: d, ease: "power1.inOut" }, t); };
    // board change: an eraser smudge sweeps across
    const wipe = (el, t) => tl.fromTo(el, { clipPath: "polygon(0 0,0 0,-20% 100%,-20% 100%)" }, { clipPath: "polygon(0 0,120% 0,100% 100%,-20% 100%)", duration: .45, ease: "power2.inOut" }, t);
    [[0, T.qabl + .3], [T.ya - .3, T.gheymat + .3], [T.in2 - .3, T.repo + .3], [T.in3 - .3, 20.85]].forEach(([a, b]) => scene("#kF", a, b));
    write(".ch-name", .1, .8);
    // never still: the camera floats over the board
    [["#kB1", T.qabl, T.ya], ["#kB2", T.gheymat, T.in2], ["#kB3", T.repo, T.in3], ["#kB4", 20.45, T.ye], ["#kB5", T.ye, T.az], ["#kB6", T.az, 30]].forEach(([el, a, b]) => H.camera(el, a, b, { amp: 12, per: 1.8 }));

    scene("#kB1", T.qabl - .3, T.ya + .2); wipe("#kB1", T.qabl - .3); 
    write("#kB1a", T.qabl, .5); write("#kB1b", T.sakhtan, .55); draw("#kU1", T.hatman, .5); draw("#kA1", T.hatman + .5, .5); write("#kB1c", T.abzar, .7);

    scene("#kB2", T.gheymat - .3, T.in2 + .2); wipe("#kB2", T.gheymat - .3);
    [T.gheymat, T.reghabat, T.mvp, T.bazar].forEach((t, i) => {
      if (i) tl.set("#kQ" + (i - 1), { opacity: 0 }, t - .05);
      tl.set("#kQ" + i, { opacity: 1 }, t - .05);
      write(`#kQ${i} .ch:nth-child(1)`, t - .05, .45); write(`#kQ${i} .ch:nth-child(2)`, t + .35, .5); write(`#kQ${i} .ch:nth-child(3)`, t - .05, .2);
    });
    draw("#kCirc", T.bazar + .6, .9);

    scene("#kB3", T.repo - .3, T.in3 + .2); wipe("#kB3", T.repo - .3);
    write("#kB3a", T.repo - .1, .6); draw("#kBox", T.repo + .2, 1.0); tl.fromTo("#kIcon", { opacity: 0 }, { opacity: .9, duration: .5 }, T.repo + .5);
    write("#kB3n", T.repo + .7, .5); draw("#kStarP", T.sakhte - .5, .6); write("#kB3s", T.sakhte - .4, .4); count("#kStar", T.sakhte - .4, 1.0, 0, 502, (v) => String(v));
    write("#kB3t", T.sakhte + .2, .6);

    scene("#kB4", 20.45, T.ye + .2); wipe("#kB4", 20.45);
    write("#kB4k", 20.6, .5); write("#kB4f", T.founder, .45); write("#kB4s", T.skills, .5); draw("#kU4", T.skills + .5, .8);

    scene("#kB5", T.ye - .3, T.az + .2); wipe("#kB5", T.ye - .3);
    write("#kB5a", T.ye, .6); count("#kN13", 22.6, 1.75, 0, 13);
    for (let i = 0; i < 13; i++) write("#kL" + i, 22.6 + i * .13, .3);
    tl.fromTo("#kList", { y: 0 }, { y: -(13 * 76 - 960), duration: 2.4, ease: "sine.inOut" }, 23.4);
    write("#kB5b", T.eskil2 - .1, .6);

    scene("#kB6", T.az - .3, 30); wipe("#kB6", T.az - .3);
    write("#kC1", T.az - .05, .55); write("#kC1m", T.etebar, .3); draw("#kA6", T.etebar + .6, 1.5); write("#kC2", T.reghaba - .05, .55); write("#kC2m", T.reghaba + .3, .3);
    
  },
};
