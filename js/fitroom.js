/* TempoAthletics Fit Room
   Draws illustrated fit models (men's and women's, XS–XXL builds, any height)
   wearing Drop 01: the Pace Mesh Long Sleeve and the Catch Up Split Short.
   Swap for real photoshoot images as they come in — see README. */
(function () {
  const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
  const K = [0.88, 0.94, 1, 1.08, 1.17, 1.27];
  const TONES = ["#f3d3b8", "#e0b18e", "#c68e66", "#9a6646", "#6e4630", "#47301f"];
  const HAIR = "#161616";

  // Mesh patterns live once in the document so every figure can use them.
  function ensureDefs() {
    if (document.getElementById("tempo-defs")) return;
    document.body.insertAdjacentHTML("beforeend", `
      <svg id="tempo-defs" width="0" height="0" style="position:absolute" aria-hidden="true">
        <defs>
          <pattern id="mesh-dark" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="#0a0a0a"/><circle cx="2" cy="2" r="0.9" fill="#3a3a3a"/>
          </pattern>
          <pattern id="mesh-light" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="#e9e9e6"/><circle cx="2" cy="2" r="0.9" fill="#b9b9b5"/>
          </pattern>
        </defs>
      </svg>`);
  }

  const mx = (x) => 300 - x; // mirror across center line x=150

  function measure(sex, bi) {
    const k = K[bi];
    const base = sex === "m"
      ? { S: 56, C: 48, W: 39, H: 42, arm: 13.5, thigh: 21, calf: 14, neck: 11, head: 24, waistY: 226 }
      : { S: 46, C: 43, W: 31, H: 46, arm: 11, thigh: 20.5, calf: 12.5, neck: 9, head: 22.5, waistY: 214 };
    return {
      ...base,
      S: base.S * k,
      C: base.C * Math.pow(k, 1.15),
      W: base.W * Math.pow(k, 1.55),
      H: base.H * Math.pow(k, 1.2),
      arm: base.arm * Math.pow(k, 1.25),
      thigh: base.thigh * Math.pow(k, 1.3),
      calf: base.calf * Math.pow(k, 1.1),
      neck: base.neck * Math.pow(k, 0.8),
    };
  }

  // Joint positions shared by body and garments
  function skeleton(m) {
    const shoulder = [150 - m.S + 7, 128];
    const elbow = [150 - m.S - 7, 232];
    const wrist = [150 - m.S - 11, 328];
    const legX = m.H * 0.5 + 1;
    const hip = [150 - legX, 290];
    const knee = [150 - legX * 0.82, 428];
    const ankle = [150 - legX * 0.74, 562];
    return { shoulder, elbow, wrist, hip, knee, ankle };
  }

  function torsoPath(m) {
    const hipY = 268, crotchY = 312;
    const L = [
      [150 - m.neck, 90],
      [`C ${150 - m.neck} 100 ${150 - m.S + 12} 101 ${150 - m.S} 113`],
      [`C ${150 - m.S - 3} 126 ${150 - m.C} 136 ${150 - m.C} 160`],
      [`C ${150 - m.C} 188 ${150 - m.W} 198 ${150 - m.W} ${m.waistY}`],
      [`C ${150 - m.W} 246 ${150 - m.H} 250 ${150 - m.H} ${hipY}`],
      [`L ${150 - m.H + 1} ${crotchY}`],
    ];
    // build left side, then mirror the right side back up
    let d = `M ${L[0][0]} ${L[0][1]} ` + L.slice(1).map((s) => s[0]).join(" ");
    d += ` L ${mx(150 - m.H + 1)} ${crotchY} L ${mx(150 - m.H)} ${hipY}`;
    d += ` C ${mx(150 - m.H)} 250 ${mx(150 - m.W)} 246 ${mx(150 - m.W)} ${m.waistY}`;
    d += ` C ${mx(150 - m.W)} 198 ${mx(150 - m.C)} 188 ${mx(150 - m.C)} 160`;
    d += ` C ${mx(150 - m.C)} 136 ${mx(150 - m.S - 3)} 126 ${mx(150 - m.S)} 113`;
    d += ` C ${mx(150 - m.S + 12)} 101 ${mx(150 - m.neck)} 100 ${mx(150 - m.neck)} 90 Z`;
    return d;
  }

  const line = (a, b, w, color, cap = "round") =>
    `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${color}" stroke-width="${w}" stroke-linecap="${cap}"/>`;
  const both = (fn) => fn(false) + fn(true); // draw left side and its mirror
  const P = (p, mirror) => (mirror ? [mx(p[0]), p[1]] : p);

  function bodySVG(m, sex, tone, sk) {
    let s = "";
    // legs
    s += both((r) => line(P(sk.hip, r), P(sk.knee, r), m.thigh * 2, tone) + line(P(sk.knee, r), P(sk.ankle, r), m.calf * 2, tone));
    // shoes — black runners with white sole
    s += both((r) => {
      const a = P(sk.ankle, r), dir = r ? 1 : -1;
      const x = a[0] + dir * 5;
      return `<g><ellipse cx="${x}" cy="${a[1] + 22}" rx="21" ry="11" fill="#000"/>
        <path d="M ${x - 21} ${a[1] + 25} Q ${x} ${a[1] + 36} ${x + 21} ${a[1] + 25}" stroke="#fff" stroke-width="3" fill="none"/></g>`;
    });
    // torso, neck, head
    s += `<path d="${torsoPath(m)}" fill="${tone}"/>`;
    s += `<rect x="${150 - m.neck}" y="70" width="${m.neck * 2}" height="30" fill="${tone}"/>`;
    s += `<circle cx="150" cy="54" r="${m.head}" fill="${tone}"/>`;
    // hair
    if (sex === "m") {
      s += `<path d="M ${150 - m.head} 52 C ${150 - m.head} 22 ${150 + m.head} 22 ${150 + m.head} 52 C ${150 + m.head - 6} 40 ${150 - m.head + 6} 40 ${150 - m.head} 52 Z" fill="${HAIR}"/>`;
    } else {
      s += `<path d="M ${150 - m.head - 2} 60 C ${150 - m.head - 4} 18 ${150 + m.head + 4} 18 ${150 + m.head + 2} 60 C ${150 + m.head - 6} 42 ${150 - m.head + 6} 42 ${150 - m.head - 2} 60 Z" fill="${HAIR}"/>`;
      s += `<circle cx="150" cy="${54 - m.head - 6}" r="11" fill="${HAIR}"/>`;
    }
    // headphones — the mascot's signature
    s += `<path d="M ${150 - m.head - 3} 56 C ${150 - m.head - 3} 18 ${150 + m.head + 3} 18 ${150 + m.head + 3} 56" stroke="#000" stroke-width="4" fill="none"/>`;
    s += `<rect x="${150 - m.head - 8}" y="46" width="10" height="20" rx="4" fill="#000"/><rect x="${150 + m.head - 2}" y="46" width="10" height="20" rx="4" fill="#000"/>`;
    // arms + hands
    s += both((r) => line(P(sk.shoulder, r), P(sk.elbow, r), m.arm * 2, tone) + line(P(sk.elbow, r), P(sk.wrist, r), m.arm * 1.7, tone)
      + `<circle cx="${P(sk.wrist, r)[0] - (r ? -1 : 1)}" cy="${sk.wrist[1] + 14}" r="${m.arm * 0.95}" fill="${tone}"/>`);
    return s;
  }

  // Catch Up Split Short (white, mesh panels)
  function shortsSVG(m, gi, bi, sk, view) {
    const gk = K[gi], d = gi - bi;
    const top = 246;
    const half = Math.max(m.H + 2.5, 47 * gk);
    const hem = 352 + (gi - 2) * 4 - Math.min(0, d) * 3;
    const legOuter = half + 6 + Math.max(0, d) * 2;
    const crotch = 318;
    const left = `M ${150 - half} ${top + 10} L ${150 - legOuter} ${hem - 8}
      Q ${150 - legOuter + 4} ${hem + 4} ${150 - legOuter + 18} ${hem + 2}
      L ${150 - 4} ${hem - 6} L 150 ${crotch}`;
    const right = ` L ${mx(150 - 4)} ${hem - 6} L ${mx(150 - legOuter + 18)} ${hem + 2}
      Q ${mx(150 - legOuter + 4)} ${hem + 4} ${mx(150 - legOuter)} ${hem - 8} L ${mx(150 - half)} ${top + 10} Z`;
    let s = `<path d="${left}${right}" fill="#fbfbfa" stroke="#b8b8b4" stroke-width="1.4" stroke-linejoin="round"/>`;
    // mesh panels on the lower legs
    s += both((r) => {
      const p = [[150 - half + 6, top + 50], [150 - legOuter + 4, hem - 12], [150 - legOuter + 18, hem - 2], [150 - 10, hem - 8], [150 - 12, top + 72]]
        .map((pt) => (r ? [mx(pt[0]), pt[1]] : pt));
      return `<polygon points="${p.map((q) => q.join(",")).join(" ")}" fill="url(#mesh-light)" opacity=".95"/>`;
    });
    // split notch + binding
    s += both((r) => { const x = r ? mx(150 - legOuter + 2) : 150 - legOuter + 2; return `<line x1="${x}" y1="${hem - 10}" x2="${x + (r ? -3 : 3)}" y2="${hem - 26}" stroke="#b8b8b4" stroke-width="1.4"/>`; });
    // waistband
    s += `<rect x="${150 - half}" y="${top}" width="${half * 2}" height="13" rx="3" fill="#f2f2f0" stroke="#b8b8b4" stroke-width="1.2"/>`;
    if (view === "front") {
      s += `<path d="M 147 ${top + 13} q -3 14 -6 22 M 153 ${top + 13} q 3 14 6 22" stroke="#c9c9c5" stroke-width="1.6" fill="none"/>`;
      s += `<image href="assets/logos/tempo-runner-black.png" x="${150 - legOuter + 14}" y="${hem - 38}" width="18" height="12"/>`;
      s += `<text x="0" y="0" transform="translate(${mx(150 - legOuter + 16)} ${hem - 22}) rotate(-90)" font-family="Archivo, sans-serif" font-style="italic" font-weight="900" font-size="8" fill="#000">TEMPO</text>`;
    } else {
      s += `<rect x="134" y="${top + 20}" width="32" height="18" rx="2" fill="#fff" stroke="#c9c9c5"/>`;
      s += `<text x="150" y="${top + 31}" text-anchor="middle" font-family="Archivo, sans-serif" font-style="italic" font-weight="900" font-size="6.5">CATCH UP</text>`;
    }
    return s;
  }

  // Pace Mesh Long Sleeve (black, cropped raglan)
  function topSVG(m, gi, bi, sk, view) {
    const gk = K[gi], d = gi - bi;
    const G = Math.max(52 * gk, m.C + 1.5);
    const hemY = 252 + (gi - 2) * 9 + Math.min(0, d) * 4;
    const shoulderX = 150 - Math.max(m.S + 3, G + 2);
    const sleeveW = Math.max(m.arm * 2 + 3, 30 * gk);
    let s = "";
    // sleeves: run past the wrist when oversized, stop short when undersized
    s += both((r) => {
      const sh = P(sk.shoulder, r), el = P(sk.elbow, r), wr = P(sk.wrist, r);
      const t = 1.02 + d * 0.07;
      const end = [el[0] + (wr[0] - el[0]) * t, el[1] + (wr[1] - el[1]) * t];
      const startX = r ? mx(shoulderX) - 9 : shoulderX + 9;
      return line([startX, 131], el, sleeveW, "#0b0b0b") + line(el, end, sleeveW * 0.86, "#0b0b0b", "butt")
        + line([end[0] + (r ? 0 : 0), end[1] - 3], end, sleeveW * 0.86, "#1d1d1d", "butt");
    });
    // body
    const bodyL = `M ${150 - m.neck - 4} 92 C ${150 - m.neck - 10} 104 ${shoulderX + 10} 104 ${shoulderX} 118
      L ${150 - G} 150 C ${150 - G - 1} 190 ${150 - G} 212 ${150 - G + 1} ${hemY}`;
    const bodyR = ` L ${mx(150 - G + 1)} ${hemY} C ${mx(150 - G)} 212 ${mx(150 - G - 1)} 190 ${mx(150 - G)} 150
      L ${mx(shoulderX)} 118 C ${mx(shoulderX + 10)} 104 ${mx(150 - m.neck - 10)} 104 ${mx(150 - m.neck - 4)} 92 Z`;
    s += `<path d="${bodyL}${bodyR}" fill="#0b0b0b"/>`;
    // mesh side panels
    s += both((r) => { const x = r ? mx(150 - G + 1) - 13 : 150 - G + 1; return `<rect x="${x}" y="178" width="13" height="${hemY - 178}" fill="url(#mesh-dark)"/>`; });
    // hem rib
    s += `<rect x="${150 - G + 1}" y="${hemY - 7}" width="${(G - 1) * 2}" height="7" fill="#151515"/>`;
    // raglan seams + collar
    s += both((r) => `<path d="M ${r ? mx(150 - m.neck - 6) : 150 - m.neck - 6} 96 L ${r ? mx(150 - G + 2) : 150 - G + 2} 158" stroke="#2c2c2c" stroke-width="1.5"/>`);
    s += `<path d="M ${150 - m.neck - 5} 93 Q 150 ${view === "front" ? 112 : 99} ${150 + m.neck + 5} 93" stroke="#262626" stroke-width="5" fill="none"/>`;
    // prints
    if (view === "front") {
      const w = G * 1.3;
      s += `<image href="assets/logos/tempo-oval-white.png" x="${150 - w / 2}" y="${146}" width="${w}" height="${w * 0.52}"/>`;
    } else {
      s += `<image href="assets/logos/tempo-runner-white.png" x="140" y="106" width="20" height="14"/>`;
    }
    return s;
  }

  function fitSVG(opts) {
    ensureDefs();
    const o = Object.assign({ sex: "m", body: 2, size: 2, tone: 2, height: 70, view: "front", label: "" }, opts);
    const m = measure(o.sex, o.body);
    const sk = skeleton(m);
    const tone = TONES[o.tone];
    // scale whole figure by height, anchored at the feet; 72" fills the frame
    const sc = o.height / 74;
    const garments = o.view === "front"
      ? shortsSVG(m, o.size, o.body, sk, "front") + topSVG(m, o.size, o.body, sk, "front")
      : shortsSVG(m, o.size, o.body, sk, "back") + topSVG(m, o.size, o.body, sk, "back");
    return `<svg viewBox="0 0 300 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${o.label}">
      <ellipse cx="150" cy="592" rx="70" ry="6" fill="#000" opacity=".08"/>
      <g transform="translate(150 596) scale(${sc}) translate(-150 -596)">
        ${bodySVG(m, o.sex, tone, sk)}
        ${garments}
      </g>
    </svg>`;
  }

  function fitVerdict(d) {
    return [
      { t: "Too tight", p: "Two sizes under this build. Size up for the cut as designed." },
      { t: "Fitted", p: "Closer through the chest and hip, sleeves end at the wrist bone. Good if you like a compression feel." },
      { t: "True to size", p: "Relaxed and cropped the way the Drop 01 pieces were cut. Room to swing your arms." },
      { t: "Oversized", p: "Boxier body and longer sleeves that stack at the wrist. Great for a streetwear look." },
      { t: "Very oversized", p: "Sleeves cover part of the hand and the shorts sit loose. Size down for running." },
    ][Math.max(-2, Math.min(2, d)) + 2];
  }

  const fmtHeight = (h) => `${Math.floor(h / 12)}'${h % 12}"`;

  window.TempoFit = { fitSVG, fitVerdict, SIZES, TONES, fmtHeight };
})();
