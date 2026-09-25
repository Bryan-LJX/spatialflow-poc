# Design

## Context

See `proposal.md` - Why. Constraints carried over from the existing model
(`docs/site/ARCHITECTURE.md`): no build step, no backend beyond Supabase,
one Vercel-hosted static origin, and the planner's own object model (§3-§9)
and its hard/soft invariants are explicitly **not** touched by this change -
only the presentation layer (§10) and the document/file boundary change.

Confirmed before writing this design (see Decision 1): Three.js, Lenis, and
GSAP (core + ScrollTrigger, free for all uses since GreenSock's 2025
Club-plugin unlock under Webflow) all ship browser-ready ES module or UMD
builds servable straight from unpkg/jsDelivr, so none of them require a
bundler.

## Goals / Non-Goals

**Goals:**
- Replace the CSS/JS-approximated hero zoom and scroll reveals with a real
  WebGL scene (Three.js) driven by GSAP/ScrollTrigger timelines, smoothed by
  Lenis, closer to jeskojets.com's actual mechanism.
- Move the planner (markup, state machine, layoutStore) to its own page
  without duplicating the auth/session logic it depends on.
- Keep the planner's object model, invariants, and deduced metrics (§3-§9)
  byte-for-byte unchanged - only where its code lives changes.
- Preserve the no-build-step constraint.

**Non-Goals:**
- No bundler, package.json, or build pipeline - everything stays reachable
  via `<script type="importmap">` / CDN and native `<script type="module">`.
- No change to the Supabase schema, RLS policies, or the `layoutStore` port's
  external contract (`design.md` of `add-user-auth-persistence`).
- No SPA-style client-side routing - `planner.html` is a second real HTML
  document, not a route rendered by JS.
- No redesign of the planner's own interaction model (drag/drop, catalog,
  metrics panel) - only its visual chrome may pick up shared type/color
  tokens from the reskin, per task-level detail, not a model change.

## Decisions

### Decision 1: Dependency delivery - import maps + CDN, no bundler

Use a `<script type="importmap">` in both `index.html` and `planner.html`
mapping bare specifiers to pinned CDN URLs, exactly like the existing
Tailwind/Lucide/Supabase `<script>` tags are pinned-CDN today:

```html
<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.170.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.170.0/examples/jsm/",
    "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.7/index.js",
    "gsap/ScrollTrigger": "https://cdn.jsdelivr.net/npm/gsap@3.12.7/ScrollTrigger.js",
    "lenis": "https://cdn.jsdelivr.net/npm/lenis@1.1.19/dist/lenis.mjs"
  }
}
</script>
<script type="module" src="assets/js/marketing-scene.js"></script>
```

