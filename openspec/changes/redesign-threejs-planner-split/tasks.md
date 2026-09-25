# Tasks

## 1. Shared auth module (Decision 2)

- [x] 1.1 Create `assets/js/site-auth.js` as a native ES module exporting
      `signUp`, `signIn`, `signOut`, `getCurrentUser`, `onAuthChange`, and
      `renderAuthNav(navRootEl)`, moved from `index.html`'s current inline
      auth code (`signUp`/`signIn`/`signOut`/`updateAuthUI`/the
      `onAuthStateChange` `INITIAL_SESSION` handling), preserving the
      synchronous-`currentUser`-on-handler fix from `add-user-auth-persistence`
      verbatim. Verify: the module has no inline-script-only globals left
      behind (`grep` for the moved function names in `index.html` returns
      nothing outside the `<script type="module">` import).
- [x] 1.2 Update `index.html` to import `site-auth.js` and call
      `renderAuthNav` for its nav widget. Verify: registration, login,
      logout, and reload-session-restore all still work on `index.html`
      alone (manual re-run of the `user-auth` spec scenarios).

## 2. Extract the planner to `planner.html`

- [x] 2.1 Create `planner.html` at the repo root with the shared page shell
      (nav using `site-auth.js`, footer, Tailwind/Lucide/Supabase CDN tags,
      the `importmap` from design.md Decision 1) and move `#planner`'s
      markup (`index.html:396-475`: room presets, catalog, board, metrics
      aside) into it unchanged. Verify: `planner.html` opens standalone and
      renders the room-preset/catalog/board/metrics layout.
- [x] 2.2 Move the planner's state machine, render, and compute functions
      (`addItem`/`moveItem`/`rotateItem`/`removeItem`/`selectRoom`/
      `renderGrid`/`computeUtilization`/`computePower`/`computeSpacing`/
      `computeShoppingList`/`buildBlueprint`/`downloadBlueprint`/`bootLayout`)
      from `index.html`'s inline script into `planner.html`, unchanged in
      signature and behavior. Verify: place/move/rotate/remove an item,
      confirm metrics/shopping-list update live and blueprint export
      downloads a `.json` file, matching pre-split behavior.
- [x] 2.3 Move `layoutStore` (`index.html:layoutStore`) into `planner.html`
      and repoint its `currentUser` read at `site-auth.js`'s
      `getCurrentUser()`/`onAuthChange` (design.md Decision 3). Verify: a
      signed-in save round-trips through Supabase and a signed-out save
      round-trips through `localStorage` (`spatialflow.layout.v2`),
      matching the `layout-persistence` spec scenarios.
- [x] 2.4 Remove the `#planner` section, its state-machine/render/compute
      JS, and `layoutStore` from `index.html`, replacing the in-page anchor
      with a nav/CTA link to `planner.html` (`planner-page` spec, "Visitor
      follows the planner link"). Verify: `index.html` no longer contains an
      interactive furniture-placement tool in its scroll flow, and the
      planner link is a plain `<a href="planner.html">` (works with
      JavaScript disabled - `planner-page` spec, "Visitor without
      JavaScript").
- [x] 2.5 Verify cross-page identity/layout continuity end to end: sign in
      on `index.html`, follow the link to `planner.html` and confirm already
      signed in with the saved layout loaded; sign in directly on
      `planner.html` and confirm the marketing page's nav shows signed-in
      too (`planner-page` spec, "Sign-in state and saved layout carry over").

## 3. Marketing shell reskin (Three.js + Lenis + GSAP)

- [x] 3.1 Add the pinned `importmap` (three, three/addons/, gsap,
      gsap/ScrollTrigger, lenis - design.md Decision 1) to `index.html` and
      confirm all five resolve with no console errors on page load.
- [x] 3.2 Wire Lenis + `gsap.ticker` + `ScrollTrigger.update()` per design.md
      Decision 5's integration pattern, gated so it is skipped entirely
      under `prefers-reduced-motion` (native scroll instead). Verify:
      scrolling `index.html` is smoothed, and disabling reduced-motion
      emulation off/on toggles Lenis on/off with no scroll-position jump.
- [x] 3.3 Build the Three.js hero scene and replace `initHeroZoom` with a
      GSAP `ScrollTrigger` (`scrub: true`, `pin: true`) driving it over the
      hero's scroll range, feature-detecting WebGL availability first and
      falling back to the current static hero treatment when unavailable
      (design.md Decision 5's WebGL fallback). Verify: scrolling through the
      hero animates the WebGL scene in sync with scroll position; forcing
      WebGL unavailable (e.g. `chrome://flags` software rasterizer off, or a
      stubbed `HTMLCanvasElement.getContext`) shows the static fallback with
      no console error.
- [x] 3.4 Replace `initScrollReveal`'s `IntersectionObserver` with
      `ScrollTrigger`-driven GSAP timelines on the existing `[data-reveal]`
      nodes, preserving one-shot-reveal semantics and the
      `prefers-reduced-motion` "reveal everything immediately" behavior.
      Verify: each marketing section still reveals once scrolled into view,
      including the final screenful (the `animation-timeline: view()` bug
      noted in `docs/site/ARCHITECTURE.md` §10 must not recur).
- [x] 3.5 Re-verify `initAccordion` and `initNavContrast` are unchanged and
      still function after the reskin (design.md Decision 5 keeps them
      vanilla). Verify: accordion rows still open/close; nav text contrast
      still flips over light/dark sections while scrolling.
- [x] 3.6 Remove the now-dead `initHeroZoom`/`initScrollReveal` CSS-driven
      implementations and any now-unused CSS they depended on. Verify:
      `supercharge-drift` reports no new dead rows introduced by leftover
      code.

## 4. Docs reconciliation

- [x] 4.1 Update `docs/site/ARCHITECTURE.md`: §1 notes the two HTML entry
      points (one component, one `Loc`, per design.md Decision 4); §10
      rewritten for the Three.js/Lenis/GSAP presentation layer (table from
      design.md Decision 5) in place of the current `initHeroZoom`/
      `initScrollReveal` description; add the `site-auth.js` shared module
      as the realizing code for the nav auth functions, replacing their
      current `index.html`-only file:symbol refs.
- [x] 4.2 Add/update rows in `docs/site/IMPLEMENTATION.md` for every moved or
      new morphism/function: `site-auth.js` exports, everything moved into
      `planner.html`, and the new hero-scene/reveal functions, each with its
      new `file:symbol`.
- [x] 4.3 Update `docs/site/STATUS.md` and `docs/STATUS.md` to reflect the
      in-flight change, and note the duplicated nav/footer markup between
      `index.html` and `planner.html` as a named accepted gap (design.md
      Risks).
- [x] 4.4 Write `docs/site/reviews/review-redesign-threejs-planner-split.md`
      running the §4.5 checklist (Law 1 placement honesty, Law 2
      transmission well-typing, Law 5 composition soundness - all named in
      design.md Decision 4) against the finished implementation.
- [x] 4.5 Run `supercharge-drift` and fix any dead rows before archiving.
      Verify: `0 dead` (or only the project's existing known-ceiling refs).
