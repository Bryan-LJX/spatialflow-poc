# System status

> Roll-up of every <component>/STATUS.md. Detail lives in the linked file.

| Component | State | Headline gap | In flight | Detail |
| --- | --- | --- | --- | --- |
| Site | ✅ built | no automated tests | none | [site/STATUS.md](site/STATUS.md) |

**Production**: https://spatialflow-poc.vercel.app/ (up to date with `master`)

## Cross-cutting

Two static pages, one component, no build step, no backend beyond Supabase.
`index.html` is a dark, cinematic, scroll-driven marketing shell
(`redesign-jesko-aesthetic`, archived; rewired onto Three.js/Lenis/GSAP by
`redesign-threejs-planner-split`, archived — including a scroll-driven
parallax glide on the showcase chair from `add-showcase-chair-spin`,
archived) that links to `planner.html`, a room-preset-driven layout planner
(drag/drop placement, hard bounds/overlap invariants, soft spacing, live
metrics, shopping list, blueprint export) — moved off `index.html` by
`redesign-threejs-planner-split`. `add-user-auth-persistence` (archived)
added email/password registration and login via Supabase Auth, and per-user,
RLS-protected layout storage in Supabase Postgres for signed-in visitors —
signed-out visitors keep the original local, single-device planner
unchanged; `assets/js/site-auth.js` (added by `redesign-threejs-planner-split`)
is the one shared module carrying that auth/session code onto both pages. No
automated test suite exists anywhere in the repo — acceptable for this PoC's
scope, tracked as a named gap.