Versions above are the stable lines confirmed servable as ESM at design
time; pin the exact latest patch of each at implementation time (task-level
detail, not a spec/approach change) and never use `@latest` in the shipped
`importmap` (floating tags get short cache TTLs and can silently change
under visitors, per unpkg/jsDelivr's own guidance).

**Alternatives considered:** a bundler (Vite/esbuild) would give tree-
shaking and a smaller payload, but introduces a build step the project has
deliberately avoided since `build-index-html` (archived) and that
`add-user-auth-persistence`'s design.md explicitly reaffirmed ("Client-only
... matches the no-build-step constraint"). Rejected - no stated need
outweighs that standing constraint for a PoC.

### Decision 2: Shared auth/session code as a native ES module, not duplicated inline script

Both pages need identical nav auth UI (sign-up/sign-in/sign-out, session
restore) and both need to read `currentUser` - `index.html` to show the
signed-in nav state, `planner.html` to drive `layoutStore`. Extract this
into `assets/js/site-auth.js`, a plain ES module (no bundler needed - browsers
resolve `<script type="module" src="...">` imports natively over HTTP),
exporting `signUp`, `signIn`, `signOut`, `getCurrentUser`, `onAuthChange`,
and `renderAuthNav(navRootEl)`. Both `index.html` and `planner.html` import
it directly.

**Alternatives considered:** (a) duplicate the auth script inline in both
pages, as the planner's markup/JS was duplicated nowhere before - rejected,
violates "one source of truth for shared structure" and would let the two
copies drift (e.g. the `currentUser`-race fix from
`add-user-auth-persistence` would need to be applied and re-verified twice).
(b) An iframe-embedded planner inside `index.html` - rejected, defeats the
proposal's goal of not shipping planner weight to marketing-only visitors
and vice versa, and complicates the `layoutStore` port's DOM access.

### Decision 3: `layoutStore` port stays planner-only; auth module is its sole dependency

`layoutStore` (currently `index.html:layoutStore`) moves to `planner.html`
unchanged in shape - it still isolates `persist`/`restore` vs.
`saveLayoutForUser`/`loadLayoutForUser` behind one port, per
`add-user-auth-persistence` design.md Decision 4. Its only change is where it
reads `currentUser` from: the shared `site-auth.js` module's
`getCurrentUser()` instead of a page-local variable. No other planner
morphism (`addItem`/`moveItem`/...) changes.

**Correctness note (found live while verifying this change):**
`saveLayoutForUser`/`loadLayoutForUser` were first implemented against a
second, independently-instantiated Supabase client local to `planner.html`
(mirroring index.html's pre-split code exactly). That triggered the
Supabase SDK's own "Multiple GoTrueClient instances" warning: every
`createClient()` call spins up a `GoTrueClient` that manages the shared
`sb-<project>-auth-token` localStorage key, even for a client that never
calls `.auth`, so two clients on one page race over that key. Fixed by
adding `getSupabaseClient()` to `site-auth.js`'s exports and having
`planner.html` reuse that one client for its `.from("layouts")` calls
instead of creating its own — one client, one storage-key owner, per this
project's "one source of truth for shared structure" rule.

### Decision 4: Marketing/planner boundary stays one component, two documents, one `Loc`

**Consolidation check (§3):** this change adds no new `Dat` object and no
new `Trn`/`Trm` crossing a `Loc` boundary. `index.html` and `planner.html`
are two documents served from the same Vercel-hosted static origin, read by
the same browser runtime - navigating between them is ordinary browser
navigation, not a modeled transmission, because no `Dat` crosses a `Loc`:
the Supabase session token already lives in browser storage that both pages
read identically (this is why no `user-auth`/`layout-persistence` spec
changed - see proposal.md Capabilities). `docs/site/ARCHITECTURE.md` §1
gains one sentence noting two HTML entry points; the category (§3-§9) is
untouched.

**Coherence laws this change must keep satisfied:**
- **Law 1 (placement honesty):** still no `Loc` beyond browser runtime,
  `localStorage`, the downloads folder, Supabase Auth/Postgres, and the
  Vercel static origin (§7/§11) - the WebGL canvas, Lenis, and GSAP all run
  in the same browser-runtime `Loc` as everything else; they carry no
  `Layout` data and get no `Loc` of their own, same reasoning as the
  Tailwind/Lucide/Google-Fonts CDN assets (§9/§10).
- **Law 5 (composition soundness):** `deserialize ∘ serialize = id` and the
  `layoutStore` isolation guarantee are unaffected - verified by the fact
  that no planner morphism's signature, file, or behavior changes, only its
  containing document.

### Decision 5: Presentation-layer replacement, function-for-function

Replace the §10 ambient functions like-for-like, not additively:

| Current (`index.html`) | Replacement | Why |
| --- | --- | --- |
| `initHeroZoom` (rAF scroll handler, CSS `scale`/`opacity`) | A Three.js scene rendered into the hero's canvas, animated via a GSAP `ScrollTrigger` with `scrub: true` and `pin: true` over the hero's scroll range | Real WebGL depth/parallax is what jeskojets.com's window-to-clouds transition actually uses; a 2D CSS scale/fade cannot reproduce it |
| `initScrollReveal` (`IntersectionObserver` on `[data-reveal]`) | `ScrollTrigger.batch()` (or per-element `ScrollTrigger`s) firing a GSAP timeline per section, same one-shot reveal semantics | Keeps the existing `[data-reveal]` markup contract; GSAP's trigger is the same "has this scrolled into view" signal IO gave, just timeline-driven instead of class-toggled |
| (new) plain scroll | `Lenis` instance driving all scrolling, ticked from `gsap.ticker` and calling `ScrollTrigger.update()` on its `scroll` event (the documented Lenis+GSAP integration) | Needed so ScrollTrigger's scroll-position math matches what the visitor actually sees under Lenis's smoothing, per both libraries' own integration guidance |
| `initAccordion`, `initNavContrast` | **Unchanged**, kept as plain vanilla JS | Neither needs WebGL or scroll-scrubbed timelines; rewriting them would add dependency surface with no observable benefit |

`prefers-reduced-motion` handling is preserved and centralized via
`gsap.matchMedia()`: under reduced motion, Lenis is not instantiated (native
scroll), ScrollTrigger-scrubbed animations render their end state
immediately, and the Three.js hero scene renders one static frame (no
per-frame render loop) instead of animating.

**WebGL availability fallback (new risk vs. today, since today's hero has no
WebGL dependency):** feature-detect a WebGL context before instantiating the
Three.js scene; if unavailable, the hero falls back to the pre-existing
static gradient/image treatment with no canvas - degraded, not broken.

### Decision 6: `planner.html` lives at the repo root

Alongside `index.html`, not under a subdirectory - matches the project's
flat, no-routing static layout, keeps root-relative asset paths
(`images/furniture/...`, `supabase-config.js`) working unchanged on both
pages, and needs no `vercel.json` change (still served as a static file at
`/planner.html`).

## Risks / Trade-offs

- **[Risk]** Three.js + GSAP + Lenis add real download weight to the
  marketing page (roughly a few hundred KB combined, vs. the current
  near-zero JS beyond Tailwind/Lucide/Supabase) → **Mitigation:** this is
  the deliberate trade of Decision 1 vs. a bundler; a PoC marketing page is
  an acceptable place to pay it, and it no longer taxes planner-only
  visitors once the split lands.
- **[Risk]** A second HTML document duplicates nav/footer markup (not just
  auth JS, which Decision 2 already shares) → **Mitigation:** accepted as-is,
  consistent with the project's existing no-build-step, no-templating
  constraint; noted as a named gap in `docs/site/STATUS.md` rather than
  solved with new tooling.
- **[Risk]** CDN version drift if a pinned URL's package is ever removed
  from unpkg/jsDelivr → **Mitigation:** same exposure the project already
  accepts for Tailwind/Lucide/Supabase; unchanged risk profile, not a new
  one introduced by this change.
- **[Risk]** WebGL context creation can fail (old browsers, disabled
  hardware acceleration, some embedded webviews) → **Mitigation:** Decision
  5's feature-detected fallback to the current non-WebGL hero treatment.

## Migration Plan

No data migration - this is a static-asset and client-code change only.
Deploy is the existing Vercel auto-deploy on push to `master`; rollback is a
normal revert commit (or Vercel's "redeploy a previous deployment"), exactly
as for prior changes. Verify post-deploy: both `index.html` and
`/planner.html` load on the production URL, auth/session/layout scenarios
from `user-auth`/`layout-persistence` still pass unchanged, and the hero
degrades gracefully with WebGL disabled (`chrome://flags` or a
`prefers-reduced-motion` emulation) before calling this done.
