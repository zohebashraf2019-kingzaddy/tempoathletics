/* TempoAthletics — shared shell: header, footer, catalog, cart drawer */
(function () {
  const CART_KEY = "tempo-cart-v1";
  const state = { catalog: null };

  // ---------- Catalog ----------
  async function loadCatalog() {
    if (state.catalog) return state.catalog;
    const res = await fetch("data/products.json", { cache: "no-cache" });
    state.catalog = await res.json();
    return state.catalog;
  }
  const money = (n) => "$" + Number(n).toFixed(2).replace(/\.00$/, "");
  const findProduct = (id) => state.catalog && state.catalog.products.find((p) => p.id === id);

  // ---------- Cart storage ----------
  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; }
  }
  function writeCart(items) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) {}
    renderCart();
    document.dispatchEvent(new CustomEvent("cart:change", { detail: items }));
  }
  function addToCart(id, size, qty = 1) {
    const items = readCart();
    const hit = items.find((i) => i.id === id && i.size === size);
    if (hit) hit.qty = Math.min(10, hit.qty + qty);
    else items.push({ id, size, qty });
    writeCart(items);
  }
  function setQty(id, size, qty) {
    let items = readCart();
    if (qty <= 0) items = items.filter((i) => !(i.id === id && i.size === size));
    else items.forEach((i) => { if (i.id === id && i.size === size) i.qty = Math.min(10, qty); });
    writeCart(items);
  }
  function clearCart() { writeCart([]); }

  function totals(items) {
    const c = state.catalog;
    const subtotal = items.reduce((s, i) => {
      const p = findProduct(i.id);
      return p ? s + p.price * i.qty : s;
    }, 0);
    const shipping = subtotal === 0 || subtotal >= c.freeShippingThreshold ? 0 : c.flatShipping;
    return { subtotal, shipping, total: subtotal + shipping, count: items.reduce((s, i) => s + i.qty, 0) };
  }

  // ---------- Shell ----------
  function header(active) {
    const link = (href, label, key) =>
      `<a href="${href}"${active === key ? ' aria-current="page"' : ""}>${label}</a>`;
    return `
    <header class="site-header">
      <div class="wrap">
        <a class="brand" href="index.html" aria-label="TempoAthletics home">
          <img src="assets/logos/tempo-runner-wordmark-white.png" alt="Tempo" width="88" height="34">
        </a>
        <nav class="nav" aria-label="Main">
          ${link("index.html#drop", "Drop 01", "drop")}
          ${link("index.html#fit-room", "Fit room", "fit")}
          ${link("index.html#story", "Our story", "story")}
        </nav>
        <button class="cart-btn" type="button" data-open-cart aria-label="Open cart">
          Cart <span class="cart-count" data-cart-count>0</span>
        </button>
      </div>
    </header>`;
  }

  function footer() {
    return `
    <footer class="site-footer">
      <div class="wrap">
        <img src="assets/logos/tempo-oval-white.png" alt="Tempo" width="77" height="40">
        <nav aria-label="Footer">
          <a href="index.html#drop">Shop</a>
          <a href="index.html#fit-room">Fit room</a>
          <a href="index.html#story">Our story</a>
          <a href="mailto:hello@tempoathletics.com">Contact</a>
        </nav>
        <span>© ${new Date().getFullYear()} TempoAthletics. Catch up. Find your rhythm.</span>
      </div>
    </footer>`;
  }

  function drawer() {
    return `
    <div class="drawer-scrim" data-close-cart></div>
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden="true">
      <div class="drawer-head">
        <h2 id="cart-title" class="display">Your cart</h2>
        <button class="icon-btn" type="button" data-close-cart aria-label="Close cart">×</button>
      </div>
      <div class="drawer-body" data-cart-body></div>
      <div class="drawer-foot" data-cart-foot></div>
    </aside>
    <div class="toast" role="status" aria-live="polite" data-toast></div>`;
  }

  function lineItemHTML(i, editable) {
    const p = findProduct(i.id);
    if (!p) return "";
    return `
      <div class="line-item">
        <img src="${p.images[0]}" alt="">
        <div>
          <div class="li-name">${p.name}</div>
          <div class="li-sub">${p.color}, size ${i.size}</div>
          ${editable ? `
          <div class="qty" aria-label="Quantity">
            <button type="button" data-qty="${i.id}|${i.size}|${i.qty - 1}" aria-label="Decrease quantity">−</button>
            <span>${i.qty}</span>
            <button type="button" data-qty="${i.id}|${i.size}|${i.qty + 1}" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="remove" data-qty="${i.id}|${i.size}|0">Remove</button>` : `<div class="li-sub">Qty ${i.qty}</div>`}
        </div>
        <div><strong>${money(p.price * i.qty)}</strong></div>
      </div>`;
  }

  function renderCart() {
    if (!state.catalog) return;
    const items = readCart();
    const t = totals(items);
    document.querySelectorAll("[data-cart-count]").forEach((el) => (el.textContent = t.count));
    const body = document.querySelector("[data-cart-body]");
    const foot = document.querySelector("[data-cart-foot]");
    if (!body) return;
    if (!items.length) {
      body.innerHTML = `
        <div class="empty">
          <img src="assets/logos/tempo-runner-black.png" alt="">
          <p><strong>Your cart is empty.</strong><br>Drop 01 is live. Catch up.</p>
          <a class="btn btn-solid-dark" href="index.html#drop" data-close-cart>Shop Drop 01</a>
        </div>`;
      foot.innerHTML = "";
      return;
    }
    body.innerHTML = items.map((i) => lineItemHTML(i, true)).join("");
    const left = state.catalog.freeShippingThreshold - t.subtotal;
    const pct = Math.min(100, (t.subtotal / state.catalog.freeShippingThreshold) * 100);
    foot.innerHTML = `
      <div class="ship-meter">
        ${left > 0 ? `${money(left)} away from free shipping` : "Free shipping unlocked"}
        <div class="bar"><span style="width:${pct}%"></span></div>
      </div>
      <div class="totals">
        <div><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
        <div><span>Shipping</span><span>${t.shipping ? money(t.shipping) : "Free"}</span></div>
        <div class="grand"><span>Total</span><span>${money(t.total)}</span></div>
      </div>
      <a class="btn btn-solid-dark btn-block" href="checkout.html">Check out</a>`;
  }

  function openCart() {
    document.body.classList.add("cart-open");
    document.querySelector(".drawer").setAttribute("aria-hidden", "false");
    setTimeout(() => document.querySelector(".drawer .icon-btn").focus(), 50);
  }
  function closeCart() {
    document.body.classList.remove("cart-open");
    document.querySelector(".drawer").setAttribute("aria-hidden", "true");
  }
  let toastTimer;
  function toast(msg) {
    const el = document.querySelector("[data-toast]");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  async function init() {
    const active = document.body.dataset.page || "";
    document.body.insertAdjacentHTML("afterbegin", header(active));
    if (!document.body.hasAttribute("data-no-footer")) document.body.insertAdjacentHTML("beforeend", footer());
    document.body.insertAdjacentHTML("beforeend", drawer());

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-open-cart]")) { e.preventDefault(); openCart(); }
      else if (e.target.closest("[data-close-cart]")) { closeCart(); }
      const q = e.target.closest("[data-qty]");
      if (q) { const [id, size, n] = q.dataset.qty.split("|"); setQty(id, size, parseInt(n, 10)); }
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

    await loadCatalog();
    renderCart();
    document.dispatchEvent(new CustomEvent("catalog:ready", { detail: state.catalog }));
  }

  window.Tempo = { loadCatalog, findProduct, readCart, addToCart, setQty, clearCart, totals, money, openCart, toast, lineItemHTML, get catalog() { return state.catalog; } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
