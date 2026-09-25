# 2026-09-25 — readme-cicd-docs

## 0. Continuation brief

Current state: doc-only session, no code or architecture changes. Explained
the GitHub→Vercel deployment pipeline and Supabase Row Level Security to the
user conversationally, then documented the pipeline in `README.md` with a
diagram. Also closed a continuity gap: a session log for the prior
`redesign-threejs-planner-split` / `add-showcase-chair-spin` work existed
untracked on disk (written but never committed in an earlier session) and
has now been committed. Everything is committed and pushed; no OpenSpec
changes are in flight; drift check is clean.

Next step: none forced. The next session's first action is either (a) start
a new change if the user wants further site iteration, or (b) address one of
the accepted gaps in `docs/site/STATUS.md` §Needs work if asked.

Resume command/check: `openspec list` (should show no active changes);
production site: https://spatialflow-poc.vercel.app/.

## 1. Work completed

- Explained, in chat, how the GitHub→Vercel CI/CD pipeline works for this
  repo (webhook trigger, `vercel.json` build step, CDN deploy) and how
  Supabase Row Level Security enforces per-user data isolation, both at a
  beginner level per the user's request — no files changed for this part.
- Added a "CI/CD pipeline" section to `README.md` explaining the same flow,
  by explicit instruction omitting any mention of the repo lacking a CI
  (test/lint) stage.
- First attempt used a Mermaid flowchart in a fenced code block; the user
  reported it rendered too small on GitHub. Replaced it with a hand-authored
  standalone SVG (`docs/images/cicd-pipeline.svg`), embedded via a normal
  Markdown image, which GitHub renders at native/full size and lets a reader
  open at full resolution — confirmed by loading the SVG directly in a
  browser and screenshotting it before committing.
- Found `docs/sessions/2026-09-25-threejs-redesign-planner-split.md` sitting
  untracked in the working tree — a real session log (verified by reading
  it) for `redesign-threejs-planner-split` and `add-showcase-chair-spin`
  that was written but never `git add`ed/committed in whatever session
  produced it. Committed it on the user's confirmation so the continuity
  trail has no hole between the auth/persistence session and the current
  `docs/STATUS.md` state.
- Ran `supercharge-drift`: `0 dead / 12 refs` — clean, no doc/code
  divergence introduced.

## 2. Decisions

| Decision | Verdict | Why |
| --- | --- | --- |
| Mermaid code block vs. a static SVG image for the CI/CD diagram | changed to: static SVG under `docs/images/` | User reported the Mermaid diagram rendered too small on GitHub; a plain `<img>`/Markdown image renders at its native pixel size and can be opened full-size, with no dependency on GitHub's Mermaid renderer's fixed container width |
| Mention the repo's lack of automated CI (tests/lint) in the README diagram | excluded | Explicit user instruction for this specific edit |
| Commit the found untracked session log as-is vs. rewrite/expand it | committed as-is | It already met the session-log bar (continuation brief, decisions, tests, live state) — rewriting it would violate the immutable-sessions discipline for content that was already accurate |

## 3. Tests, checks, benchmarks

| Check | Result | What it proved |
| --- | --- | --- |
| Loaded `docs/images/cicd-pipeline.svg` directly in the browser pane and screenshotted it | rendered cleanly, all seven phase boxes and labels legible | The replacement SVG is valid and readable before committing it |
| `supercharge-drift` | `0 dead / 12 refs` | No doc/code drift introduced this session |
| `openspec list` | `No active changes found` | Confirms no in-flight work was started or left open |
| `git status` | clean, `master` up to date with `origin/master` | All three commits this session pushed successfully |

## 4. Live handoff state

| Type | Handle / location | State | Inspect / resume | Stop / cleanup |
| --- | --- | --- | --- | --- |
| branch | `master` | clean, pushed | `git status` | none |
| remote | `https://github.com/Bryan-LJX/spatialflow-poc` | up to date with `master` | `git log --oneline -6` | none |
| deployment | Vercel project `spatialflow-poc` → https://spatialflow-poc.vercel.app/ | live, auto-deploys on push (unaffected by this doc-only session) | open the URL | none — keep |
| artifact | none in flight | — | `openspec list` | n/a |

## 5. In-flight changes (from OpenSpec)

| Change | Tasks | Status | Next ready artifact |
| --- | --- | --- | --- |
| none | — | — | — |

## 6. Open items

| Priority | Item | Doc/code reference | Next action | Done when |
| --- | --- | --- | --- | --- |
| P2 | Two real test accounts + test layout rows exist in the production Supabase project | Supabase dashboard | Ask the user whether to delete them before real users sign up | user deletes them or says to leave them |
| P3 | No automated test suite | whole repo | Unchanged, long-standing accepted PoC gap | out of scope unless the project grows past demo scope |
| P3 | `graphify` produces an empty graph for this repo | n/a | Unchanged, documented ceiling (no JS-in-HTML AST support) | graphify adds that capability, or the JS is ever extracted to its own file |
| P3 | No password-reset / email-verification flow beyond Supabase defaults | `docs/site/reviews/review-add-user-auth-persistence.md` | Named Non-Goal in design.md; revisit only if the project moves past PoC scope | a future change explicitly adds it |

## 7. Architecture / model changes

None. This session added explanatory documentation (`README.md`,
`docs/images/cicd-pipeline.svg`) of an already-built, already-modeled
pipeline — no new `Dat`/`Trn`/`Loc`/`Trm` and no code changed, so
`ARCHITECTURE.md`/`IMPLEMENTATION.md` are unaffected.

## 8. Docs reconciled

| Doc | Change |
| --- | --- |
| `README.md` | Added, then revised, a "CI/CD pipeline" section (final form: static SVG + explanation) |
| `docs/images/cicd-pipeline.svg` | New — hand-authored deployment-pipeline diagram |
| `docs/sessions/2026-09-25-threejs-redesign-planner-split.md` | Committed (was untracked from a prior session) |

## 9. Drift check

`supercharge-drift` → `0 dead / 12 refs`. Clean.

## 10. Files changed

- `README.md` — added "CI/CD pipeline" section (Mermaid attempt, then SVG)
- `docs/images/cicd-pipeline.svg` — new
- `docs/sessions/2026-09-25-threejs-redesign-planner-split.md` — committed (pre-existing content, not authored this session)
- 3 commits pushed to `Bryan-LJX/spatialflow-poc` (`master`): `01a621d`,
  `c161930`, `9053a3c`
