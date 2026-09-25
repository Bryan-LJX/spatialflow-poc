# 2026-09-25 — threejs-redesign-planner-split

## 0. Continuation brief

Current state: two OpenSpec changes landed, verified in production, and
archived this session — `redesign-threejs-planner-split` (marketing shell
reskinned onto Three.js/Lenis/GSAP; the Micro-Office Layout Builder moved to
its own `planner.html`) and `add-showcase-chair-spin` (a scroll-driven
diagonal parallax glide on the `#showcase` chair, after two rejected
iterations). `README.md` was updated for both, then the user removed its
"Known gaps" section directly (that content still lives in
`docs/site/STATUS.md`'s "Needs work", which stays the source of truth).
Everything is committed and pushed to `origin/master`; drift check is clean;
no OpenSpec changes are in flight.

Next step: none forced. The next session's first action is either (a) start
a new change if the user wants further iteration on the site, or (b) address
one of the accepted gaps in `docs/site/STATUS.md` §Needs work if asked.

Resume command/check: `openspec list` (should show no active changes);
production site: https://spatialflow-poc.vercel.app/.

## 1. Work completed

- **`redesign-threejs-planner-split`** (full OpenSpec cycle: propose →
  apply → verify → archive):
  - Adopted Three.js (WebGL hero scene), Lenis (smooth scroll), and
    GSAP/ScrollTrigger (pin/scrub/reveal) for `index.html`'s marketing
    shell — all free/MIT, loaded via a pinned-version CDN `<script
    type="importmap">`, no bundler introduced.
  - Extracted the Micro-Office Layout Builder off `index.html` onto a new
    `planner.html` — including the `#summary` blueprint/shopping-list
    output and `#export-modal`, which the written tasks.md hadn't
    explicitly called out but the `planner-page` spec's "no embedded
    interactive tool in the scroll flow" requirement implied; judged this
    in scope while implementing rather than narrowing the spec's intent.
  - Added `assets/js/site-auth.js`, a shared native ES module carrying
    `signUp`/`signIn`/`signOut`/`getCurrentUser`/`onAuthChange`/
    `renderAuthNav`/`getSupabaseClient`, imported by both pages so the
    auth/session logic and the `currentUser`-race fix from
    `add-user-auth-persistence` exist in exactly one place.
  - Added `assets/js/marketing-scene.js` (`index.html`-only): Lenis
    wiring, the hero's pinned/scrubbed WebGL scene with a
    feature-detected no-WebGL fallback, and the `ScrollTrigger`-driven
    reveal system replacing the old `IntersectionObserver`.
  - Wrote a real `planner-page` spec (new capability) — the split changes
    observable navigation structure — while confirming `user-auth`/
    `layout-persistence` need no delta (both already describe behavior in
    page-agnostic terms).
- **`add-showcase-chair-spin`** (`skip_specs: true` — presentation-only,
  same category as the earlier `redesign-jesko-aesthetic`):
  - Iteration 1: a full 360° `rotation` scrub — user rejected live,
    "looks weird" (a flat photo spinning end-over-end reads as broken).
  - Iteration 2: a small parallax rise (`y`/`rotation`/`scale`) — user
    rejected live, "not obvious enough."
  - Iteration 3 (kept): a diagonal parallax glide — `x: -70→70`,
    `y: 130→-130`, `scale: 0.78→1.12`, no rotation. Verified live via real
    wheel-scroll that the computed `transform` matrix changes continuously
    and matches the intended direction/scale at multiple scroll depths.
- Updated `README.md` twice (two-page structure, Three.js/Lenis/GSAP stack,
  new file layout) and, per the user's explicit request, removed its "Known
  gaps" section (the content is not lost — it lives in `docs/site/
  STATUS.md`'s "Needs work", the actual source of truth). The user then
  independently added a "CI/CD pipeline" section with a Mermaid diagram
  directly to `README.md` (commit `01a621d`) — observed, not authored, this
  session; left as-is.
- Archived both changes (`openspec archive ... --yes`), which synced the
  new `planner-page` delta into `openspec/specs/planner-page/spec.md`.

## 2. Decisions

| Decision | Verdict | Why |
| --- | --- | --- |
| Full 360° chair rotation vs. parallax motion | discarded (rotation) | User: a flat photo doing a complete turn reads as glitching, not premium |
| Small parallax rise (`y`/`rotation`/`scale`, ±6° tilt) vs. bigger diagonal glide | discarded (small rise) | User: correct mechanism, too subtle to notice while scrolling |
| Diagonal parallax glide, no rotation, larger travel/scale | kept | User confirmed the direction was right; larger range + dropping the spin-adjacent rotation axis made it unambiguous without re-introducing the "weird" read |
| Separate Supabase client per page vs. one shared via `site-auth.js:getSupabaseClient` | changed mid-implementation to: shared client | Live testing surfaced the SDK's own "Multiple GoTrueClient instances" warning — two `createClient()` calls on one page race over the same auth-token storage key |
| Lenis ticked from `gsap.ticker` alone vs. also running its own default rAF loop | fixed to: `{ autoRaf: false }`, ticked only from `gsap.ticker` | Both loops running together double-drove scroll updates and visually desynced the pinned hero from the fixed nav (confirmed via `getBoundingClientRect`/`elementFromPoint` showing correct layout while paint drifted) |
| Real spec for `planner-page` vs. `skip_specs: true` | kept: real spec | The page split changes observable navigation structure, unlike the chair-glide change which is presentation-only |
| `README.md` "Known gaps" section | removed per explicit user request | `docs/site/STATUS.md`'s "Needs work" remains the authoritative, non-duplicated list — nothing was silently lost |

## 3. Tests, checks, benchmarks

| Check | Result | What it proved |
| --- | --- | --- |
| `openspec validate --strict` (both changes) | valid | Proposal/specs/design/tasks internally consistent |
| Local preview (`localhost:8123`), hero WebGL scene | rendered, no console errors | ImportMap resolves; Three.js scene draws inside the portal |
| Local preview, header `getBoundingClientRect()`/`elementFromPoint()` through the hero pin | `{top:0}` and correct hit-test at every scroll depth, before **and** confirming the bug before the `autoRaf` fix | Nav stays genuinely pinned, not just visually by luck |
| Local preview, `planner.html` standalone | catalog/placement/metrics/shopping-list/export modal all functioned; `localStorage` round-tripped across reload | Planner extraction preserved behavior byte-for-byte |
| Local preview, `planner.html` sign-in with wrong credentials | "Invalid login credentials" from real Supabase | `site-auth.js`'s wiring reaches production Auth end-to-end |
| `supercharge-drift` (repeated after each change) | `0 dead / 12 refs` (final) | No dangling `IMPLEMENTATION.md` file:symbol refs |
| Production (`https://spatialflow-poc.vercel.app/`) full re-run after deploy | hero scene, pinned nav, chair-glide transform matrix, planner placement + persistence, wrong-credential auth error — all reconfirmed | Production behaves identically to local, not just "builds without error" |
| Automated screenshot artifact isolation | reproduced blank/offset screenshots on **both** `index.html` and dependency-free `planner.html` at large scroll depths | Isolated to the Browser pane's own screenshot pipeline, not a real page bug — documented in the review doc so it isn't mistaken for one later |

## 4. Live handoff state

| Type | Handle / location | State | Inspect / resume | Stop / cleanup |
| --- | --- | --- | --- | --- |
| branch | `master` | clean, up to date with `origin/master` at `01a621d` | `git status` | none |
| remote | `https://github.com/Bryan-LJX/spatialflow-poc` | up to date | `git log --oneline -8` | none |
| deployment | Vercel project `spatialflow-poc` → https://spatialflow-poc.vercel.app/ | live, serving `01a621d` | open the URL | none — keep |
| process | Browser-pane preview server `static-preview` (serverId `27ee559a-...`), `python3 -m http.server 8123` | running | `preview_list` / `ss -ltnp \| grep 8123` | `preview_stop` with that serverId, or leave it (stateless static server) |
| browser tabs | Browser pane: `tab-1` idle at a `file://.../planner.html` URL (unused, left from earlier troubleshooting), `tab-3` fronted at `https://spatialflow-poc.vercel.app` | open | `tabs_context` | close either with `tabs_close`, or leave |
| artifact | `openspec/changes/archive/2026-09-25-redesign-threejs-planner-split/`, `openspec/changes/archive/2026-09-25-add-showcase-chair-spin/` | archived, all tasks done | `ls openspec/changes/archive/` | none — keep |

## 5. In-flight changes (from OpenSpec)

| Change | Tasks | Status | Next ready artifact |
| --- | --- | --- | --- |
| — | — | none in flight | — |

## 6. Open items

| Priority | Item | Doc/code reference | Next action | Done when |
| --- | --- | --- | --- | --- |
| P3 | No automated test suite | whole repo | Unchanged, long-standing accepted PoC gap | out of scope unless the project grows past demo scope |
| P3 | `index.html`/`planner.html` duplicate nav/footer/auth-modal markup (code is shared, markup isn't) | `docs/site/STATUS.md` §Needs work | Accepted consequence of no build step/templating; revisit only if that constraint changes | a future change adds templating or a build step |
| P3 | `graphify --code-only` now extracts real nodes (30 nodes/39 edges/7 communities) from `assets/js/site-auth.js`/`marketing-scene.js` — the old "empty graph" ceiling only ever applied to `index.html`'s inline `<script>`, which graphify still can't parse | `graphify-out/graph.json` | none required; the ceiling narrowed on its own once real `.js` files existed. Full (non-`--code-only`) `graphify` still needs an `LLM API key` (`GEMINI_API_KEY`/etc.) for the 73 doc/image files — none is configured in this session | set an LLM key and re-run without `--code-only` if the doc/image semantic layer is wanted |
| P3 | No password-reset / email-verification flow beyond Supabase defaults | `docs/site/reviews/review-add-user-auth-persistence.md` | Named Non-Goal; revisit only if the project moves past PoC scope | a future change explicitly adds it |

## 7. Architecture / model changes

Two changes, both reconciled into `docs/site/ARCHITECTURE.md`/
`IMPLEMENTATION.md` already:

- **`redesign-threejs-planner-split`**: no new `Dat`/`Trn`/`Loc`/`Trm` at
  the model level (§3-§9 untouched) — `index.html` and `planner.html` are
  two documents in the one existing browser-runtime `Loc` (§1, §7, §10).
  Presentation layer (§10) rewritten: `initHeroScrub`/`initHeroScene`/
  `initLenis`/`initScrollReveal` replace the old rAF/IntersectionObserver
  code; `initAccordion`/`initNavContrast` unchanged. Realising-code
  `file:symbol` refs for `signUp`/`signIn`/`signOut` moved to
  `assets/js/site-auth.js`; `saveLayoutForUser`/`loadLayoutForUser`/
  `layoutStore` and the whole planner category moved to `planner.html`.
  Planner-fence invariant (§10) is now structural, not just enforced — no
  planner code exists in `index.html` at all.
- **`add-showcase-chair-spin`**: purely ambient presentation (§10 addition,
  `initShowcaseSpin`) — no model change, same as `redesign-jesko-aesthetic`.

Both §4.5 coherence checklists ran clean — see
`docs/site/reviews/review-redesign-threejs-planner-split.md` (includes the
Lenis/GSAP and duplicate-Supabase-client correctness notes).

## 8. Docs reconciled

| Doc | Change |
| --- | --- |
| `openspec/changes/archive/2026-09-25-redesign-threejs-planner-split/`, `.../2026-09-25-add-showcase-chair-spin/` | Created and archived this session |
| `openspec/specs/planner-page/spec.md` | New — synced from the `redesign-threejs-planner-split` delta |
| `docs/site/ARCHITECTURE.md` | §1 (two entry points), §10 rewritten (Three.js/Lenis/GSAP presentation layer, `initShowcaseSpin`), §7/§11 realising-code refs updated |
| `docs/site/IMPLEMENTATION.md` | Objects/morphisms repointed to `planner.html`/`assets/js/*.js`; Notes/divergences entries for both changes plus the two correctness fixes |
| `docs/site/STATUS.md`, `docs/STATUS.md` | Both changes rolled from in-flight → built; no in-flight change remains |
| `docs/site/reviews/review-redesign-threejs-planner-split.md` | Created — full §4.5 checklist, both correctness fixes, the screenshot-artifact note |
| `README.md` | Two-page structure, tech stack, project layout; "Known gaps" removed per user request (content preserved in `docs/site/STATUS.md`); user separately added a CI/CD pipeline section |

## 9. Drift check

`supercharge-drift` → `0 dead / 12 refs`. Clean; re-run after each of the
two changes and again at session end.

## 10. Files changed

- `index.html` — marketing shell rewritten (Three.js/Lenis/GSAP import map
  and wiring; planner/`#summary`/`#export-modal` removed; nav/CTA links
  point to `planner.html`)
- `planner.html` — new (planner markup + state machine + `layoutStore` +
  its own Supabase client for the `layouts` table)
- `assets/js/site-auth.js` — new (shared auth/session ES module)
- `assets/js/marketing-scene.js` — new (Lenis/GSAP/Three.js presentation
  layer, including `initShowcaseSpin`)
- `docs/site/ARCHITECTURE.md`, `docs/site/IMPLEMENTATION.md`,
  `docs/site/STATUS.md`, `docs/STATUS.md` — reconciled
- `docs/site/reviews/review-redesign-threejs-planner-split.md` — new
- `README.md` — updated twice, then trimmed
- `openspec/specs/planner-page/spec.md` — new (synced from archive)
- 6 commits pushed to `Bryan-LJX/spatialflow-poc` (`master`):
  `7fd3094`, `1f42481`, `934b4b0`, `0ef06ae`, `503be91`, and the user's own
  `01a621d`
