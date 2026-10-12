// Neon, 30 s: a shop window at night. Words are glass tubes that flicker on as they are said and stay faintly visible
// (unlit glass) after they switch off; pink, cyan and warm yellow on a dark brick wall. For cafés, bars, late-night food,
// beauty and anything with an evening crowd.
window.STYLES = window.STYLES || {};
window.STYLES.neon = {
  cap: { on: { color: "#FFFFFF", backgroundColor: "rgba(255,46,136,.88)" }, off: { color: "#FFE9F4", backgroundColor: "rgba(10,8,20,.55)" } },
  css: `
  .st-neon .cap-c{font-family:"Fa",sans-serif;font-weight:900;font-size:54px;line-height:1.6;text-shadow:0 0 12px rgba(255,46,136,.7)}
  .st-neon .cap-c span{border-radius:14px;padding:0 14px 4px}
  .ne-wall{position:absolute;inset:-40px;background:
    repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 3px,transparent 3px 90px),
    repeating-linear-gradient(90deg,rgba(255,255,255,.03) 0 3px,transparent 3px 180px),
    radial-gradient(120% 80% at 50% 40%,#1A1230 0%,#0B0914 55%,#050409 100%)}
  .ne{position:absolute;left:70px;right:70px;font-family:"Fa",sans-serif;font-weight:900;line-height:1.3;text-align:center;color:#fff}
  .ne-p{--c:#FF2E88}.ne-c{--c:#19E6FF}.ne-y{--c:#FFD84D}.ne-v{--c:#A66BFF}
  .ne.on,.ne-box.on{text-shadow:0 0 4px #fff,0 0 14px var(--c),0 0 34px var(--c),0 0 70px var(--c)}
  .ne.off{color:color-mix(in srgb,var(--c) 22%,#14101f);text-shadow:none}
  .ne-box{position:absolute;left:110px;right:110px;border:9px solid #fff;border-radius:60px;box-shadow:0 0 10px var(--c),0 0 30px var(--c),inset 0 0 22px var(--c),0 0 70px var(--c)}
  .ne-box.off{border-color:color-mix(in srgb,var(--c) 25%,#14101f);box-shadow:none}
  .ne-m{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-weight:700}
  .ne-frame{position:absolute;inset:40px;border:6px solid #fff;border-radius:50px;box-shadow:0 0 12px #FF2E88,0 0 36px #FF2E88,inset 0 0 18px #FF2E88}
  .ne-sign{position:absolute;top:250px;left:0;right:0;text-align:center;font-family:"Fa",sans-serif;font-weight:900;font-size:44px;color:#fff;text-shadow:0 0 6px #fff,0 0 18px #19E6FF,0 0 40px #19E6FF}
  svg.ne-svg{position:absolute;inset:0;width:1080px;height:1920px;overflow:visible}
  svg.ne-svg path{fill:none;stroke:#fff;stroke-width:10;stroke-linecap:round;stroke-linejoin:round}
  .ne-glow-y{filter:drop-shadow(0 0 8px #FFD84D) drop-shadow(0 0 22px #FFD84D)} .ne-glow-c{filter:drop-shadow(0 0 8px #19E6FF) drop-shadow(0 0 24px #19E6FF)}
  .ne-tag{display:inline-block;margin:12px 10px;padding:8px 26px;border:5px solid #fff;border-radius:999px;font-family:ui-monospace,Menlo,monospace;font-weight:700;font-size:40px;color:#fff;--c:#A66BFF;
    box-shadow:0 0 8px var(--c),0 0 20px var(--c),inset 0 0 10px var(--c);text-shadow:0 0 10px var(--c)}
  `,
  html: `
  <div class="sc" id="nF"><div class="ne-frame"></div><div class="ne-sign fa">${BRAND.nameFa}</div></div>

  <div class="sc" id="nB1"><div class="ne-wall"></div>
    <div class="ne ne-p fa off" id="nB1a" style="top:300px;font-size:190px">قبل از</div>
    <div class="ne ne-c fa off" id="nB1b" style="top:540px;font-size:170px">سفارشش،</div>
    <svg class="ne-svg ne-glow-y"><path id="nArrow" d="M540 820 C 560 900, 520 980, 540 1060 M470 990 L540 1065 L610 990"/></svg>
    <div class="ne ne-y fa off" id="nB1c" style="top:1130px;font-size:150px">این منو رو ببین.</div></div>

  <div class="sc" id="nB2"><div class="ne-wall"></div>
    ${[["قیمت", "هر کیلو چنده؟", "ne-p"], ["طعم‌ها", "کدوما رو داریم؟", "ne-c"], ["اندازه", "برای چند نفر؟", "ne-y"], ["تحویل", "کِی و کجا؟", "ne-v"]].map(([w, s, c], i) => `
    <div class="abs" id="nQ${i}" style="inset:0;opacity:0">
      <div class="ne-box ${c} off" id="nQb${i}" style="top:560px;height:640px"></div>
      <div class="ne ${c} fa off" id="nQw${i}" style="top:660px;font-size:200px">${w}</div>
      <div class="ne ${c} fa off" id="nQs${i}" style="top:960px;font-size:70px">${s}</div>
      <div class="ne ne-y off" id="nQn${i}" style="top:330px;font-size:120px">${["۰۱", "۰۲", "۰۳", "۰۴"][i]}</div></div>`).join("")}</div>

  <div class="sc" id="nB3"><div class="ne-wall"></div>
    <div class="ne ne-y fa off" id="nB3a" style="top:270px;font-size:72px">یه منو، دقیقاً واسه همین ساخته شده</div>
    <div class="ne-box ne-c off" id="nB3b" style="top:560px;height:520px"></div>
    <div class="ne ne-c ne-m ltr off" id="nB3n" style="top:640px;font-size:76px">sweet-corner</div>
    <div class="ne ne-c ne-m ltr off" id="nB3o" style="top:760px;font-size:76px">-bakery</div>
    <div class="ne ne-p ltr off" id="nB3s" style="top:880px;font-size:110px">★ <span id="nStar">0</span></div>
    <div class="ne ne-p ne-m ltr off" id="nB3t" style="top:1240px;font-size:66px">OPEN · FRESH · HANDMADE</div></div>

  <div class="sc" id="nB4"><div class="ne-wall"></div>
    <div class="ne ne-y fa off" id="nB4k" style="top:330px;font-size:70px">شیرینی‌فروشی نمونه</div>
    <div class="ne ne-p ltr off" id="nB4f" style="top:560px;font-size:240px;line-height:1">SWEET</div>
    <div class="ne ne-c ltr off" id="nB4s" style="top:840px;font-size:230px;line-height:1">CORNER</div></div>

  <div class="sc" id="nB5"><div class="ne-wall"></div>
    <div class="ne ne-c fa off" id="nB5a" style="top:250px;font-size:64px">یه منوی ساده با</div>
    <div class="ne ne-y off" id="nN13" style="top:330px;font-size:250px;line-height:1.1">۰</div>
    <div class="ltr" id="nTags" style="position:absolute;left:60px;right:60px;top:680px;text-align:center">${["chocolate", "vanilla", "carrot-cake", "red-velvet", "cheesecake", "tiramisu", "lemon-tart", "pistachio",
      "saffron-rose", "coffee-walnut", "strawberry", "caramel", "date-cake"].map((s, i) => `<span class="ne-tag" style="--c:${["#A66BFF", "#FF2E88", "#19E6FF"][i % 3]};opacity:0">${s}</span>`).join("")}</div>
    <div class="ne ne-p fa off" id="nB5b" style="top:1370px;font-size:90px">طعم واسه هر جشن</div></div>

  <div class="sc" id="nB6"><div class="ne-wall"></div>
    <div class="ne ne-p fa off" id="nC1" style="top:320px;font-size:190px">سفارش</div>
    <div class="ne ne-p ne-m ltr off" id="nC1m" style="top:600px;font-size:50px">/order</div>
    <svg class="ne-svg ne-glow-c"><path id="nWire" d="M540 700 C 380 800, 700 900, 540 1000 S 380 1150, 540 1230 M470 1160 L540 1235 L610 1160"/></svg>
    <div class="ne ne-y fa off" id="nC2" style="top:1270px;font-size:200px">تحویل</div>
    <div class="ne ne-y ne-m ltr off" id="nC2m" style="top:1560px;font-size:50px">/deliver</div></div>`,
  build(H) {
    const { tl, T, count, scene, drift, q } = H;
    // a tube strikes: two short flickers, then on. Plain tl.set of colours and shadows, so seeking to any frame is exact.
    const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const dimOf = (c) => { const a = hex(c), b = hex("#14101F"); return "rgb(" + a.map((v, i) => Math.round(v * .24 + b[i] * .76)).join(",") + ")"; };
    const colOf = (n) => getComputedStyle(n).getPropertyValue("--c").trim() || "#FF2E88";
    const state = (n, on) => { const c = colOf(n), box = n.classList.contains("ne-box");
      return box ? (on ? { borderColor: "#FFFFFF", boxShadow: `0 0 10px ${c},0 0 30px ${c},inset 0 0 22px ${c},0 0 70px ${c}` } : { borderColor: dimOf(c), boxShadow: "0 0 0 rgba(0,0,0,0)" })
        : (on ? { color: "#FFFFFF", textShadow: `0 0 4px #fff,0 0 14px ${c},0 0 34px ${c},0 0 70px ${c}` } : { color: dimOf(c), textShadow: "0 0 0 rgba(0,0,0,0)" }); };
    const each = (el, f) => document.querySelectorAll(el).forEach(f);
    each(".ne.off, .ne-box.off", (n) => { gsap.set(n, state(n, false)); n.classList.remove("off"); });
    const lite = (el, t) => each(el, (n) => [[0, 1], [.05, 0], [.1, 1], [.16, 0], [.24, 1]].forEach(([d, on]) => tl.set(n, state(n, !!on), t + d)));
    const dark = (el, t) => each(el, (n) => tl.set(n, state(n, false), t));
    const reset = () => {};
    const draw = (el, t, d) => { const p = q(el), L = p.getTotalLength(); tl.set(p, { opacity: 0 }, 0); tl.set(p, { opacity: 1 }, t); tl.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: d, ease: "power1.inOut" }, t); };
    const buzz = (el, t0, t1) => { for (let t = t0 + .9; t < t1 - .3; t += 1.7) { tl.to(el, { opacity: .55, duration: .03 }, t); tl.to(el, { opacity: 1, duration: .03 }, t + .06); } };
    const cut = (el, t) => tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: .12, ease: "none" }, t);
    // lit glass hums and the camera floats, so no hold is ever still
    [["#nB1", T.qabl, T.ya], ["#nB2", T.gheymat, T.in2], ["#nB3", T.repo, T.in3], ["#nB4", 20.55, T.ye], ["#nB5", T.ye, T.az], ["#nB6", T.az, 30]]
      .forEach(([el, a, b]) => { H.hum(el, a, b, { a: 1.22, per: .45 }); });
    [[0, T.qabl + .15], [T.ya - .15, T.gheymat + .15], [T.in2 - .15, T.repo + .15], [T.in3 - .15, 20.65]].forEach(([a, b]) => scene("#nF", a, b));
    tl.fromTo(".ne-frame", { opacity: .2 }, { opacity: 1, duration: .25, ease: "steps(3)" }, .05);

    scene("#nB1", T.qabl - .12, T.ya + .1); cut("#nB1", T.qabl - .12); reset("#nB1", T.qabl - .12);
    lite("#nB1a", T.qabl); lite("#nB1b", T.sakhtan); draw("#nArrow", T.hatman, .6); lite("#nB1c", T.abzar);
    H.camera("#nB1", T.qabl, T.ya);

    scene("#nB2", T.gheymat - .12, T.in2 + .1); cut("#nB2", T.gheymat - .12); reset("#nB2", T.gheymat - .12);
    [T.gheymat, T.reghabat, T.mvp, T.bazar].forEach((t, i) => {
      tl.set("#nQ" + i, { opacity: 1 }, t - .05);
      lite(`#nQb${i}, #nQw${i}, #nQn${i}`, t); lite("#nQs" + i, t + .35);
      if (i) { dark(`#nQb${i - 1}, #nQw${i - 1}, #nQn${i - 1}, #nQs${i - 1}`, t - .05); tl.set("#nQ" + (i - 1), { opacity: 0 }, t - .05); }
    });
    buzz("#nQw3", T.bazar, T.in2);

    scene("#nB3", T.repo - .12, T.in3 + .1); cut("#nB3", T.repo - .12); reset("#nB3", T.repo - .12);
    lite("#nB3a", T.repo); lite("#nB3b", T.repo + .3); lite("#nB3n", T.repo + .45); lite("#nB3o", T.repo + .65);
    lite("#nB3s", T.sakhte - .4); count("#nStar", T.sakhte - .4, 1.0, 0, 502, (v) => String(v)); lite("#nB3t", T.sakhte + .2);

    scene("#nB4", 20.55, T.ye + .1); cut("#nB4", 20.55); reset("#nB4", 20.55);
    lite("#nB4k", 20.6); lite("#nB4f", T.founder); lite("#nB4s", T.skills); buzz("#nB4f", T.skills, T.ye);
    H.camera("#nB4", 20.55, T.ye);

    scene("#nB5", T.ye - .12, T.az + .1); cut("#nB5", T.ye - .12); reset("#nB5", T.ye - .12);
    lite("#nB5a", T.ye); lite("#nN13", 22.6); count("#nN13", 22.6, 1.75, 0, 13);
    q("#nTags").querySelectorAll(".ne-tag").forEach((n, i) => tl.fromTo(n, { opacity: 0 }, { opacity: 1, duration: .2, ease: "steps(3)" }, 22.6 + i * .13));
    lite("#nB5b", T.eskil2 - .1);

    scene("#nB6", T.az - .12, 30); cut("#nB6", T.az - .12); reset("#nB6", T.az - .12);
    lite("#nC1, #nC1m", T.az - .05); H.camera("#nB6", T.az, 30); H.camera("#nB2", T.gheymat, T.in2); H.camera("#nB3", T.repo, T.in3); H.camera("#nB5", T.ye, T.az); draw("#nWire", T.etebar + .6, 1.8); lite("#nC2", T.reghaba); lite("#nC2m", T.reghaba + .25);
    buzz("#nC2", T.reghaba, 30);
  },
};
