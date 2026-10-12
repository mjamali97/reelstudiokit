// Retro, 30 s: a 70s poster. Cream paper, a slowly turning sunburst, fat Lalezar letters with stacked orange-brown shadows,
// wavy stripes and round starburst badges that bounce in. Warm and friendly: bakeries, cafés, family restaurants, kids, vintage shops.
window.STYLES = window.STYLES || {};
window.STYLES.retro = {
  cap: { on: { color: "#FFF3DC", backgroundColor: "#D9541E" }, off: { color: "#4A2A16", backgroundColor: "rgba(255,243,220,.95)" } },
  css: `
  .st-retro .cap-c{font-family:"Lalezar","Fa",sans-serif;font-size:60px;line-height:1.55}
  .st-retro .cap-c span{border-radius:999px;padding:0 18px 4px}
  .rt-paper{position:absolute;inset:-60px;background:url(assets/paper-tan.jpg) center/cover}
  .rt-sun{position:absolute;left:-760px;top:-560px;width:2600px;height:2600px;border-radius:50%;
    background:repeating-conic-gradient(from 0deg,rgba(242,169,59,.55) 0deg 7.5deg,rgba(255,243,220,0) 7.5deg 15deg)}
  .rt{position:absolute;left:70px;right:70px;text-align:center;font-family:"Lalezar","Fa",sans-serif;color:#D9541E;line-height:1.15;
    text-shadow:5px 5px 0 #FFF3DC,10px 10px 0 #4A2A16,14px 14px 0 #4A2A16}
  .rt-d{color:#4A2A16;text-shadow:4px 4px 0 #F2A93B}
  .rt-wave{position:absolute;left:-40px;right:-40px;height:150px}
  .rt-badge{position:absolute;width:300px;height:300px;display:grid;place-items:center;text-align:center;font-family:"Lalezar","Fa",sans-serif;color:#FFF3DC;
    background:#D9541E;clip-path:polygon(50% 0%,61% 12%,75% 6%,79% 21%,94% 22%,90% 37%,100% 50%,90% 63%,94% 78%,79% 79%,75% 94%,61% 88%,50% 100%,39% 88%,25% 94%,21% 79%,6% 78%,10% 63%,0% 50%,10% 37%,6% 22%,21% 21%,25% 6%,39% 12%)}
  .rt-card{position:absolute;left:110px;right:110px;background:#FFF3DC;border:8px solid #4A2A16;border-radius:60px;box-shadow:14px 14px 0 #4A2A16}
  .rt-frame{position:absolute;inset:34px;border:12px solid #F2A93B;border-radius:70px;box-shadow:inset 0 0 0 10px #D9541E}
  .rt-label{position:absolute;top:240px;left:0;right:0;text-align:center}
  .rt-label span{display:inline-block;background:#4A2A16;color:#FFF3DC;border-radius:999px;padding:6px 34px 12px;font-family:"Lalezar","Fa",sans-serif;font-size:46px}
  .rt-chip{display:inline-block;margin:8px;padding:8px 22px 12px;border-radius:999px;font-family:"Lalezar",sans-serif;font-size:42px;color:#FFF3DC;border:5px solid #4A2A16}
  `,
  html: `
  <div class="sc" id="rF"><div class="rt-frame"></div><div class="rt-label fa"><span>${BRAND.nameFa}</span></div></div>

  <div class="sc" id="rB1"><div class="rt-paper"></div><div class="rt-sun" id="rSun1"></div>
    ${WAVES("rW1", 1450)}
    <div class="rt fa" id="rB1a" style="top:330px;font-size:230px">قبل از</div>
    <div class="rt fa" id="rB1b" style="top:610px;font-size:200px">سفارشش،</div>
    <div class="rt-badge" id="rB1c" style="left:390px;top:950px;width:330px;height:330px"><div class="fa" style="font-size:72px;line-height:1.1">این منو<br>رو ببین!</div></div></div>

  <div class="sc" id="rB2"><div class="rt-paper"></div><div class="rt-sun" id="rSun2"></div>
    ${[["قیمت", "هر کیلو چنده؟", "#D9541E"], ["طعم‌ها", "کدوما رو داریم؟", "#3E8E7E"], ["اندازه", "برای چند نفر؟", "#F2A93B"], ["تحویل", "کِی و کجا؟", "#B23A48"]].map(([w, s, c], i) => `
    <div class="abs" id="rQ${i}" style="inset:0;opacity:0">
      <div class="rt-badge" style="left:390px;top:300px;background:${c}"><div style="font-size:120px;line-height:1">${["۱", "۲", "۳", "۴"][i]}</div></div>
      <div class="rt-card" style="top:700px;height:620px;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div class="fa" style="font-family:'Lalezar','Fa';font-size:220px;line-height:1.1;color:${c};text-shadow:6px 6px 0 #4A2A16">${w}</div>
        <div class="fa" style="font-family:'Lalezar','Fa';font-size:76px;color:#4A2A16">${s}</div></div></div>`).join("")}</div>

  <div class="sc" id="rB3"><div class="rt-paper"></div>${WAVES("rW3", 230)}
    <div class="rt-card" id="rB3c" style="top:560px;height:860px;overflow:hidden">
      <div style="position:absolute;left:0;right:0;top:0;height:120px;background:#D9541E;color:#FFF3DC;font-family:'Lalezar','Fa';font-size:60px;display:grid;place-items:center" class="fa">یه منو، دقیقاً واسه همین</div>
      <img src="assets/icons/icon-cake.svg" id="rIcon" style="position:absolute;left:330px;top:170px;width:220px;height:220px">
      <div class="ltr" style="position:absolute;left:0;right:0;top:420px;text-align:center;font-family:'Lalezar';font-size:84px;color:#4A2A16">sweet corner bakery</div>
      <div class="ltr" id="rB3s" style="position:absolute;left:0;right:0;top:540px;text-align:center;font-family:'Lalezar';font-size:110px;color:#D9541E">★ <span id="rStar">0</span></div>
      <div class="fa" id="rB3t" style="position:absolute;left:0;right:0;top:700px;text-align:center;font-family:'Lalezar','Fa';font-size:56px;color:#3E8E7E">تازه · دست‌ساز · هر روز صبح</div></div></div>

  <div class="sc" id="rB4"><div class="rt-paper"></div><div class="rt-sun" id="rSun4"></div>${WAVES("rW4", 1360)}
    <div class="rt fa rt-d" id="rB4k" style="top:330px;font-size:84px">شیرینی‌فروشی نمونه</div>
    <div class="rt ltr" id="rB4f" style="top:520px;font-size:270px;line-height:1">Sweet</div>
    <div class="rt ltr" id="rB4s" style="top:830px;font-size:270px;line-height:1">Corner</div></div>

  <div class="sc" id="rB5"><div class="rt-paper"></div><div class="rt-sun" id="rSun5"></div>
    <div class="rt fa rt-d" id="rB5a" style="top:250px;font-size:76px">یه منوی ساده با</div>
    <div class="rt-badge" id="rN" style="left:330px;top:370px;width:420px;height:420px;background:#3E8E7E"><div id="rN13" style="font-size:230px;line-height:1">۰</div></div>
    <div class="ltr" id="rChips" style="position:absolute;left:50px;right:50px;top:830px;text-align:center">${["chocolate", "vanilla", "carrot-cake", "red-velvet", "cheesecake", "tiramisu", "lemon-tart", "pistachio",
      "saffron-rose", "coffee-walnut", "strawberry", "caramel", "date-cake"].map((s, i) => `<span class="rt-chip" style="background:${["#D9541E", "#3E8E7E", "#F2A93B", "#B23A48"][i % 4]}">${s}</span>`).join("")}</div>
    <div class="rt fa" id="rB5b" style="top:1430px;font-size:104px">طعم واسه هر جشن</div></div>

  <div class="sc" id="rB6"><div class="rt-paper"></div><div class="rt-sun" id="rSun6"></div>
    <div class="rt-card" id="rS1" style="top:330px;height:330px;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(-3deg)">
      <div class="fa" style="font-family:'Lalezar','Fa';font-size:150px;line-height:1.1;color:#D9541E">سفارش</div><div class="ltr" style="font-family:'Lalezar';font-size:50px;color:#4A2A16">/order</div></div>
    <svg class="abs" style="left:440px;top:700px;width:200px;height:440px;overflow:visible"><path id="rArr" d="M100 0 C 20 120, 180 220, 100 340 M40 290 L100 350 L160 290" fill="none" stroke="#4A2A16" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div class="rt-card" id="rS2" style="top:1180px;height:330px;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(3deg)">
      <div class="fa" style="font-family:'Lalezar','Fa';font-size:150px;line-height:1.1;color:#3E8E7E">تحویل</div><div class="ltr" style="font-family:'Lalezar';font-size:50px;color:#4A2A16">/deliver</div></div></div>`,
  build(H) {
    const { tl, T, count, scene, drift, q } = H;
    const pop = (el, t, o = {}) => tl.fromTo(el, { scale: o.s ?? .3, opacity: 0, rotation: o.r ?? -8 }, { scale: 1, opacity: 1, rotation: o.r2 ?? 0, duration: o.d ?? .55, ease: "back.out(2.2)" }, t);
    const drop = (el, t) => tl.fromTo(el, { y: -260, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: "bounce.out" }, t);
    const wipe = (el, t) => tl.fromTo(el, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: .5, ease: "power2.inOut" }, t);
    const spin = (el, t0, t1) => tl.fromTo(el, { rotation: 0 }, { rotation: 40, duration: t1 - t0, ease: "none" }, t0);
    const wave = (id, t0, t1) => tl.fromTo("#" + id, { x: 0 }, { x: -160, duration: t1 - t0, ease: "none" }, t0);
    [[0, T.qabl + .3], [T.ya - .3, T.gheymat + .3], [T.in2 - .3, T.repo + .3], [T.in3 - .3, 20.8]].forEach(([a, b]) => scene("#rF", a, b));
    pop(".rt-label span", .1, { s: .6, r: 0 });

    scene("#rB1", T.qabl - .3, T.ya + .2); wipe("#rB1", T.qabl - .3); spin("#rSun1", T.qabl - .3, T.ya); wave("rW1", T.qabl, T.ya);
    drop("#rB1a", T.qabl); drop("#rB1b", T.sakhtan); pop("#rB1c", T.abzar, { r: -30, r2: -8 });
    tl.to("#rB1c", { rotation: 8, duration: 1, ease: "sine.inOut", yoyo: true, repeat: 1 }, T.abzar + .6);

    scene("#rB2", T.gheymat - .3, T.in2 + .2); wipe("#rB2", T.gheymat - .3); spin("#rSun2", T.gheymat - .3, T.in2);
    [T.gheymat, T.reghabat, T.mvp, T.bazar].forEach((t, i) => {
      if (i) tl.set("#rQ" + (i - 1), { opacity: 0 }, t - .05);
      tl.set("#rQ" + i, { opacity: 1 }, t - .05);
      pop(`#rQ${i} .rt-badge`, t - .05, { r: -90 }); tl.fromTo(`#rQ${i} .rt-card`, { y: 700, rotation: 6 }, { y: 0, rotation: i % 2 ? 2 : -2, duration: .6, ease: "back.out(1.4)" }, t - .05);
    });

    scene("#rB3", T.repo - .3, T.in3 + .2); wipe("#rB3", T.repo - .3); wave("rW3", T.repo, T.in3);
    tl.fromTo("#rB3c", { y: 900, rotation: -5, opacity: 0 }, { y: 0, rotation: -1.5, opacity: 1, duration: .65, ease: "back.out(1.3)" }, T.repo - .1);
    tl.fromTo("#rIcon", { rotation: -20, scale: .5 }, { rotation: 0, scale: 1, duration: .7, ease: "elastic.out(1,.5)" }, T.repo + .4);
    pop("#rB3s", T.sakhte - .4, { r: 0 }); count("#rStar", T.sakhte - .4, 1.0, 0, 502, (v) => String(v)); pop("#rB3t", T.sakhte + .2, { r: 0, s: .7 });

    scene("#rB4", 20.5, T.ye + .2); wipe("#rB4", 20.5); spin("#rSun4", 20.5, T.ye); wave("rW4", 20.5, T.ye);
    pop("#rB4k", 20.6, { r: 0, s: .7 }); drop("#rB4f", T.founder); drop("#rB4s", T.skills);
    tl.to("#rB4f, #rB4s", { y: -10, duration: .5, ease: "sine.inOut", yoyo: true, repeat: 1, stagger: .15 }, T.skills + .6);

    scene("#rB5", T.ye - .3, T.az + .2); wipe("#rB5", T.ye - .3); spin("#rSun5", T.ye - .3, T.az);
    pop("#rB5a", T.ye, { r: 0, s: .7 }); pop("#rN", 22.5, { r: -120 }); count("#rN13", 22.6, 1.75, 0, 13);
    tl.to("#rN", { rotation: 30, duration: 4, ease: "none" }, 23.2);
    q("#rChips").querySelectorAll(".rt-chip").forEach((n, i) => pop(n, 22.6 + i * .13, { r: (i % 2 ? 12 : -12), r2: (i % 3) - 1, d: .45 }));
    drop("#rB5b", T.eskil2 - .1);

    scene("#rB6", T.az - .3, 30); wipe("#rB6", T.az - .3); spin("#rSun6", T.az - .3, 30);
    tl.fromTo("#rS1", { y: -500, rotation: -15, opacity: 0 }, { y: 0, rotation: -3, opacity: 1, duration: .6, ease: "back.out(1.6)" }, T.az - .05);
    const p = q("#rArr"), L = p.getTotalLength(); tl.set(p, { opacity: 0 }, 0); tl.set(p, { opacity: 1 }, T.etebar + .8); tl.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.4, ease: "power1.inOut" }, T.etebar + .8);
    tl.fromTo("#rS2", { y: 600, rotation: 15, opacity: 0 }, { y: 0, rotation: 3, opacity: 1, duration: .6, ease: "back.out(1.6)" }, T.reghaba - .1);
  },
};
function WAVES(id, top) {
  const d = Array.from({ length: 14 }, (_, i) => `${i ? "" : "M0 40 "}q 40 -40 80 0 t 80 0`).join(" ");
  return `<svg class="rt-wave" id="${id}" style="top:${top}px;width:1400px" viewBox="0 0 1400 150">${["#D9541E", "#F2A93B", "#3E8E7E"].map((c, i) =>
    `<path d="${d}" transform="translate(0 ${i * 34})" fill="none" stroke="${c}" stroke-width="24" stroke-linecap="round"/>`).join("")}</svg>`;
}
