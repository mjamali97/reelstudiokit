// Swiss kinetic type, 30 s: a grid, Klein blue, white, black. Giant words slam onto the spoken words with no bounce, colour
// fields invert on beats, one geometric shape morphs through the questions. Word sizes are fitted to the frame width.
window.STYLES = window.STYLES || {};
window.STYLES.swiss = {
  cap: { on: { color: "#002FA7", backgroundColor: "#FFFFFF" }, off: { color: "#FFFFFF", backgroundColor: "rgba(255,255,255,0)" } },
  css: `
  .st-swiss .cap-c{font-family:"Fa",sans-serif;font-weight:900;font-size:56px;line-height:1.55;text-shadow:0 4px 18px rgba(0,0,0,.4)}
  .st-swiss .w{position:absolute;left:60px;right:60px;font-family:"Fa",sans-serif;font-weight:900;line-height:1.3;color:#fff}
  .sw-f{position:absolute;inset:0}
  .sw-grid{position:absolute;inset:-100px;background-image:linear-gradient(90deg,rgba(255,255,255,.14) 2px,transparent 2px),linear-gradient(rgba(255,255,255,.14) 2px,transparent 2px);background-size:90px 90px}
  .sw-gridk{background-image:linear-gradient(90deg,rgba(0,0,0,.08) 2px,transparent 2px),linear-gradient(rgba(0,0,0,.08) 2px,transparent 2px)}
  .sw-frame{position:absolute;inset:0;box-shadow:inset 0 0 0 30px #002FA7}
  .sw-sq{position:absolute;width:200px;height:200px;background:#fff}
  .sw-mono{position:absolute;left:60px;right:60px;font-family:ui-monospace,"SF Mono",Menlo,monospace;font-weight:700;color:#fff;line-height:1.05}
  .sw-shape{position:absolute;left:340px;top:330px;width:400px;height:400px;background:#fff}
  .sw-idx{position:absolute;right:60px;top:250px;font-family:"Fa",sans-serif;font-weight:900;font-size:120px;line-height:1.2}
  `,
  html: `
  <div class="sc" id="sF"><div class="sw-frame"></div>
    <div class="w fa" style="top:260px;font-size:40px;font-weight:700;right:70px">${BRAND.nameFa} · ۰۱</div></div>

  <!-- B1 -->
  <div class="sc" id="sB1"><div class="sw-f" id="sB1bg" style="background:#002FA7"></div><div class="sw-grid" id="sB1g"></div>
    <div class="w fa" id="sB1a" style="top:250px;font-size:230px">قبل از</div>
    <div class="w fa" id="sB1b" style="top:520px;font-size:200px;color:#0A0A0A">سفارشش،</div>
    ${[0, 1, 2, 3].map((i) => `<div class="sw-sq" id="sSq${i}" style="left:${80 + i * 230}px;top:1140px"></div>`).join("")}
    <div class="w fa" id="sB1c" style="top:600px;font-size:210px;color:#002FA7">این منو</div>
    <div class="w fa" id="sB1d" style="top:880px;font-size:210px;color:#0A0A0A">رو ببین.</div></div>

  <!-- B2 -->
  <div class="sc" id="sB2"><div class="sw-f" id="sB2bg" style="background:#002FA7"></div><div class="sw-grid" id="sB2g"></div>
    <div class="sw-shape" id="sShape"></div>
    ${[["قیمت", "هر کیلو چنده"], ["طعم‌ها", "کدوما رو داریم"], ["اندازه", "برای چند نفر"], ["تحویل", "کِی و کجا"]].map(([w, s], i) => `
      <div class="sw-idx" id="sI${i}" style="opacity:0">${["۰۱", "۰۲", "۰۳", "۰۴"][i]}</div>
      <div class="w fa sQ" id="sQ${i}" style="top:850px;text-align:center;opacity:0;font-size:${w.length > 6 ? 165 : 300}px">${w}</div>
      <div class="w fa sQs" id="sQs${i}" style="top:${w.length > 6 ? 1100 : 1250}px;text-align:center;opacity:0;font-size:66px;font-weight:700">${s}</div>`).join("")}</div>

  <!-- B3 -->
  <div class="sc" id="sB3"><div class="sw-f" style="background:#0A0A0A"></div><div class="sw-grid" id="sB3g"></div>
    <div class="w fa" id="sB3a" style="top:250px;font-size:70px;font-weight:700">یه منو، دقیقاً واسه همین ساخته شده</div>
    <div class="sw-mono ltr" id="sR1" style="top:520px;font-size:150px">sweet-</div>
    <div class="sw-mono ltr" id="sR2" style="top:690px;font-size:150px">corner-</div>
    <div class="sw-mono ltr" id="sR3" style="top:860px;font-size:150px;color:#3D6BFF">bakery</div>
    <div class="sw-mono ltr" id="sR4" style="top:1120px;font-size:120px">★ <span id="sStar">0</span></div>
    <div class="sw-mono ltr" id="sR5" style="top:1290px;font-size:48px;color:#9AA0B4">FRESH · HANDMADE</div></div>

  <!-- B4 -->
  <div class="sc" id="sB4"><div class="sw-f" id="sB4bg" style="background:#002FA7"></div><div class="sw-grid"></div>
    <div class="w fa" id="sB4k" style="top:300px;font-size:70px;text-align:center">شیرینی‌فروشی نمونه</div>
    <div class="w ltr" id="sB4f" style="top:500px;font-size:205px;line-height:1;text-align:center">SWEET</div>
    <div class="w ltr" id="sB4s" style="top:740px;font-size:250px;line-height:1;text-align:center;color:#0A0A0A">CORNER</div>
    <div class="abs" id="sB4bar" style="left:60px;right:60px;top:1060px;height:40px;background:#fff;transform-origin:100% 50%"></div></div>

  <!-- B5 -->
  <div class="sc" id="sB5"><div class="sw-f" style="background:#0A0A0A"></div>
    <div class="w fa" id="sB5a" style="top:250px;font-size:66px;font-weight:700">یه منوی ساده با</div>
    <div class="w" id="sN13" style="top:330px;left:60px;right:auto;font-size:330px;line-height:1.1;color:#3D6BFF">۰</div>
    <div class="abs" style="left:60px;right:60px;top:760px;height:560px;overflow:hidden">
      <div class="abs" id="sList" style="left:0;right:0;top:0">${H_LIST()}</div></div>
    <div class="w fa" id="sB5b" style="top:1340px;font-size:84px;text-align:center">طعم واسه هر جشن</div></div>

  <!-- B6 -->
  <div class="sc" id="sB6"><div class="sw-f" style="background:#F4F4F0"></div><div class="sw-grid sw-gridk"></div>
    <div class="w fa" id="sC1" style="top:300px;font-size:170px;color:#002FA7;text-align:center">سفارش</div>
    <div class="sw-mono ltr" id="sC1m" style="top:560px;font-size:44px;color:#0A0A0A;text-align:center">/order</div>
    <div class="abs" id="sAr" style="left:510px;top:660px;width:60px;height:380px;background:#0A0A0A;transform-origin:50% 0%"></div>
    <div class="abs" id="sArH" style="left:450px;top:1020px;width:0;height:0;border-left:90px solid transparent;border-right:90px solid transparent;border-top:110px solid #0A0A0A"></div>
    <div class="w fa" id="sC2" style="top:1120px;font-size:250px;color:#0A0A0A;text-align:center">تحویل</div>
    <div class="sw-mono ltr" id="sC2m" style="top:1440px;font-size:44px;color:#002FA7;text-align:center">/deliver</div></div>`,
  build(H) {
    const { tl, T, type, count, scene, drift, SKILLS, q } = H;
    const slam = (el, t, s = 1.18) => tl.fromTo(el, { opacity: 0, scale: s, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: .18, ease: "power4.out" }, t);
    const off = (el, t) => tl.set(el, { opacity: 0 }, t);
    const cutIn = (el, t) => tl.fromTo(el, { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: .22, ease: "power4.inOut" }, t);
    const grid = (el, t0, t1) => tl.fromTo(el, { x: 0, y: 0 }, { x: 90, y: 180, duration: t1 - t0, ease: "none" }, t0);
    [[0, T.qabl + .2], [T.ya - .2, T.gheymat + .2], [T.in2 - .2, T.repo + .2], [T.in3 - .2, 20.8]].forEach(([a, b]) => scene("#sF", a, b));

    // B1
    scene("#sB1", T.qabl - .1, T.ya + .05); cutIn("#sB1", T.qabl - .1); grid("#sB1g", T.qabl, T.ya);
    ["#sB1a", "#sB1b", "#sB1c", "#sB1d", ".sw-sq"].forEach((e) => tl.set(e, { opacity: 0 }, 0));
    slam("#sB1a", T.qabl); slam("#sB1b", T.sakhtan);
    [0, 1, 2, 3].forEach((i) => tl.fromTo("#sSq" + i, { opacity: 0, y: 260 }, { opacity: 1, y: 0, duration: .25, ease: "power4.out" }, T.qabl + .35 + i * .3));
    tl.to("#sSq0, #sSq2", { rotation: 90, duration: 2.2, ease: "none" }, T.sakhtan);
    tl.set("#sB1bg", { backgroundColor: "#F4F4F0" }, T.hatman); tl.set("#sB1g", { opacity: .4 }, T.hatman);
    tl.set(".sw-sq", { backgroundColor: "#002FA7" }, T.hatman);
    off(["#sB1a", "#sB1b"], T.abzar); slam("#sB1c", T.abzar); slam("#sB1d", T.bebini);
    tl.to("#sB1", { clipPath: "inset(0 100% 0 0%)", duration: .22, ease: "power4.inOut" }, T.ya - .15);

    // B2: hard cuts, colour field per question, one shape morphing through
    scene("#sB2", T.gheymat - .1, T.in2 + .05); cutIn("#sB2", T.gheymat - .1); grid("#sB2g", T.gheymat, T.in2);
    const fields = [["#002FA7", "#FFFFFF"], ["#F4F4F0", "#002FA7"], ["#0A0A0A", "#FFFFFF"], ["#002FA7", "#FFFFFF"]];
    const shapes = ["circle(50% at 50% 50%)", "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", "polygon(50% 0%, 100% 100%, 0% 100%, 50% 0%)", "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"];
    [T.gheymat, T.reghabat, T.mvp, T.bazar].forEach((t, i) => {
      if (i) off(["#sQ" + (i - 1), "#sQs" + (i - 1), "#sI" + (i - 1)], t);
      tl.set("#sB2bg", { backgroundColor: fields[i][0] }, t);
      tl.set([`#sQ${i}`, `#sQs${i}`, `#sI${i}`], { color: fields[i][1] }, t);
      tl.set("#sShape", { backgroundColor: fields[i][1] }, t);
      tl.to("#sShape", { clipPath: shapes[i], duration: .3, ease: "power4.out" }, t);
      slam("#sQ" + i, t, 1.25); slam("#sI" + i, t); tl.fromTo("#sQs" + i, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .3, ease: "expo.out" }, t + .3);
    });
    tl.fromTo("#sShape", { rotation: 0, scale: .9 }, { rotation: 180, scale: 1.05, duration: T.in2 - T.gheymat, ease: "none" }, T.gheymat);
    tl.to("#sB2", { clipPath: "inset(0 100% 0 0%)", duration: .22, ease: "power4.inOut" }, T.in2 - .15);

    // B3
    scene("#sB3", T.repo - .1, T.in3 + .05); cutIn("#sB3", T.repo - .1); grid("#sB3g", T.repo, T.in3);
    slam("#sB3a", T.repo); type("#sR1", T.repo + .15, .3); type("#sR2", T.repo + .45, .3); type("#sR3", T.repo + .75, .3);
    slam("#sR4", T.sakhte - .4); count("#sStar", T.sakhte - .4, 1.0, 0, 502, (v) => String(v)); slam("#sR5", T.sakhte + .2);
    tl.to("#sB3", { clipPath: "inset(0 100% 0 0%)", duration: .22, ease: "power4.inOut" }, T.in3 - .15);

    // B4: invert flicker on the two words
    scene("#sB4", 20.55, T.ye + .05); cutIn("#sB4", 20.55);
    slam("#sB4k", 20.6); slam("#sB4f", T.founder, 1.3); slam("#sB4s", T.skills, 1.3);
    tl.set("#sB4bg", { backgroundColor: "#F4F4F0" }, T.skills); tl.set("#sB4f", { color: "#002FA7" }, T.skills); tl.set("#sB4k", { color: "#0A0A0A" }, T.skills);
    tl.set("#sB4bg", { backgroundColor: "#002FA7" }, T.skills + .5); tl.set("#sB4f", { color: "#FFFFFF" }, T.skills + .5); tl.set("#sB4k", { color: "#FFFFFF" }, T.skills + .5);
    tl.fromTo("#sB4bar", { scaleX: 0 }, { scaleX: 1, duration: .5, ease: "expo.out" }, T.skills + .2);
    // B5: thirteen names scroll up as they land; the count rides along
    scene("#sB5", T.ye - .15, T.az + .05); cutIn("#sB5", T.ye - .15);
    slam("#sB5a", T.ye); count("#sN13", 22.6, 1.75, 0, 13);
    tl.fromTo("#sList", { y: 0 }, { y: -(13 * 86 - 520), duration: 1.8, ease: "none" }, 22.6);
    tl.to("#sList", { y: -(13 * 86 - 470), duration: 1.6, ease: "sine.inOut" }, 24.4);
    SKILLS.forEach((s, i) => tl.fromTo("#sL" + i, { color: "#FFFFFF", x: 40, opacity: 0 }, { color: "#555", x: 0, opacity: 1, duration: .5, ease: "expo.out" }, 22.6 + i * .13));
    slam("#sN13", T.n13, 1.15); slam("#sB5b", T.eskil2 - .1);
    tl.to("#sB5", { clipPath: "inset(0 100% 0 0%)", duration: .22, ease: "power4.inOut" }, T.az - .15);
    // B6
    scene("#sB6", T.az - .1, 30); cutIn("#sB6", T.az - .1); H.camera("#sB6", T.az, 30, { amp: 10 });
    slam("#sC1", T.az - .05, 1.2); slam("#sC1m", T.etebar);
    tl.fromTo("#sAr", { scaleY: 0 }, { scaleY: 1, duration: 1.6, ease: "power2.inOut" }, T.etebar + 1.0);
    tl.fromTo("#sArH", { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: .2, ease: "power4.out" }, T.reghaba - .35);
    slam("#sC2", T.reghaba, 1.3); slam("#sC2m", T.reghaba + .25);
    tl.to("#sC1, #sC2", { x: 12, duration: 1.2, ease: "sine.inOut" }, T.etebar + .3);
  },
};
function H_LIST() {
  return ["chocolate", "vanilla", "carrot-cake", "red-velvet", "cheesecake", "tiramisu", "lemon-tart", "pistachio",
    "saffron-rose", "coffee-walnut", "strawberry", "caramel", "date-cake"]
    .map((s, i) => `<div id="sL${i}" style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-weight:700;font-size:62px;line-height:86px;height:86px;color:#555;opacity:0;direction:ltr">${s}</div>`).join("");
}
