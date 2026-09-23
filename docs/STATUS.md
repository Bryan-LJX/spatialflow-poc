# System status

> Roll-up of every <component>/STATUS.md. Detail lives in the linked file.

| Component | State | Headline gap | In flight | Detail |
| --- | --- | --- | --- | --- |
| Site | ✅ built | no automated tests, manual verification only | — | [site/STATUS.md](site/STATUS.md) |

## Cross-cutting

`index.html` was fully rebuilt on a new Tailwind CSS + Lucide icons (CDN)
design: landing hero, room-preset-driven micro-office layout builder with
live utilization/power/spacing metrics, itemized shopping list, and blueprint
export (JSON download). Supersedes the prior plain-CSS build. No automated
test suite exists anywhere in the repo — acceptable for this PoC's scope,
tracked as a named gap rather than a silent one.
