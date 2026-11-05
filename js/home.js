/* Home page: Drop grid, fit room lineup + builder, signup */
(function () {
  const { fitSVG, fitVerdict, SIZES, TONES, fmtHeight } = window.TempoFit;

  // ---------- Drop grid ----------
  document.addEventListener("catalog:ready", (e) => {
    const cat = e.detail;
    const live = cat.products.filter((p) => p.status === "available");
    const soon = cat.products.filter((p) => p.status === "soon");
    document.querySelector("[data-drop-grid]").innerHTML = live.map((p, i) => `
      <a class="product-card" href="product.html?id=${p.id}">
        <div class="frame">
          <span class="item-no">0${p.drop}.${i + 1}</span>
          <img class="main" src="${p.images[0]}" alt="${p.name}, front" loading="lazy">
          ${p.images[1] ? `<img class="alt" src="${p.images[1]}" alt="" loading="lazy">` : ""}
        </div>
        <div class="meta"><span class="name">${p.name}</span><span class="price">${Tempo.money(p.price)}</span></div>
        <div class="sub">${p.color}. ${p.summary}</div>
      </a>`).join("");
    document.querySelector("[data-soon-row]").innerHTML = soon.map((p) => `
      <div class="soon-card">
        <img src="assets/logos/tempo-star-black.png" alt="">
        <div>
          <span class="soon-tag">Drop 0${p.drop}, coming soon</span>
          <div class="name">${p.name}</div>
          <p>${p.summary}</p>
        </div>
      </div>`).join("");
  });

  // ---------- Fit room lineup ----------
  const LINEUP = [
    { name: "Marcus", sex: "m", body: 2, size: 2, height: 71, tone: 3 },
    { name: "Jay", sex: "m", body: 1, size: 2, height: 68, tone: 1 },
    { name: "Dre", sex: "m", body: 4, size: 4, height: 74, tone: 5 },
    { name: "Ava", sex: "f", body: 0, size: 0, height: 62, tone: 0 },
    { name: "Sofia", sex: "f", body: 2, size: 2, height: 66, tone: 2 },
    { name: "Nia", sex: "f", body: 3, size: 3, height: 69, tone: 4 },
  ];
  document.querySelector("[data-lineup]").innerHTML = LINEUP.map((m) => `
    <figure>
      ${fitSVG({ ...m, label: `${m.name}, ${fmtHeight(m.height)}, wearing size ${SIZES[m.size]}` })}
      <figcaption><b>${m.name}</b>${fmtHeight(m.height)}, ${SIZES[m.body]} build<br>wears ${SIZES[m.size]}</figcaption>
    </figure>`).join("");

  // ---------- Fit room builder ----------
  const params = new URLSearchParams(location.search);
  const startSize = SIZES.indexOf((params.get("size") || "M").toUpperCase());
  const st = { sex: "m", body: 2, size: startSize >= 0 ? startSize : 2, tone: 2, height: 70, view: "front" };

  const segFill = (key, labels) => {
    document.querySelector(`[data-ctl="${key}"]`).innerHTML = labels
      .map((l, i) => `<button type="button" data-v="${i}" aria-pressed="false">${l}</button>`).join("");
  };
  segFill("body", SIZES);
  segFill("size", SIZES);
  document.querySelector('[data-ctl="tone"]').innerHTML = TONES
    .map((t, i) => `<button type="button" data-v="${i}" style="background:${t}" aria-label="Skin tone ${i + 1}" aria-pressed="false"></button>`).join("");

  function draw() {
    document.querySelector("[data-stage]").innerHTML = fitSVG({ ...st, label: `Fit model wearing size ${SIZES[st.size]}` });
    document.querySelectorAll("[data-ctl]").forEach((group) => {
      const key = group.dataset.ctl;
      group.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === String(st[key]))));
    });
    document.querySelectorAll("[data-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === st.view)));
    document.querySelector("[data-height-out]").textContent = fmtHeight(st.height);
    const v = fitVerdict(st.size - st.body);
    document.querySelector("[data-readout]").innerHTML =
      `<strong>${v.t}</strong><p>Size ${SIZES[st.size]} on a ${SIZES[st.body]} build. ${v.p}</p>`;
  }

  document.querySelectorAll("[data-ctl]").forEach((group) => {
    group.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const key = group.dataset.ctl;
      st[key] = key === "sex" ? b.dataset.v : parseInt(b.dataset.v, 10);
      draw();
    });
  });
  document.querySelector("[data-ctl-height]").addEventListener("input", (e) => { st.height = parseInt(e.target.value, 10); draw(); });
  document.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => { st.view = b.dataset.view; draw(); }));
  draw();

  // ---------- Signup ----------
  const form = document.querySelector("[data-signup]");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector("input");
    const msg = document.querySelector("[data-signup-msg]");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
      msg.textContent = "Enter an email like name@example.com.";
      input.focus();
      return;
    }
    try {
      const list = JSON.parse(localStorage.getItem("tempo-list") || "[]");
      list.push(input.value.trim());
      localStorage.setItem("tempo-list", JSON.stringify(list));
    } catch (err) {}
    msg.textContent = "You're on the list. We'll email you before Drop 02.";
    form.reset();
  });
})();
