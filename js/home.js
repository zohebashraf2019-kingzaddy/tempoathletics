/* Home page: Drop grid, fit room photos + size guide, signup */
(function () {
  const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
  const PHOTOS = {
    m: { front: "assets/lookbook/mens-front.jpg", back: "assets/lookbook/mens-back.jpg" },
    f: { front: "assets/lookbook/womens-front.jpg", back: "assets/lookbook/womens-back.jpg" },
  };
  function fitVerdict(d) {
    return [
      { t: "Too tight", p: "Two sizes under your usual. Size up for the cut as designed." },
      { t: "Fitted", p: "Closer through the chest and hip, sleeves end at the wrist bone. Good if you like a compression feel." },
      { t: "True to size", p: "Relaxed through the body with room to swing your arms, the way Drop 01 was cut." },
      { t: "Oversized", p: "Boxier body and longer sleeves that stack at the wrist. Great for a streetwear look." },
      { t: "Very oversized", p: "Sleeves run past the wrist and the shorts sit loose. Size down for running." },
    ][Math.max(-2, Math.min(2, d)) + 2];
  }

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

  // ---------- Fit room builder ----------
  const params = new URLSearchParams(location.search);
  const startSize = SIZES.indexOf((params.get("size") || "M").toUpperCase());
  const st = { sex: "m", body: 2, size: startSize >= 0 ? startSize : 2, view: "front" };

  const segFill = (key, labels) => {
    document.querySelector(`[data-ctl="${key}"]`).innerHTML = labels
      .map((l, i) => `<button type="button" data-v="${i}" aria-pressed="false">${l}</button>`).join("");
  };
  segFill("body", SIZES);
  segFill("size", SIZES);
  function draw() {
    const img = document.querySelector("[data-stage]");
    img.src = PHOTOS[st.sex][st.view];
    img.alt = `${st.sex === "m" ? "Men's" : "Women's"} model wearing Drop 01, ${st.view} view`;
    document.querySelectorAll("[data-ctl]").forEach((group) => {
      const key = group.dataset.ctl;
      group.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === String(st[key]))));
    });
    document.querySelectorAll("[data-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === st.view)));
    const v = fitVerdict(st.size - st.body);
    document.querySelector("[data-readout]").innerHTML =
      `<strong>${v.t}</strong><p>Ordering ${SIZES[st.size]} when you usually wear ${SIZES[st.body]}. ${v.p}</p>`;
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
