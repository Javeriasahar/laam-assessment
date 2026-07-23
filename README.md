# Purchase Confidence — LAAM Full-Stack Assessment

A small Next.js app that helps a customer decide, on a single product page, whether to trust a purchase — not just look at it.

## 1. Problem Understanding

The brief describes a real drop-off pattern: someone likes a product but hesitates because they can't quickly answer "will this actually work out for me?" — is my size there, will the price hold, will it arrive on time, is there something safer if not.

I interpreted this as a **trust/risk-assessment problem**, not a browsing or search problem. So instead of building more discovery (filters, search, category pages), I built one product page that does the opposite of the usual pattern of scattering size charts, delivery estimates, and stock badges around the page for the customer to mentally reconcile themselves. It computes a single, explained **Purchase Confidence Score** live, as the customer changes size or delivery location, and — critically — proactively suggests better alternatives the moment the score drops, instead of waiting for the customer to give up and search themselves.

## 2. Scope

**Built:**
- Product detail page: images, price (with discount/original price), size selector with live stock states, delivery zone selector with historical on-time rate
- A backend-computed Purchase Confidence Score (0–100) with a breakdown of why — stock, delivery reliability, price stability, and a returns/COD safety net
- Automatic "similar alternatives" suggestions when confidence is not high, ranked by whether the customer's preferred size is actually in stock elsewhere
- A minimal home page linking into 7 seeded products across 2 categories, so the alternatives logic has real matches to work with

