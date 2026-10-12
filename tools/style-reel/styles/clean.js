// Clean, 30 s: the brand's own colours (brand.json → BRAND.colors), lots of air, rounded cards that stack and slide like an
// app. Nothing shouts; one accent carries the eye. The style that looks like *their* brand rather than a genre.
window.STYLES = window.STYLES || {};
(() => {
  const C = Object.assign({ bg: "#FFF8F1", ink: "#2B1D16", accent: "#E4572E", muted: "#8A7A70", surface: "#FFFFFF", accent2: "#F2C14E" }, (window.BRAND && BRAND.colors) || {});
  window.STYLES.clean = {
    cap: { on: { color: "#FFFFFF", backgroundColor: C.accent }, off: { color: C.ink, backgroundColor: "rgba(255,255,255,.94)" } },
    css: `
  .st-clean .cap-c{font-family:"Fa",sans-serif;font-weight:700;font-size:54px;line-height:1.6}
  .st-clean .cap-c span{border-radius:18px;padding:2px 16px 6px;box-shadow:0 10px 24px rgba(0,0,0,.16)}
  .cl-bg{position:absolute;inset:0;background:${C.bg}}
  .cl-t{position:absolute;left:90px;right:90px;font-family:"Fa",sans-serif;color:${C.ink};line-height:1.35}
  .cl-m{color:${C.muted}} .cl-a{color:${C.accent}}
  .cl-card{position:absolute;left:90px;right:90px;background:${C.surface};border-radius:48px;box-shadow:0 30px 80px rgba(0,0,0,.12),0 2px 0 rgba(0,0,0,.04)}
  .cl-chip{display:inline-block;background:${C.accent};color:#fff;border-radius:999px;padding:8px 30px 12px;font-family:"Fa",sans-serif;font-weight:700;font-size:40px}
  .cl-pill{display:inline-block;border:3px solid ${C.ink}22;background:${C.surface};color:${C.ink};border-radius:999px;padding:12px 30px;margin:12px;font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:46px;font-weight:600}
  .cl-line{position:absolute;height:10px;border-radius:5px;background:${C.accent};transform-origin:100% 50%}
  .cl-dot{position:absolute;border-radius:50%;background:${C.accent}}
  .cl-frame{position:absolute;inset:36px;border-radius:56px;box-shadow:0 0 0 3px rgba(255,255,255,.7)}
  .cl-tag{position:absolute;top:250px;right:90px;background:rgba(255,255,255,.92);color:${C.ink};border-radius:999px;padding:10px 28px 14px;font-family:"Fa",sans-serif;font-weight:700;font-size:36px}
  `,
    html: `
  <div class="sc" id="cF"><div class="cl-frame"></div><div class="cl-tag fa">${BRAND.nameFa}</div></div>

  <div class="sc" id="cB1"><div class="cl-bg"></div>
    <div class="cl-dot" id="cB1d" style="width:900px;height:900px;left:-380px;top:-300px;opacity:.10"></div>
    <div class="cl-t fa" id="cB1a" style="top:330px;font-size:150px;font-weight:900">قبل از</div>
    <div class="cl-t fa" id="cB1b" style="top:540px;font-size:150px;font-weight:900">سفارشش،</div>
    <div class="cl-line" id="cB1l" style="right:90px;width:520px;top:770px"></div>
    <div class="cl-card" id="cB1c" style="top:960px;height:420px;display:flex;align-items:center;justify-content:center">
      <div class="fa" style="font-family:'Fa';font-weight:900;font-size:120px;color:${C.ink}">این منو <span style="color:${C.accent}">رو ببین.</span></div></div></div>

  <div class="sc" id="cB2"><div class="cl-bg"></div>
    <div class="cl-t fa cl-m" style="top:260px;font-size:46px;font-weight:700">چهار سؤال قبل از سفارش</div>
    ${[["قیمت", "هر کیلو چنده؟"], ["طعم‌ها", "کدوما رو داریم؟"], ["اندازه", "برای چند نفر؟"], ["تحویل", "کِی و کجا؟"]].map(([w, s], i) => `
    <div class="cl-card" id="cQ${i}" style="top:520px;height:760px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px">
      <span class="cl-chip">${["۰۱", "۰۲", "۰۳", "۰۴"][i]}</span>
      <div class="fa" style="font-family:'Fa';font-weight:900;font-size:180px;line-height:1.2;color:${C.ink}">${w}</div>
      <div class="fa" style="font-family:'Fa';font-weight:700;font-size:62px;color:${C.muted}">${s}</div></div>`).join("")}</div>

  <div class="sc" id="cB3"><div class="cl-bg"></div>
    <div class="cl-t fa" id="cB3a" style="top:260px;font-size:66px;font-weight:900;text-align:center">یه منو، دقیقاً واسه همین</div>
    <div class="cl-card" id="cB3c" style="top:470px;height:980px;overflow:hidden">
      <div style="position:absolute;left:0;right:0;top:0;height:520px;background:linear-gradient(135deg,${C.accent2},${C.accent});display:grid;place-items:center">
        <img src="assets/icons/icon-cake.svg" style="width:260px;height:260px;filter:brightness(0) invert(1)" id="cIcon"></div>
      <div class="ltr" style="position:absolute;left:60px;top:570px;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-weight:700;font-size:58px;color:${C.ink}">sweet-corner-bakery</div>
      <div class="ltr" id="cB3s" style="position:absolute;left:60px;top:670px;font-family:'Fa';font-weight:900;font-size:90px;color:${C.accent}">★ <span id="cStar">0</span></div>
      <div class="fa" id="cB3t" style="position:absolute;right:60px;top:820px;font-family:'Fa';font-weight:700;font-size:48px;color:${C.muted}">تازه · دست‌ساز · هر روز صبح</div></div></div>

  <div class="sc" id="cB4"><div class="cl-bg"></div>
    <div class="cl-dot" id="cB4d" style="width:700px;height:700px;left:190px;top:470px"></div>
    <div class="cl-t fa" id="cB4k" style="top:300px;font-size:64px;font-weight:700;text-align:center">شیرینی‌فروشی نمونه</div>
    <div class="cl-t ltr" id="cB4f" style="top:640px;font-size:190px;font-weight:900;text-align:center;color:#fff;line-height:1">Sweet</div>
    <div class="cl-t ltr" id="cB4s" style="top:840px;font-size:190px;font-weight:900;text-align:center;color:#fff;line-height:1">Corner</div></div>

  <div class="sc" id="cB5"><div class="cl-bg"></div>
    <div class="cl-t fa" id="cB5a" style="top:260px;font-size:60px;font-weight:700">یه منوی ساده با</div>
    <div class="cl-t" id="cN13" style="top:330px;font-size:260px;font-weight:900;color:${C.accent};line-height:1.15">۰</div>
    <div class="ltr" id="cPills" style="position:absolute;left:70px;right:70px;top:700px;text-align:center">${SKILL_PILLS()}</div>
    <div class="cl-t fa" id="cB5b" style="top:1360px;font-size:84px;font-weight:900;text-align:center">طعم واسه هر جشن</div></div>

  <div class="sc" id="cB6"><div class="cl-bg"></div>
    <div class="abs" id="cTrack" style="left:530px;top:640px;width:20px;height:560px;border-radius:10px;background:${C.ink}18"></div>
    <div class="abs" id="cFill" style="left:530px;top:640px;width:20px;height:560px;border-radius:10px;background:${C.accent};transform-origin:50% 0%"></div>
    <div class="cl-dot" id="cRide" style="width:70px;height:70px;left:505px;top:610px;box-shadow:0 0 0 14px ${C.accent}33"></div>
    <div class="cl-card" id="cS1" style="top:330px;height:300px;display:flex;align-items:center;justify-content:space-between;padding:0 70px">
      <div class="fa" style="font-family:'Fa';font-weight:900;font-size:110px;color:${C.ink}">سفارش</div>
      <div class="ltr" style="font-family:ui-monospace,Menlo,monospace;font-size:44px;color:${C.muted}">/order</div></div>
    <div class="cl-card" id="cS2" style="top:1200px;height:300px;display:flex;align-items:center;justify-content:space-between;padding:0 70px">
      <div class="fa" style="font-family:'Fa';font-weight:900;font-size:110px;color:${C.ink}">تحویل</div>
      <div class="ltr" style="font-family:ui-monospace,Menlo,monospace;font-size:44px;color:${C.muted}">/deliver</div></div>
    <div class="cl-dot" id="cDone" style="width:150px;height:150px;left:465px;top:1010px;display:grid;place-items:center;color:#fff;font:900 90px/1 system-ui">✓</div></div>`,
    build(H) {
      const { tl, T, count, scene, drift, SKILLS, q } = H;
      // soft app-like motion: slide in from the side, settle, no bounce
      const up = (el, t, o = {}) => tl.fromTo(el, { y: o.y ?? 60, opacity: 0 }, { y: 0, opacity: 1, duration: o.d ?? .55, ease: "power3.out", stagger: o.st ?? 0 }, t);
      const slideIn = (el, t) => tl.fromTo(el, { xPercent: -100 }, { xPercent: 0, duration: .5, ease: "power3.inOut" }, t);
      const faceOn = [[0, T.qabl + .25], [T.ya - .25, T.gheymat + .25], [T.in2 - .25, T.repo + .25], [T.in3 - .25, 20.8]];
      faceOn.forEach(([a, b]) => scene("#cF", a, b));
      tl.fromTo(".cl-tag", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: "power3.out" }, .1);

      // every hold keeps moving (QA "frozen"): a slow push-in on each whole scene
      [["#cB1", T.qabl, T.ya], ["#cB2", T.gheymat, T.in2], ["#cB3", T.repo, T.in3], ["#cB4", 20.45, T.ye], ["#cB5", T.ye, T.az], ["#cB6", T.az, 30]]
        .forEach(([el, a, b]) => H.camera(el, a, b));
      // B1
      scene("#cB1", T.qabl - .25, T.ya + .25); slideIn("#cB1", T.qabl - .25);
      drift("#cB1d", T.qabl, T.ya, { scale: 1, x: 0 }, { scale: 1.15, x: 60 });
      up("#cB1a", T.qabl); up("#cB1b", T.sakhtan);
      tl.fromTo("#cB1l", { scaleX: 0 }, { scaleX: 1, duration: .6, ease: "power3.out" }, T.hatman);
      tl.fromTo("#cB1c", { y: 200, opacity: 0, scale: .96 }, { y: 0, opacity: 1, scale: 1, duration: .6, ease: "power3.out" }, T.abzar);

      // B2: cards stack; the previous one shrinks back as the next slides up
      scene("#cB2", T.gheymat - .25, T.in2 + .25); slideIn("#cB2", T.gheymat - .25);
      [T.gheymat, T.reghabat, T.mvp, T.bazar].forEach((t, i) => {
        tl.set("#cQ" + i, { opacity: 0 }, 0);
        tl.fromTo("#cQ" + i, { y: 900, opacity: 1, rotation: i % 2 ? 2 : -2, scale: 1 }, { y: 0, opacity: 1, rotation: 0, scale: 1, duration: .55, ease: "power3.out" }, t - .1);
        if (i) tl.to("#cQ" + (i - 1), { scale: .9, y: -70, opacity: .5, duration: .55, ease: "power3.out" }, t - .1);
        if (i > 1) tl.to("#cQ" + (i - 2), { opacity: 0, duration: .3 }, t - .1);
      });
      drift("#cQ3", T.bazar + .5, T.in2, { scale: 1 }, { scale: 1.03 });

      // B3
      scene("#cB3", T.repo - .25, T.in3 + .25); slideIn("#cB3", T.repo - .25);
      up("#cB3a", T.repo); tl.fromTo("#cB3c", { y: 300, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: "power3.out" }, T.repo + .1);
      tl.fromTo("#cIcon", { scale: .6, rotation: -12 }, { scale: 1, rotation: 0, duration: .8, ease: "back.out(1.6)" }, T.repo + .4);
      up("#cB3s", T.sakhte - .4); count("#cStar", T.sakhte - .4, 1.0, 0, 502, (v) => String(v)); up("#cB3t", T.sakhte + .2);
      drift("#cB3c", T.sakhte, T.in3, { scale: 1 }, { scale: 1.03 });

      // B4: the accent circle grows behind the name
      scene("#cB4", 20.45, T.ye + .25); slideIn("#cB4", 20.45);
      tl.fromTo("#cB4d", { scale: 0 }, { scale: 1, duration: .7, ease: "power3.out" }, 20.6);
      up("#cB4k", 20.6); up("#cB4f", T.founder, { y: 40 }); up("#cB4s", T.skills, { y: 40 });
      tl.to("#cB4d", { scale: 1.08, duration: 1.4, ease: "sine.inOut" }, T.skills + .3);

      // B5: the count runs while flavour pills pop in
      scene("#cB5", T.ye - .25, T.az + .25); slideIn("#cB5", T.ye - .25);
      up("#cB5a", T.ye); count("#cN13", 22.6, 1.75, 0, 13);
      q("#cPills").querySelectorAll(".cl-pill").forEach((p, i) => tl.fromTo(p, { scale: .4, opacity: 0 }, { scale: 1, opacity: 1, duration: .35, ease: "back.out(2)" }, 22.6 + i * .13));
      tl.to("#cPills .cl-pill:nth-child(odd)", { y: -8, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: 1 }, T.n13);
      up("#cB5b", T.eskil2 - .1);

      // B6: order → progress fills → delivered
      scene("#cB6", T.az - .25, 30); slideIn("#cB6", T.az - .25);
      up("#cS1", T.az - .05); tl.fromTo("#cFill", { scaleY: 0 }, { scaleY: 1, duration: 2.2, ease: "power2.inOut" }, T.etebar + .5);
      tl.fromTo("#cRide", { y: 0 }, { y: 560, duration: 2.2, ease: "power2.inOut" }, T.etebar + .5);
      tl.fromTo("#cRide", { scale: .85 }, { scale: 1.15, duration: .35, ease: "sine.inOut", yoyo: true, repeat: 5 }, T.az);
      tl.set("#cRide", { opacity: 0 }, T.reghaba - .5);
      tl.fromTo("#cDone", { scale: 0 }, { scale: 1, duration: .45, ease: "back.out(2.2)" }, T.reghaba - .5);
      up("#cS2", T.reghaba);
      drift("#cS2", T.reghaba + .5, 30, { scale: 1 }, { scale: 1.03 });
    },
  };
  function SKILL_PILLS() {
    return ["chocolate", "vanilla", "carrot-cake", "red-velvet", "cheesecake", "tiramisu", "lemon-tart", "pistachio",
      "saffron-rose", "coffee-walnut", "strawberry", "caramel", "date-cake"].map((s) => `<span class="cl-pill">${s}</span>`).join("");
  }
})();
