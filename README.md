# TempoAthletics

Brand site and online store for TempoAthletics. Static HTML/CSS/JS with one Vercel serverless function for Stripe checkout.

## Pages
- `index.html` — hero, Drop 01, fit room, brand story, Drop 02 signup
- `product.html?id=<product-id>` — product page with size picker, size chart, add to cart
- `checkout.html` — shipping form + order summary, hands off to Stripe Checkout
- `success.html` — order confirmation

Brand story and vision copy: see `BRAND.md`.

## Adding or editing products
Everything lives in `data/products.json`. To add a new piece:
1. Put photos in `assets/products/` (front + back works best).
2. Add an entry with `"status": "available"` (or `"soon"` to show it as a teaser).
3. Prices in the JSON are what Stripe charges — the server reads them directly, the browser can't change them.

Shipping rules (`freeShippingThreshold`, `flatShipping`) are at the top of the same file.

## Payments (Stripe)
1. Create a Stripe account and copy the secret key.
2. In Vercel: Project > Settings > Environment Variables, add `STRIPE_SECRET_KEY` (`sk_test_...` to test, `sk_live_...` to go live).
3. Optional: `SITE_URL=https://yourdomain.com`.
4. Redeploy.

Until the key is set, checkout runs in test mode: the order goes through to the confirmation page and no card is charged.

## Fit room
`js/fitroom.js` draws illustrated men's and women's fit models (XS–XXL builds, 4'10"–6'6", six skin tones, front/back) wearing Drop 01. When photoshoot images are ready, they can replace or sit alongside the lineup in `index.html`.

## Newsletter
The Drop 02 signup currently saves to the visitor's browser only. Connect it to Mailchimp, Klaviyo or similar before launch.

## Run locally
```
python3 -m http.server 8000
```
Open http://localhost:8000. (The `/api/checkout` function only runs on Vercel or with `vercel dev`.)
