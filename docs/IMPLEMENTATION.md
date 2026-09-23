# System implementation map

> Whole-system functor architecture-map.md → code, deduced from the component
> IMPLEMENTATION.md files. System-level rows only.

## Components → code root

| Component | Code root | Model | Code map |
| --- | --- | --- | --- |
| Site | `index.html` | [site/ARCHITECTURE.md](site/ARCHITECTURE.md) | [site/IMPLEMENTATION.md](site/IMPLEMENTATION.md) |

## Shared objects (one Dat, DataLocs in ≥2 components)

None — single component.

## Inter-component transmissions / ports (Trm)

None — single component; `persist`/`restore` are intra-component (runtime ↔
localStorage), see [site/ARCHITECTURE.md](site/ARCHITECTURE.md) §7.

## System entry points

| Entry | Trn triggered | Code |
| --- | --- | --- |
| Load `index.html` in a browser | `renderGrid` (+ `restore` if a saved layout exists) | `index.html` bottom-of-script init block |

## Divergences (system-level)

None.
