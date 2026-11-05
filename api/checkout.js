// Vercel serverless function: POST /api/checkout
// Creates a Stripe Checkout Session from the cart. Prices come from data/products.json
// on the server, never from the browser, so customers can't change what they pay.
//
// Setup: in Vercel > Project > Settings > Environment Variables add
//   STRIPE_SECRET_KEY = sk_test_... (use sk_live_... when you go live)
// Without it, this returns { demo: true } and the site runs a test checkout.

const catalog = require("../data/products.json");

function encode(obj, prefix = "", out = []) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v !== null && typeof v === "object") encode(v, key, out);
    else if (v !== undefined) out.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return out.join("&");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(501).json({ demo: true, error: "Payments are not connected yet." });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const items = Array.isArray(body.items) ? body.items : [];
  const customer = body.customer || {};

  const line_items = [];
  let subtotal = 0;
  for (const it of items.slice(0, 30)) {
    const p = catalog.products.find((x) => x.id === it.id && x.status === "available");
    const qty = Math.max(1, Math.min(10, parseInt(it.qty, 10) || 0));
    if (!p || !p.sizes.includes(it.size)) return res.status(400).json({ error: "Your cart has an item that's no longer available." });
    subtotal += p.price * qty;
    line_items.push({
      quantity: qty,
      price_data: {
        currency: catalog.currency,
        unit_amount: Math.round(p.price * 100),
        product_data: { name: `${p.name} (${it.size})`, metadata: { product_id: p.id, size: it.size } },
      },
    });
  }
  if (!line_items.length) return res.status(400).json({ error: "Your cart is empty." });

  const shipping = subtotal >= catalog.freeShippingThreshold ? 0 : catalog.flatShipping;
  const origin = process.env.SITE_URL || `https://${req.headers["x-forwarded-host"] || req.headers.host}`;

  const params = {
    mode: "checkout",
    success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout.html`,
    customer_email: customer.email || undefined,
    shipping_address_collection: { allowed_countries: { 0: "US" } },
    shipping_options: {
      0: {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: shipping ? "Standard shipping" : "Free shipping",
          fixed_amount: { amount: Math.round(shipping * 100), currency: catalog.currency },
        },
      },
    },
    metadata: { customer_name: `${customer.first || ""} ${customer.last || ""}`.trim() },
  };
  params.line_items = Object.fromEntries(line_items.map((li, i) => [i, li]));
  const flat = params;

  try {
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: encode(flat),
    });
    const session = await r.json();
    if (!r.ok) return res.status(502).json({ error: session.error ? session.error.message : "Stripe error." });
    return res.status(200).json({ url: session.url });
  } catch (e) {
    return res.status(502).json({ error: "Couldn't reach the payment provider." });
  }
};
