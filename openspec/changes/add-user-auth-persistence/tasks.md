# Tasks

## 1. Provisioning (requires the user's own accounts)

- [x] 1.1 User creates a Supabase project (free tier) and shares the project
      URL + anon public key; confirm Auth (email/password provider) is
      enabled by default
- [x] 1.2 Create the `layouts` table (`user_id uuid primary key references
      auth.users(id)`, `layout jsonb not null`, `updated_at timestamptz not
      null default now()`) via the Supabase SQL editor and verify it exists
      with `select * from layouts limit 1`
- [x] 1.3 Enable Row Level Security on `layouts` and add policies restricting
      `select`/`insert`/`update` to `user_id = auth.uid()`; verify by reading
      the policy list back (`select * from pg_policies where tablename =
      'layouts'`)
- [x] 1.4 User creates a Vercel account/project (free tier) linked to this
      repo or ready for manual deploy; confirm with a first "hello world"
      deploy of the current `index.html` before any code changes, so the
      pipeline is proven before it matters

## 2. Auth integration

- [x] 2.1 Add the `@supabase/supabase-js` CDN `<script>` tag and initialize a
      client with the project URL/anon key; verify `supabase.auth` is defined
      in the browser console
- [x] 2.2 Implement `signUp(email, password)` and wire it to a registration
      form in `#site-nav`; verify the "Successful registration" and
      "Registration with an already-registered email" scenarios
      (`specs/user-auth/spec.md`) live in the browser
- [x] 2.3 Implement `signIn(email, password)` and wire it to a login form;
      verify the "Successful login" and "Login with incorrect credentials"
      scenarios live
- [x] 2.4 Implement `signOut()` and a visible logout control shown only when
      signed in; verify the "Successful logout" scenario live
- [x] 2.5 Wire Supabase's session restore (`onAuthStateChange` /
      `getSession`) so sign-in state survives a reload; verify both "Reload
      while signed in" and "Reload after logout" scenarios live
- [x] 2.6 Confirm none of the new auth DOM/handlers are attached inside
      `#planner`'s dynamic subtree (`#room-presets`, `#catalog-list`,
      `#board`, the metrics `<aside>`) — grep for the new functions'
      call sites to verify the planner-fence invariant holds

## 3. Layout persistence

- [x] 3.1 Implement the `layoutStore` seam (`layoutStore.save`/
      `layoutStore.load`) that dispatches to the existing `persist`/`restore`
      when signed out, or to new `saveLayoutForUser`/`loadLayoutForUser` when
      signed in; verify by reading the call sites in `addItem`/`moveItem`/
      `rotateItem`/`removeItem`/`selectRoom` are unchanged (they still call
      one seam, not two branches)
- [x] 3.2 Implement `saveLayoutForUser(user, layout)` (serialize then
      `supabase.from('layouts').upsert(...)`) and `loadLayoutForUser(user)`
      (`supabase.from('layouts').select(...)` then `deserialize`, falling
      back to the default `Layout` on no row); verify the "Layout saved
      while signed in" and "First-time signed-in visitor with no saved
      layout yet" scenarios live
- [x] 3.3 Handle the unreachable-storage case with a non-blocking warning
      (e.g. a toast, reusing the existing `flashInvalid`-style pattern) that
      does not revert in-progress edits; verify the "Save fails while
      offline" scenario by simulating a network failure (devtools offline
      mode or blocking the Supabase request)
- [x] 3.4 Verify "Returning signed-in visitor with a previously saved
      layout" end-to-end: save a layout signed in, sign out, sign back in
      (or use a second browser profile), confirm the same layout loads
- [x] 3.5 Verify RLS actually blocks cross-account access: attempt to read
      another account's `layouts` row with a signed-in-as-a-different-user
      client (or a direct REST call with a second account's session) and
      confirm it is rejected/empty — do not just re-read the policy text
- [x] 3.6 Verify signed-out behavior is byte-for-byte unchanged: with no
      session, confirm `persist`/`restore` and the `spatialflow.layout.v2`
      `localStorage` key still work exactly as before ("Signed-out visitor
      uses the planner" and "...does not follow them" scenarios)

## 4. Docs reconciliation

- [x] 4.1 Add `User` and `StoredLayoutRow` to `docs/site/ARCHITECTURE.md`'s
      core category/morphism table, the new `Loc`s (Supabase, Vercel) to §7,
      and the `layoutStore` port decision to a new presentation/ports note
- [x] 4.2 Add rows for `signUp`/`signIn`/`signOut`/`saveLayoutForUser`/
      `loadLayoutForUser`/`layoutStore` to `docs/site/IMPLEMENTATION.md` with
      their `index.html:<symbol>` realization, alongside the existing
      `persist`/`restore` rows
- [x] 4.3 Update `docs/STATUS.md` and `docs/site/STATUS.md` to record the new
      auth/persistence capability and, once done, the production Vercel URL
- [x] 4.4 Write `docs/site/reviews/review-add-user-auth-persistence.md`
      running the full §4.5 checklist against this change

## 5. Deployment

- [x] 5.1 Set the production Supabase URL/anon key as the values baked into
      (or configured for) the deployed `index.html`; verify they match the
      project from task 1.1, not a local/test project
- [ ] 5.2 Deploy to Vercel production; verify the live URL loads the site
      with no console errors (`read_console_messages`/browser devtools)
- [ ] 5.3 Re-run the key spec scenarios against the production URL:
      register, log in, save a layout, reload, log out, confirm signed-out
      fallback — not just against localhost
- [ ] 5.4 Record the production URL and the Vercel/Supabase project
      identifiers in the session log's Live handoff state table

## 6. Closeout

- [ ] 6.1 Run `supercharge-drift` (or `scripts/drift-check.sh`) and fix or
      record every dead row before archiving
- [ ] 6.2 Confirm all scenarios in `specs/user-auth/spec.md` and
      `specs/layout-persistence/spec.md` have been verified live (cross-check
      against tasks 2.2-2.5, 3.2-3.6, 5.3) before archiving
