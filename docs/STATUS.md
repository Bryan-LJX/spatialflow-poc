# System status

> Roll-up of every <component>/STATUS.md. Detail lives in the linked file.

| Component | State | Headline gap | In flight | Detail |
| --- | --- | --- | --- | --- |
| Site | 🔄 in flight | no automated tests; auth/persistence verified locally, production deploy pending | `add-user-auth-persistence` | [site/STATUS.md](site/STATUS.md) |

## Cross-cutting

`index.html` is a single-file micro-office layout planner PoC with a dark,
cinematic, scroll-driven marketing shell (`redesign-jesko-aesthetic`,
archived) wrapping a room-preset-driven layout planner (drag/drop placement,
hard bounds/overlap invariants, soft spacing, live metrics, shopping list,
blueprint export). `add-user-auth-persistence` (in flight) adds email/password
registration and login via Supabase Auth, and replaces the anonymous
single-device `localStorage` layout with per-user, RLS-protected storage in
Supabase Postgres for signed-in visitors — signed-out visitors keep the
original local, single-device planner unchanged. Implemented and verified
locally (registration, login, logout, session restore, save/reload
round-trip, RLS cross-account denial, non-blocking save-failure handling);
deploying to Vercel production is the remaining step. No automated test suite
exists anywhere in the repo — acceptable for this PoC's scope, tracked as a
named gap.
