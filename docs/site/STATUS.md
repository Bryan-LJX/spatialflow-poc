# Site — status

> Reconciles ARCHITECTURE.md (intent) vs IMPLEMENTATION.md (code). Updated whenever
> code changes what is done (§6.5).

## Headline

🔄 in flight — `add-user-auth-persistence`: email/password auth and per-user
Supabase-backed layout storage are implemented and verified both locally and
in production (registration, login, logout, session restore, save/restore
round-trip — verified with a direct authenticated REST read against Supabase,
not just the UI — RLS cross-account denial, non-blocking save-failure
warning, unchanged signed-out local fallback). Deployed at
**https://spatialflow-poc.vercel.app/**. Remaining: closeout (drift check,
archive).

✅ built (baseline) — `index.html` (Tailwind + Lucide CDN, Space Grotesk
display via Google Fonts, vanilla JS) per `docs/site/ARCHITECTURE.md`: a
dark, cinematic, scroll-driven marketing shell (jeskojets.com-inspired —
portal hero with scroll zoom-through, per-section palette journey, split
headline, accordion, spec table, dark finale, floating pill CTA) wrapping a
room-preset-driven layout planner (live utilization/power/spacing metrics,
itemized shopping list, blueprint export). The cinematic reskin
(`redesign-jesko-aesthetic`) replaced the earlier warm-wood look; the
scroll-animation + furniture-image change was discarded before it (see that
change's proposal).

## Completeness

| Object / morphism | State | Notes |
| --- | --- | --- |
| `RoomPreset` / `RoomConfig` / `FurnitureCatalogEntry` / `FurnitureItem` / `Layout` / `StoredLayoutJSON` | ✅ built | |
| `UtilizationMetrics` / `PowerEstimate` / `SpacingWarnings` / `ShoppingList` / `Blueprint` | ✅ built | all deduced, recomputed every render — verified manually |
| `selectRoom` / `renderGrid` | ✅ built | preset switch drops out-of-bounds items with notice |
| `addItem` / `moveItem` / `rotateItem` / `removeItem` | ✅ built | hard bounds + overlap invariants verified manually (off-grid drag and item-on-item drag both rejected) |
| `serialize` / `deserialize` | ✅ built | round-trip verified manually via browser reload |
| `persist` / `restore` (Trm) | ✅ built | key `spatialflow.layout.v2` |
| `computeUtilization` / `computePower` | ✅ built | verified against hand-computed values for a known layout |
| `computeSpacing` | ✅ built | soft warning confirmed non-blocking |
| `computeShoppingList` / `buildBlueprint` / `downloadBlueprint` (Trm) | ✅ built | modal contents verified to match canvas; download click ran with no console errors; re-verified unchanged after the cinematic reskin |
| `initScrollReveal` / `initHeroZoom` / `initAccordion` (presentation, not `Dat`) | ✅ built | cinematic scroll shell; reveals via `view()` (verified), hero zoom JS-driven (CSS `scroll()` inert), all outside the planner subtree |
| `User` / `StoredLayoutRow` | ✅ built | Supabase Auth + Postgres (`layouts` table, RLS by `user_id = auth.uid()`) |
| `signUp` / `signIn` / `signOut` (Trm) | ✅ built | verified live: successful + duplicate-email registration, successful + wrong-password login, logout, session restore across reload |
| `saveLayoutForUser` / `loadLayoutForUser` (Trm) / `layoutStore` (port) | ✅ built | verified live: save/reload round-trip, first-time-user default, non-blocking save-failure warning (simulated via `fetch` interception), RLS cross-account denial (unfiltered + targeted queries both return no other account's row), signed-out `localStorage` path unaffected |

## Needs work

1. No automated test suite — invariant, round-trip, and cost/power checks
   are manual only. Same accepted gap as the prior build.
2. Room-preset switch drops out-of-bounds items with a notice, but there's
   no undo — acceptable for a PoC, could be revisited if this grows past
   demo scope.
3. Hero "zoom-through" is JS-driven because CSS `animation-timeline: scroll()`
   is inert in the target engine — works, but is not the native
   scroll-timeline implementation; revisit if that engine support lands.
4. `add-user-auth-persistence` is deployed and verified in production; only
   closeout (drift check + archive) remains.

## Coherence

§4.5 checklists run in `reviews/review-redesign-tailwind-planner.md` (planner),
`reviews/review-redesign-jesko-aesthetic.md` (cinematic reskin), and
`reviews/review-add-user-auth-persistence.md` (auth + persistence) — all
checkable laws pass; see those files for the one-line rationale per law.

## Where to dig

- Model: [ARCHITECTURE.md](ARCHITECTURE.md) · Code map: [IMPLEMENTATION.md](IMPLEMENTATION.md)
- In flight: `add-user-auth-persistence` — `openspec/changes/add-user-auth-persistence/`
- Reviews: [reviews/review-redesign-tailwind-planner.md](reviews/review-redesign-tailwind-planner.md), [reviews/review-redesign-jesko-aesthetic.md](reviews/review-redesign-jesko-aesthetic.md), [reviews/review-add-user-auth-persistence.md](reviews/review-add-user-auth-persistence.md) · Notes: `general/`
- Image credits: `images/CREDITS.md`
