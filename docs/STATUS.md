# System status

> Roll-up of every <component>/STATUS.md. Detail lives in the linked file.

| Component | State | Headline gap | In flight | Detail |
| --- | --- | --- | --- | --- |
| Site | ✅ built | no automated tests, manual verification only | none | [site/STATUS.md](site/STATUS.md) |

## Cross-cutting

`index.html` is a single-file micro-office layout planner PoC. Its marketing
shell was reskinned to a dark, cinematic, scroll-driven aesthetic modeled on
jeskojets.com (`redesign-jesko-aesthetic`): a portal hero with a scroll
zoom-through, a per-section palette journey, oversized Space Grotesk display
type, a split headline, an accordion, a spec table, a dark finale, and a
floating pill CTA. The interactive planner (room presets, drag/drop placement,
hard bounds/overlap invariants, soft spacing, live metrics, shopping list,
blueprint export, `localStorage`) is **unchanged** — it sits inside the shell
as a bright "studio workbench" panel and was re-verified with no regressions.
An earlier scroll-animation + furniture-image change was discarded (wrong
direction) before this reskin. A second review pass before archiving found
and fixed two more defects: a workbench grid sizing bug that let the metrics
sidebar bleed past the panel's white border, and a showcase image that
visually collided with the split headline. `redesign-jesko-aesthetic` is now
archived. No automated test suite exists anywhere in the repo — acceptable
for this PoC's scope, tracked as a named gap.