**Intentionally not built:**
- Cart, checkout, payments, auth — out of scope per the brief, and would dilute the 3–4hr budget away from the actual ask
- Search/filter/category browse — the brief's pain point is about decision confidence on a product already found, not discovery
- Real user accounts, saved addresses, actual pincode lookup — used a simplified 3-tier delivery zone selector (same city / major city / remote) instead of a real geocoding integration
- Real image assets — used generated editorial "fabric look card" SVG illustrations (framed swatch + pattern detail crop, styled per product's fabric/print type) instead of licensed photography, so the demo doesn't depend on external image hosting

## 3. User Flow

1. Customer lands on a product page (from the home grid, or a direct link)
2. They pick a size — stock count and low-stock warnings show inline on the size chip itself
3. They pick a delivery zone — historical on-time delivery rate for that zone appears
4. The Confidence Score panel updates automatically (calls `/api/products/:id/confidence`), showing a score, a plain-language verdict, and a **"Why?" breakdown** — a short, scannable list of the factors behind the number (e.g. "Size M is unavailable," "Alternative sizes available," "Delivery expected in 2–4 days," "Final price shown"), so the score never feels arbitrary
5. If confidence is medium or low, a "You might also like" section appears below with alternatives that are more likely to satisfy the same intent (same category, overlapping style tags, preferring ones where the same size is actually in stock)
6. Customer either proceeds (Add to Cart is enabled once a size is picked) or pivots to an alternative — either way, the decision is now informed rather than a guess

## 4. Technical Approach

**Frontend:** Next.js App Router, all client interactivity isolated to a single `ProductClient` component that owns size/zone state and re-fetches confidence on change. Server components handle initial product fetch + static generation (`generateStaticParams` pre-renders all 7 product pages).

**Backend:** Next.js API routes, no separate server needed.
- `GET /api/products` — listing summary
- `GET /api/products/:id` — full product detail
- `GET /api/products/:id/confidence?size=M&zone=major_city` — computes score + alternatives server-side, so the scoring logic (and its weights) never ships to the client

**Data model** (`lib/types.ts`): `Product` → `Variant[]` (size/stock), `PricePoint[]` (price history, used for volatility detection), `DeliveryZone[]` (per-zone historical on-time rate). Seed data lives in `data/seed.ts` — no real database; the assignment explicitly allows in-memory/mock data, and a DB would add setup friction without adding signal for this exercise.

**Confidence scoring** (`lib/confidence.ts`) — the one piece of invented business logic, so I made the weighting explicit and documented in the code itself:
- Stock/availability: 35 pts — biggest single driver of a failed order
- Delivery reliability: 30 pts — directly answers "can I trust the promise"
- Price stability: 20 pts — recent volatility signals the price shown might not hold
- Returns/COD safety net: 15 pts — reduces the cost of being wrong

One rule overrides the weighted total: if the selected size is fully out of stock, the level is forced to "low" regardless of how well the other factors score. A weighted average alone would let strong delivery/price numbers mask an unbuyable item as "medium confidence" — see the AI Usage section below, this was caught by testing, not designed upfront.

**Key assumptions:**
- Delivery "zones" are a simplified stand-in for real address-based ETA calculation
- Price history is a short static array per product (not a live pricing feed)
- No persistence/writes — this is a read-heavy decision-support surface, not a transactional one

## 5. How to Run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Product pages: `/product/p1` through `/product/p7`.

To run the test suite:
```bash
npm test
```

To build for production:
```bash
npm run build && npm start
```

**Note on dependencies:** `better-sqlite3` was tried first but its native build step failed in my sandboxed dev environment (blocked download of Node headers). Rather than fight the sandbox, I switched to plain in-memory/TS seed data, which the assignment explicitly permits and which removes a native-compile step for anyone reviewing this. See `AI_AUDIT.md` for the full trail.

## 6. Tests

Added unit tests for `lib/confidence.ts` (`lib/__tests__/confidence.test.ts`) — 13 tests covering:
- High confidence when everything checks out
- Low-stock (not zero) produces a warning, not a hard block
- Out-of-stock forces "low" confidence regardless of other factors — this is a regression test for a real bug I caught during manual testing (see AI Usage)
- Poor delivery reliability and price volatility are flagged correctly
- COD/returns safety-net scoring
- Score always stays within 0–100 across every product/size/zone combination
- Alternatives are same-category, exclude the current product, prefer in-stock sizes, and respect the requested limit

I prioritized testing the scoring engine because it's the one part of the app with actual decision logic and the highest cost of a silent bug — a wrong "high confidence" verdict is the worst possible failure mode for this product.

**What I'd test next if I had more time:**
- API route integration tests (status codes, malformed size/zone query params)
- Component tests for `SizeSelector`/`DeliverySelector` (disabled state on 0 stock, selection callbacks)
- E2E test of the full flow: land on page, pick size, see score change, click alternative

## 7. Tradeoffs

- In-memory data over a real DB: faster to set up and review, at the cost of no persistence — acceptable since nothing in this app is written, only read
- 3 delivery zones instead of real geocoding: keeps the demo self-contained, at the cost of realism
- 7 seed products instead of a real catalog: enough to demonstrate alternatives-matching working correctly (same category, tag overlap, stock-aware ranking) without spending time on a scraper or larger dataset
- No auth/cart: the "Add to Cart" button is inert by design — building a real cart would have traded time away from the actual ask (confidence, not commerce)
- SVG "look card" images instead of licensed photography: avoids depending on external image hosting or stock photo licensing inside a timed assessment, while still giving each product a distinct, on-brand visual identity (pattern style matched to fabric type, brand mark, fabric label)

## 8. Future Improvements

- Real geocoding for delivery estimates instead of 3 static zones
- A/B-testable confidence weights, informed by actual conversion data (the 35/30/20/15 split is a reasonable starting hypothesis, not a measured one)
- Persist the confidence factors customers actually see so a "we told you this might sell out" moment can be surfaced later (trust-building)
- Real image assets and a proper catalog/search layer, since this app assumes the customer already found the product
- Move confidence computation to be cacheable per (product, size, zone) tuple rather than computed on every request, if traffic scales

## 9. AI Usage

I used Claude (Anthropic), in an interactive chat with code execution not a single generate-and-ship prompt.

**What Claude helped with:**
- Scoping conversation: I was asked to choose between narrower and broader interpretations of the confidence-score feature before any code was written
- Design direction, following an internal design-system process to avoid generic "AI-template" visual output (deliberately avoided the common cream-background/serif/terracotta-accent look in favor of an editorial deep-green/rose/bronze palette suited to a South Asian fashion marketplace)

**A concrete example of correcting AI output:** While manually testing the API (`curl .../p3/confidence?size=M&zone=major_city`), I noticed a real logic bug: the weighted scoring formula let a product with zero stock in the selected size still land at a "medium confidence" (65/100) because delivery and price factors were strong enough to offset the stock penalty. That's a serious flaw for this specific product — no amount of delivery reliability makes an unbuyable item worth recommending as "medium confidence." I had Claude add an override rule (out-of-stock forces `level = "low"` regardless of the weighted score) and wrote a dedicated regression test for it. A second, smaller issue from the same testing pass: the "alternatives" list came back empty for the out-of-stock kurta because the seed data only had one product in that category — a second kurta was added to the seed set so the alternatives logic had something real to recommend.
