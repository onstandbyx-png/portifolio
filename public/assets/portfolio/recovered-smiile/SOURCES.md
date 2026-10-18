# Recovered smiile interactive examples

Source repository: `onstandbyx-png/smiile-`.
Pinned revision: `a2e6d42c526aa721d5059a6baad00cc86418ca3d`, branch `fix/sh4-135-agents-mobile-20261012`.
Source root: `sites/smiile-landing/`.
Imported for the portfolio on 2026-10-15. This is the current visual landing branch, not the older default main branch.

## Exact assets

| Local asset | Original path | Git blob SHA |
|---|---|---|
| landscape.webp | public/assets/landscape.webp | 3518b3aba1058abbf4b4fb70d227b33c874beb4d |
| trail-map.svg | public/assets/trail-map.svg | 13cdcbff6082efff9ea0dbc64d6e41c2c654f44c |
| agents-call-pt-br.mp3 | public/media/agents-call-pt-br.mp3 | bed7c455ca13e19e4935dae180587f0a2323cdb4 |
| agents-call-pt-br.json | public/media/agents-call-pt-br.json | a0125b5d2a63ef5982f9af644c463a22b56121ea |

Binary assets were recovered through the authenticated GitHub connector. `git hash-object` confirmed all three binary/SVG blob hashes above before use. The audio is the existing 19.4-second ElevenLabs recording generated on 2026-10-13, with four source transcript segments. No new voice generation or live call service is used.

`/assets/portfolio/smiile-architecture-coast.webp` and `showcase/device-frame.js` already existed in the portfolio and remain reused.

## Behavior recovered and adapted

- `src/showcase/apps/InteractiveTrailApp.tsx`: search, saved filter, saved state, list/detail/map/summary, deliberate simulated progress, return to list scroll position, pause offscreen and on page hide.
- `src/showcase/apps/ListScreen.tsx`: the current app photo asset (`landscape.webp`).
- `src/showcase/apps/TrailMap.tsx`: original topography and overlay geometry.
- `src/data/trail.ts` (`66ad08df40a3927a6ebb8b20701ee328537af3b0`) and `src/data/trail.generated.ts` (`35b4189f49eedbefdee243212f893fddf7cd25ac`): bundled without numerical changes into `trail-data.js`. Route, profile, ascent and elapsed-time computations remain the original single data source. 8.4 km, 312 m, 2h40 refer to the synthetic example, not a real GPS route.
- `src/showcase/scenes/SiteScene.tsx`: Casa Costa home/gallery/local booking and confirmation. The original three views of one image are retained and identified as such. The example's fixed October slots are adapted to the next three local calendar days captured on page load; the confirmed date and time come from the same chosen object.
- `src/showcase/agents/case.ts` (`1df00fb4f4461ddccea2720a5578d1c0da32f4aa`) and `ProposalInspector.tsx` (`8d914b825cc68b362da8f01eb88cb8971114ac6c`): original Estúdio Forma data preserved. v2: mesa R$ 7,800 + aparador R$ 4,200 = R$ 12,000, Thursday 15h. v3 preserves those items and adds banco R$ 1,900 = R$ 13,900, Friday 10h. Prices are values in the source's illustrative furniture proposal, not portfolio service prices. Local review approval does not send email or schedule a meeting.

## Portfolio adaptation

Native JavaScript in `showcase/product-demos.js` ports the useful interactions without adding a second framework. The app, architecture site, and voice/document example occupy one switchable section; states survive switching. Original 402 × 874 phone-screen geometry and metallic layers come from the existing `createDeviceFrame`. UI typography reflows at the displayed width instead of shrinking a full desktop surface. The site uses an authored CSS laptop/browser shell on desktop and a responsive page window on mobile.

Audio uses `preload="none"`, starts only after explicit user action, and pauses when hidden, offscreen, switched out, or global motion pause is enabled. The app's timed simulated route also pauses at those boundaries. Reduced motion/global pause uses manual quarter-route increments. No external operational actions, browser location requests, or persistent personal data are involved.
