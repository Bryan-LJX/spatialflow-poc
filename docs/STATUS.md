# System status

> Roll-up of every <component>/STATUS.md. Detail lives in the linked file.

| Component | State | Headline gap | In flight | Detail |
| --- | --- | --- | --- | --- |
| Site | ✅ built | no automated tests, manual verification only | — | [site/STATUS.md](site/STATUS.md) |

## Cross-cutting

`index.html` is built and manually verified (marketing content, interactive
planner with drag/move/rotate/remove, bounds + no-overlap invariants,
localStorage persistence). No automated test suite exists anywhere in the
repo — acceptable for this PoC's scope, tracked as a named gap rather than a
silent one.
