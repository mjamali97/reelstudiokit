// Hand-drawn doodle, 30 s: ink and one orange marker. Strokes draw themselves on the spoken words and "boil" on twos (three
// jittered versions of every line, swapped each 2 frames). Over the face in the face windows, on paper in the b-roll.
window.STYLES = window.STYLES || {};
window.STYLES.doodle = {
  cap: { on: { color: "#1A1A1A", backgroundColor: "rgba(255,170,90,.95)" }, off: { color: "#1A1A1A", backgroundColor: "rgba(255,255,255,.92)" } },
  css: `
  .st-doodle .cap-c{font-family:"Fa",sans-serif;font-weight:900;font-size:52px;line-height:1.7}
  .st-doodle .cap-c span{border-radius:22px 10px 26px 12px;padding:0 16px}
  .st-doodle .t{font-family:"Fa",sans-serif;color:#1A1A1A}
  .dd-paper{position:absolute;inset:-60px;background:url(assets/paper-white.jpg) center/cover}
  svg.dd{position:absolute;inset:0;width:1080px;height:1920px;overflow:visible}
  svg.dd path{fill:none;stroke-linecap:round;stroke-linejoin:round}
  .dk{stroke:#1A1A1A;stroke-width:9} .do{stroke:#FF5A1F;stroke-width:14} .dw{stroke:#FFFFFF;stroke-width:11}
  .dd-hl{position:absolute;background:rgba(255,120,50,.38);border-radius:26px 10px 30px 12px;transform-origin:100% 50%}
  .dd-st{position:absolute;width:440px;height:92px;background:#FFE58A;box-shadow:0 8px 14px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;
    font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:34px;color:#1A1A1A}
  .dd-big{position:absolute;width:780px;height:300px;left:150px;background:#FFE58A;box-shadow:0 12px 20px rgba(0,0,0,.2);display:flex;flex-direction:column;align-items:center;justify-content:center}
  `,
  html: `
  <div class="sc" id="dF"><svg class="dd" id="dFsvg"></svg></div>
  <div class="sc" id="dB1"><div class="dd-paper" id="dP1"></div><svg class="dd" id="dB1svg"></svg>
    <div class="t fa" id="dB1a" style="position:absolute;right:80px;top:260px;font-weight:900;font-size:104px;line-height:1.5;transform:rotate(-3deg)">قبل از سفارشش،</div>
    <div class="dd-hl" id="dB1h" style="right:120px;left:120px;top:1395px;height:110px"></div>
    <div class="t fa" id="dB1b" style="position:absolute;left:0;right:0;top:1360px;text-align:center;font-weight:900;font-size:100px;line-height:1.5;transform:rotate(-2deg)">این منو رو ببین!</div></div>
  <div class="sc" id="dB2"><div class="dd-paper" id="dP2"></div>
    ${[0, 1, 2, 3].map((i) => `<div class="abs" id="dQ${i}" style="inset:0"><svg class="dd" id="dQsvg${i}"></svg>
      <div class="dd-hl" id="dQh${i}" style="left:180px;right:180px;top:1130px;height:130px"></div>
      <div class="t fa" style="position:absolute;left:0;right:0;top:1080px;text-align:center;font-weight:900;font-size:${i ? 180 : 150}px;line-height:1.4;transform:rotate(-2deg)">${["قیمت", "طعم‌ها", "اندازه", "تحویل"][i]}</div>
      <div class="t fa" style="position:absolute;left:0;right:0;top:1350px;text-align:center;font-weight:700;font-size:64px;color:#FF5A1F">${["هر کیلو چنده؟", "کدوما رو داریم؟", "برای چند نفر؟", "کِی و کجا؟"][i]}</div></div>`).join("")}</div>
  <div class="sc" id="dB3"><div class="dd-paper" id="dP3"></div><svg class="dd" id="dB3svg"></svg>
    <div class="t fa" id="dB3a" style="position:absolute;right:80px;left:80px;top:260px;font-weight:900;font-size:80px;line-height:1.5;text-align:center;transform:rotate(-2deg)">این منو دقیقاً واسه همین ساخته شده</div>
    <div class="ltr" id="dRn" style="position:absolute;left:170px;top:760px;font-family:ui-monospace,Menlo,monospace;font-size:58px;font-weight:700;color:#1A1A1A">sweet-corner-bakery</div>
    <div class="ltr" style="position:absolute;left:170px;top:690px;font-family:ui-monospace,Menlo,monospace;font-size:40px;color:#666">sweet corner /</div>
    <div class="t fa" id="dB3b" style="position:absolute;right:170px;top:880px;font-weight:700;font-size:52px">تازه · هر روز صبح</div>
    <div class="t" id="dStar" style="position:absolute;left:560px;top:1150px;font-weight:900;font-size:130px;color:#1A1A1A">۰</div></div>
  <div class="sc" id="dB4"><div class="dd-paper" id="dP4"></div><svg class="dd" id="dB4svg"></svg>
    <div class="t fa" id="dB4k" style="position:absolute;left:0;right:0;top:330px;text-align:center;font-weight:900;font-size:72px;color:#FF5A1F">شیرینی‌فروشی نمونه</div>
    <div class="t ltr" id="dB4f" style="position:absolute;left:0;right:0;top:480px;text-align:center;font-weight:900;font-size:200px;line-height:1.05;transform:rotate(-3deg)">Sweet</div>
    <div class="t ltr" id="dB4s" style="position:absolute;left:0;right:0;top:700px;text-align:center;font-weight:900;font-size:200px;line-height:1.05;transform:rotate(-3deg)">Corner</div></div>
  <div class="sc" id="dB5"><div class="dd-paper" id="dP5"></div><svg class="dd" id="dB5svg"></svg>
    <div class="t fa" id="dB5a" style="position:absolute;right:80px;top:280px;font-weight:900;font-size:62px;line-height:1.5">یه منوی ساده با</div>
    <div class="t" id="dN13" style="position:absolute;left:110px;top:230px;font-weight:900;font-size:200px;line-height:1.2;color:#FF5A1F">۰</div>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => `<div class="dd-st ltr" id="dS${i}" style="left:${i % 2 ? 40 : 500}px;top:${560 + Math.floor(i / 2) * 106}px;transform:rotate(${((i * 53) % 5) - 2}deg)"><span id="dSn${i}"></span></div>`).join("")}
    <div class="t fa" id="dB5b" style="position:absolute;left:0;right:0;top:1340px;text-align:center;font-weight:900;font-size:80px">طعم واسه هر جشن!</div></div>
  <div class="sc" id="dB6"><div class="dd-paper" id="dP6"></div><svg class="dd" id="dB6svg"></svg>
    <div class="dd-big" id="dN1" style="top:400px;transform:rotate(-2deg)"><div class="t fa" style="font-weight:900;font-size:96px;line-height:1.4">ثبت سفارش</div>
      <div class="ltr" style="font-family:ui-monospace,Menlo,monospace;font-size:38px">/order</div></div>
    <div class="dd-big" id="dN2" style="top:1080px;transform:rotate(2deg)"><div class="t fa" style="font-weight:900;font-size:96px;line-height:1.4">تحویل در خونه</div>
      <div class="ltr" style="font-family:ui-monospace,Menlo,monospace;font-size:38px">/deliver</div></div></div>`,
  build(H) {
    const { tl, T, IN, OUT, type, count, scene, drift, SKILLS, q } = H;
    SKILLS.forEach((s, i) => { q("#dSn" + i).textContent = s; });
    let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - .5; };
    const smooth = (p) => { let d = `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
      for (let i = 0; i < p.length - 1; i++) { const a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], e = p[Math.min(p.length - 1, i + 2)];
        d += ` C ${(b[0] + (c[0] - a[0]) / 6).toFixed(1)} ${(b[1] + (c[1] - a[1]) / 6).toFixed(1)}, ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)} ${(c[1] - (e[1] - b[1]) / 6).toFixed(1)}, ${c[0].toFixed(1)} ${c[1].toFixed(1)}`; }
      return d; };
    const all = []; let uid = 0;
    const doodle = (svg, pts, cls, amp = 6) => { const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.id = "dd" + (uid++);
      const vs = [0, 1, 2].map(() => { const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
        p.setAttribute("d", smooth(pts.map(([x, y]) => [x + rnd() * amp, y + rnd() * amp]))); p.setAttribute("class", cls); p.setAttribute("pathLength", "1");
        p.style.strokeDasharray = 1; p.style.strokeDashoffset = 1; g.appendChild(p); return p; });
      q(svg).appendChild(g); all.push(vs); return "#" + g.id; };
    const draw = (sel, t, d = .45) => tl.fromTo(sel + " path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease: "power2.out" }, t);
    const ell = (cx, cy, rx, ry, turns = 1.1, n = 30) => Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 2 + turns * 2 * Math.PI * i / n; const k = 1 + .04 * Math.sin(i * 1.7); return [cx + rx * k * Math.cos(a), cy + ry * k * Math.sin(a)]; });
    const sh = (p, dx, dy, s = 1) => p.map(([x, y]) => [dx + x * s, dy + y * s]);
    const rect = (x, y, w, h) => [[x + 8, y - 6], [x + w * .5, y + 4], [x + w + 6, y - 2], [x + w - 4, y + h * .5], [x + w + 4, y + h + 6], [x + w * .5, y + h - 4], [x - 6, y + h + 2], [x + 4, y + h * .5], [x - 2, y - 10], [x + 30, y - 4]];
    const qm = (x, y, s) => sh([[-30, -40], [-10, -70], [30, -60], [35, -25], [0, 0], [0, 30]], x, y, s);
    const star = (cx, cy, R, r) => Array.from({ length: 11 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, k = i % 2 ? r : R; return [cx + k * Math.cos(a), cy + k * Math.sin(a)]; });
    const boil = { f: 0 }; tl.fromTo(boil, { f: 0 }, { f: 900, duration: 30, ease: "none", onUpdate: () => {
      const k = Math.floor(Math.round(boil.f) / 2) % 3; all.forEach((vs) => vs.forEach((p, i) => { p.style.visibility = i === k ? "visible" : "hidden"; })); } }, 0);
    const swipeIn = (el, t) => tl.fromTo(el, { x: -1100, rotation: -4 }, { x: 0, rotation: 0, duration: .45, ease: "power3.out" }, t);
    const swipeOut = (el, t) => tl.to(el, { x: 1100, rotation: 4, duration: .4, ease: "power3.in" }, t);

    // face windows: annotations over the face
    [[0, T.qabl + .3], [T.ya - .3, T.gheymat + .3], [T.in2 - .3, T.repo + .3], [T.in3 - .3, 20.9]].forEach(([a, b]) => scene("#dF", a, b));
    const head = doodle("#dFsvg", ell(540, 860, 360, 430), "do", 9); draw(head, .05, .5);
    tl.set(head, { opacity: 0 }, T.qabl + .3);
    const q1 = doodle("#dFsvg", qm(880, 560, 1.6), "dw", 5), q2 = doodle("#dFsvg", qm(190, 620, 1.3), "dw", 5);
    tl.set([q1, q2], { opacity: 0 }, 0); tl.set([q1, q2], { opacity: 1 }, T.ya); draw(q1, T.ya + .1, .4); draw(q2, T.ya + .4, .4); tl.set([q1, q2], { opacity: 0 }, T.gheymat + .3);
    const chk = doodle("#dFsvg", [[760, 640], [830, 720], [960, 520]], "do", 6); tl.set(chk, { opacity: 0 }, 0); tl.set(chk, { opacity: 1 }, T.mon); draw(chk, T.mon, .35); tl.set(chk, { opacity: 0 }, T.repo + .3);
    const sp = doodle("#dFsvg", star(870, 560, 90, 38), "do", 5); tl.set(sp, { opacity: 0 }, 0); tl.set(sp, { opacity: 1 }, T.eskil); draw(sp, T.eskil, .45); tl.set(sp, { opacity: 0 }, 20.9);

    // B1: a house drawn, an exclamation on «حتماً», a toolbox on «منو»
    scene("#dB1", T.qabl - .2, T.ya + .1); swipeIn("#dB1", T.qabl - .2); drift("#dP1", T.qabl, T.ya, { scale: 1 }, { scale: 1.05 });
    IN("#dB1a", T.qabl + .05, { r: -6 });
    const house = doodle("#dB1svg", [[260, 1150], [260, 820], [540, 600], [820, 820], [820, 1150], [260, 1150]], "dk", 8); draw(house, T.qabl + .3, .9);
    const door = doodle("#dB1svg", [[480, 1150], [480, 980], [600, 980], [600, 1150]], "dk", 5); draw(door, T.sakhtan, .4);
    const ex = doodle("#dB1svg", [[900, 640], [880, 900]], "do", 6), exd = doodle("#dB1svg", ell(875, 960, 16, 16, 1, 10), "do", 3);
    draw(ex, T.hatman, .25); draw(exd, T.hatman + .25, .15);
    tl.to([house, door], { opacity: .25, duration: .3 }, T.abzar - .1);
    const box = doodle("#dB1svg", [[230, 900], [850, 900], [820, 1230], [260, 1230], [230, 900]], "dk", 8), handle = doodle("#dB1svg", [[430, 900], [440, 800], [640, 800], [650, 900]], "dk", 6);
    const wr = doodle("#dB1svg", [[330, 1060], [500, 1060], [540, 1020], [560, 1100]], "do", 6);
    draw(box, T.abzar - .1, .5); draw(handle, T.abzar + .3, .3); draw(wr, T.abzar + .5, .3);
    tl.fromTo("#dB1h", { scaleX: 0 }, { scaleX: 1, duration: .35, ease: "power2.out" }, T.bebini);
    IN("#dB1b", T.abzar, { dy: 20, dx: 0 });
    swipeOut("#dB1", T.ya - .2);

    // B2: one big drawing per question, a paper swipe between them
    scene("#dB2", T.gheymat - .2, T.in2 + .1); swipeIn("#dB2", T.gheymat - .2); drift("#dP2", T.gheymat, T.in2, { scale: 1 }, { scale: 1.06 });
    const ts = [T.gheymat, T.reghabat, T.mvp, T.bazar, T.in2];
    const art = [
      [[[260, 560], [700, 560], [860, 760], [700, 960], [260, 960], [260, 560]], "dk"], [ell(360, 760, 40, 40, 1, 14), "dk"], [qm(600, 800, 1.8), "do"],
      [ell(400, 620, 70, 70, 1, 16), "dk"], [[[290, 1000], [310, 820], [400, 760], [490, 820], [510, 1000]], "dk"], [ell(680, 620, 70, 70, 1, 16), "dk"],
      [[[570, 1000], [590, 820], [680, 760], [770, 820], [790, 1000]], "dk"], [qm(880, 640, 1.2), "do"],
      [[[340, 680], [640, 680], [640, 1000], [340, 1000], [340, 680], [440, 580], [740, 580], [640, 680], [740, 580], [740, 900], [640, 1000]], "dk"], [star(820, 520, 70, 28), "do"],
      [[[240, 640], [840, 640], [800, 720], [740, 640], [680, 720], [620, 640], [560, 720], [500, 640], [440, 720], [380, 640], [320, 720], [240, 640]], "dk"],
      [[[290, 720], [290, 1010], [790, 1010], [790, 720]], "dk"], [[[470, 1010], [470, 860], [610, 860], [610, 1010]], "do"]];
    const groups = [[0, 1, 2], [3, 4, 5, 6, 7], [8, 9], [10, 11, 12]];
    groups.forEach((g, i) => { const ids = g.map((k) => doodle("#dQsvg" + i, art[k][0], art[k][1], 7));
      ids.forEach((id, j) => draw(id, ts[i] + j * .22, .45));
      tl.fromTo("#dQh" + i, { scaleX: 0 }, { scaleX: 1, duration: .35, ease: "power2.out" }, ts[i] + .25);
      tl.set("#dQ" + i, { opacity: 0 }, 0); tl.set("#dQ" + i, { opacity: 1 }, ts[i] - .02);
      if (i) tl.fromTo("#dQ" + i, { x: -1100 }, { x: 0, duration: .45, ease: "power3.inOut" }, ts[i] - .3);
      if (i < 3) { tl.to("#dQ" + i, { x: 1100, duration: .45, ease: "power3.inOut" }, ts[i + 1] - .3); tl.set("#dQ" + i, { opacity: 0 }, ts[i + 1] + .2); }
    });
    tl.to("#dQ1 svg", { rotation: 2, duration: .5, yoyo: true, repeat: 3, ease: "sine.inOut", transformOrigin: "50% 50%" }, T.reghabat + .6);
    swipeOut("#dB2", T.in2 - .2);

    // B3: a doodled browser window, the name typed, a star with the count
    scene("#dB3", T.repo - .2, T.in3 + .1); swipeIn("#dB3", T.repo - .2); drift("#dP3", T.repo, T.in3, { scale: 1 }, { scale: 1.05 });
    IN("#dB3a", T.repo, { r: -4 });
    const win = doodle("#dB3svg", rect(130, 560, 820, 460), "dk", 7), bar = doodle("#dB3svg", [[130, 640], [950, 646]], "dk", 4);
    const dots = doodle("#dB3svg", [...ell(180, 600, 12, 12, 1, 8), ...ell(220, 600, 12, 12, 1, 8)], "do", 2);
    draw(win, T.repo, .6); draw(bar, T.repo + .4, .3); draw(dots, T.repo + .5, .2);
    tl.set("#dRn", { clipPath: "inset(-30% 100% -30% 0%)" }, 0); type("#dRn", T.repo + .6, .7); IN("#dB3b", T.sakhte - .5, { dy: 16, dx: 0 });
    const st = doodle("#dB3svg", star(450, 1230, 110, 46), "do", 6); draw(st, T.sakhte - .3, .5); count("#dStar", T.sakhte - .2, 1.0, 0, 502);
    swipeOut("#dB3", T.in3 - .2);
    // B4: the name, a zigzag underline, sparkles
    scene("#dB4", 20.5, T.ye + .1); swipeIn("#dB4", 20.5); drift("#dP4", 20.5, T.ye, { scale: 1 }, { scale: 1.06 });
    IN("#dB4k", 20.6, { dy: 20, dx: 0 }); IN("#dB4f", T.founder - .05, { s: 1.2, dx: 0 }); IN("#dB4s", T.skills - .03, { s: 1.2, dx: 0 });
    const zig = doodle("#dB4svg", [[160, 960], [270, 920], [380, 970], [490, 925], [600, 970], [710, 925], [820, 965], [920, 930]], "do", 6); draw(zig, T.skills + .25, .35);
    const s1 = doodle("#dB4svg", star(150, 470, 60, 22), "dk", 4), s2 = doodle("#dB4svg", star(940, 860, 50, 20), "dk", 4), cs = doodle("#dB4svg", star(540, 1210, 150, 40), "do", 8);
    draw(s1, T.skills + .4, .3); draw(s2, T.skills + .55, .3); draw(cs, 20.7, .6);
    // B5: thirteen sticky notes, the count circled
    scene("#dB5", T.ye - .25, T.az + .1); swipeIn("#dB5", T.ye - .25); drift("#dP5", T.ye, T.az, { scale: 1 }, { scale: 1.05 });
    IN("#dB5a", T.ye, { r: -3 }); count("#dN13", 22.6, 1.75, 0, 13);
    SKILLS.forEach((s, i) => tl.fromTo("#dS" + i, { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .3, ease: "back.out(2.2)" }, 22.62 + i * .13));
    const circ = doodle("#dB5svg", ell(230, 370, 170, 140, 1.15), "do", 8); draw(circ, T.n13, .5);
    IN("#dB5b", T.eskil2 - .1, { dy: 20, dx: 0, r: -2 });
    // B6: two notes, a hand-drawn arrow between
    scene("#dB6", T.az - .2, 30); swipeIn("#dB6", T.az - .2); drift("#dP6", T.az, 30, { scale: 1 }, { scale: 1.05 });
    tl.fromTo("#dN1", { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, ease: "back.out(1.8)" }, T.az - .15);
    const arr = doodle("#dB6svg", [[540, 720], [640, 850], [460, 960], [540, 1070]], "do", 8), ah = doodle("#dB6svg", [[480, 1020], [540, 1078], [600, 1018]], "do", 5);
    draw(arr, T.etebar + 1.1, 1.5); draw(ah, T.reghaba - .3, .25);
    tl.fromTo("#dN2", { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, ease: "back.out(1.8)" }, T.reghaba);
  },
};
