# Current implementation handoff

Updated **2026-11-09**, **codex-bankd-macbook**. This document describes the current release; `TEAM_LOG.md` retains historical decisions.

## Release and next work

[Live portfolio](https://breaker-of-code.github.io/Portfolio/) · [Repository](https://github.com/breaker-of-code/Portfolio) · app commit **5cc0406** · [successful deployment](https://github.com/breaker-of-code/Portfolio/actions/runs/42676913997), 35 seconds.

Approved profile, seven employers/logos, eleven projects/media, skills/contact and original résumé are published.77 tests/build/CI pass. All 330 deployment files were verified:320 nonvideo SHA-256 hashes match the local build;10 videos returned expected content lengths. This is not a complete byte comparison of the video bodies.

1. User should retest the new mobile release on Samsung Galaxy A54/Chrome. First-published version had missing 3D/limited navigation/blurry labels; loading/recovery/resolution fixes are now deployed, but exact hardware cause was not reproduced physically.
2. Additional Arkadium/Infinity Up games and further personal projects await user media/details. Ask insertion position, copy/contributions and company for each future project. Hexagrids X remains excluded.
3. More skills can be added later; current 25 are confirmed, tools round deferred. Do not reopen completed intake unprompted.
4. Future edits remain local until another deployment request. Admin/backend stays deferred; see ADMIN_FUTURE.md.

## Architecture and source map

Vanilla JS/CSS + Three.js + Vite; static GitHub Pages, no Unity runtime/React/backend. App is `coastal-portfolio/`; sibling design-review/content-review are private historical auditions/preparation/evidence.

| Files | Responsibility |
| --- | --- |
| main.js / content.js / style.css | DOM/state/audio orchestration, approved data, responsive theme |
| navigation.js / drive-controller.js / motion.js / held-drive.js | Route restore/return, locking/reversal/continuation, acceleration and held input |
| visitor-tour.js / controls-intro.js | Endpoint-bouncing taps, untouched 30 s tour, first-opening instruction animation |
| scene.js / render-budget.js | World/camera/picking/timeline, readiness/context lifecycle and render/shadow cadence |
| camera-layout.js | Automatic fit, reference scale and long-route cropping/follow |
| label-layout.js / rooftop-sign.js / logo-layout.js | Growing consistent-type boards and provided rooftop logo fitting |
| career-building.js / project-icons.js / project-landmarks.js / route-assets.js | Lazy procedural landmarks and appropriate project visuals |
| company-gallery.js / preview-rotation.js / project-media.js | Explicit employer links, paired fades and on-demand mixed media |
| skill-motion.js | Persistent 2D badge collision simulation, no reset on skill filters |
| ocean.js / ocean-waves.js / ocean-grid.js | Scenery, matching shader/CPU wave sampling, smooth variable-detail water mesh |
| jeep.js / exhaust.js | Independent suspension/wheels, white smoke |
| quality.js / mesh-batching.js / performance-probe.js | Adaptive effects, spatial batching/instancing, opt-in diagnostics |
| sound-mixer.js / sound-preference.js / ambient-loop.js / sound-effect.js / interface-sounds.js | Mix, preferences, decoding/reuse, loops and bounded cues |
| public/ | Public shipped images/videos/fonts/audio/PDF and provenance |

Paths in the table are under `src/` except public. Setup/release commands are in README/DEPLOYMENT; all static URLs pass through asset-url.js or Vite CSS processing for `/Portfolio/`.

## Approved appearance and content

- Orange open Jeep on a low-poly coastal island; smooth raised water, faceted land/tunnels, palms. Home landmarks: avatar/dev desk/arcade/gears/mailbox.
- Header Lead Unity Developer,9 YEARS badge with OF EXPERIENCE separate; title Hafeez Akram - Lead Unity Developer on every route. Header Home/Projects/Career/Resume/Say hello active coloring.
- Deep-teal/cream physical labels, amber number tile,1.25x; fixed character spacing with measured minimum/growing widths. Companies title case. Round C rooftop logo-only badges 1.25x with 3 px inner disk safety padding; originals/aspect ratios retained.
- Gray-green inset parking bays with warm trim. Year board is 3D and shows only rolling year; source timelineYear anchors now use approved employer dates rather than the original sample-only 2017 sequence.
- Warm-sand dock, compact corners, larger copy/buttons. Career: overview-only,50%media left/50%text right, no Work tab or Resume utility. Projects: two photo slots and one View all X photos[& videos] control; no separate Watch/link action.
- Intro: supplied young.jpg copied unchanged to hafeez-akram.jpg, square right crop, close text spacing, intrinsic-width Explore fully visible without nested scrolling. Home square cream-outline Resume utility is vertically centered; header Resume always available.
- Contact: wide portrait banner, downward `right 20%` crop. Email/LinkedIn/GitHub/WhatsApp and both full-time/freelance availability confirmed. Mailto opens configured draft handler; HTTPS opens safe new tab; WhatsApp opens chat only, never sends.
- Résumé remains the original supplied PDF. Website uses newer 9 years/ongoing Arkadium facts; do not silently rewrite PDF.
- Skills:25 confirmed entries in six categories; green Strong, blue Working knowledge, yellow Learning. Categorical animated bars, no numerical ratings. Only available level filters appear; unavailable selection resets All. Paging 6 desktop/4 narrow/2 short avoids internal scrolling. Seven bouncing/colliding Unity/C#/Firebase/WebGL/Cloud/AWS/VR badges preserve trajectories across filters and respect visibility/reduced motion.
- Rejected white ocean rollers, fish schools, yellow/purple date diamonds and End of route pier sign must stay removed.

## Travel, camera and persistence

- Home has Intro/Career/Projects/Skills/Contact; Career/Projects lengths follow records. Their longer islands maintain Home model scale and endpoint padding, rather than fitting the entire route.
- Left/Right keys (Up/Down legacy aliases), side controls, swipes, progress/bay/landmark clicks share drive rules. Holding an arrow continues on each arrival until release; release finishes current trip. Blur/hidden/route change clears held input.
- One opposite reversal per trip; clicked destinations cannot retarget mid-trip. Final~0.25 s approach allows one continuation without resetting speed. Jeep taps advance/bounce endpoints and cannot retarget while travelling.
- Details hide while moving and reappear on arrival. Enter/tap gateway prompt opens Career/Projects; Esc returns and is described below Back to island.
- Initial controls tutorial is one cream panel; desktop controls enlarge to center, mobile arrows pulse. Any input/resize dismisses. An untouched-page tour moves every 30 s until first input; dialogs/hidden/portrait pause with fresh interval, no catch-up.
- Default/reset fits Home to CSS viewport. Slider 10–600%; automatic mode refits on resize, manual mode preserves CSS-pixel scale/crops/follows. Frame calibration DEFAULT_FRAME_FILL=200/190 retains the approved tighter framing.
- Zoom key: `coastal-portfolio:view-zoom:auto-v1:{desktop|mobile}`; route values null=automatic. Route/index per-tab session restore: `coastal-portfolio:location:v1`. Denied/corrupt storage safely falls back.
- On restored long routes, Home is first built beneath loader to establish reference bounds. Then requested lazy route is prepared/restored; motion/gallery playback is not restored.
- Mobile portrait opens a rotation gate, landscape uses the 3D layout. Fullscreen/orientation lock needs device support and a gesture. Full ocean canvas replaces former solid mobile bars.

## Loading and media lifecycle

- Scene starts paused. Loader/section veil waits for requested route module, rooftop logo completion, currently shown image decode attempts, shader compilation and explicit rendered frame. Full-gallery/video downloads are excluded. No timer masquerades as readiness.
- Slow successful lazy sections automatically reveal when ready; the former 10 s cutoff is removed. Actual section-load errors show connection/retry feedback. No service worker or guaranteed offline mode; initial document/script failure cannot display app feedback.
- Startup failure offers Retry 3D and Simple view. After 15 s pending startup offers optional Simple view while preparation continues. Reconnect retries a failed startup. Simple-view project galleries work even without 3D.
- WebGL loss pauses and covers the scene; restored context recompiles/renders current route then resumes. Shader errors cannot mark blank frame ready. Browser page-cache departure suspends retained renderer; pageshow resumes rather than reviving disposed resources.
- Images: two small preview slots. More than two rotate/fade pairs every 4 s; next pair decoded before swap, IDs/alt/click targets update atomically. Hidden/card/dialog/travel/transition pauses and disposal cancel timers/fades; reduced motion swaps directly.
- Single-project employers show at least two screenshots of the same project, cycling its photos. Multi-project employers cycle one cover/project; each opens that project's whole gallery while staying Career. No approved media means placeholder.
- Mixed gallery shows photos then videos, thumbnails scroll within modal. Selected full image loads and preloads at most one next image; never next video. Video source assigned only on selection, preload none, no autoplay; changing/closing releases playback/source.

## Rendering and memory

- Active driving/camera settling targets 30 FPS, settled scenery 20 FPS. Simulation only runs on due frames; deliberate budget is excluded from adaptive-quality timing.
- Open dialogs and hidden tabs stop setAnimationLoop entirely; named overlay/transition/context/page-cache pauses compose. Resume resets clocks; engine fades while paused.
- Travelling/settling shadows update EVERY rendered frame and once on arrival. Settled maps cache 2 Hz. This corrects jitter introduced by 10 Hz active shadow caching; active cost is higher than that earlier pass.
- Static material/spatial batches 24 units; instanced palm canopies retain parent motion, duplicate geometries retired and GPU instance buffers disposed. Generous station/palm/boat/fish culling skips offscreen updates; hidden fish cannot produce false landing sounds. Temporary matrices/vectors reused.
- Adaptive high/medium/low affects shadows/ocean detail/scenery/smoke; startup raster resolution remains stable for boards. DPR desktop/mobile: high 1.5/1.5, medium 1.25/1.5, low 1/1.25. Shadows 2048/1024/512. Raising mobile DPR adds pixel cost, below full retina resolution.
- Water mesh fine near/coarse far; CPU boat/fish heights match displaced triangle surface. Preserve this matching.
- Opt-in `?benchmark=label&quality=high` (medium/low optional); console `[coastal-performance]` has bounded 10 s windows after 2 s warmup, route separation/reset, draw/triangle/resource/CPU/timing metrics. Disabled ordinarily, no telemetry.
- docs/PERFORMANCE_REVIEW_2026-11-09.md records~45–52% fewer idle submissions per frame in tested desktop environment. Historical profiling predates mobile DPR increase/active shadow correction. No guaranteed hardware FPS, total GPU/process memory or proven long-session leak claim.

## Sound

Default on subject to browser autoplay; Start sound fallback and gesture unlock. `coastal-portfolio:sound` persists/synchronizes mute. Mute disposes all sources/mixer and closes AudioContext; identity checks prevent stale resume/decode from reviving audio. Hidden tabs suspend; normal pagehide/HMR disposes, browser page-cache suspends.

| Channel/control | Value |
| --- | --- |
| Master |0.8|
| Ocean A/gentle shoreline |0.081|
| Engine |0.38|
| Idle A/smooth purr |0.45 stopped,0 moving|
| Driving B/rugged growl |0.6–1.0 with speed,0 stopped|
| Splash channel/voice |0.5/0.65|
| Interface |0.35|
| Limiter threshold |-3dB|

Fish A is CC0 recorded splash by wormer 2; sound on 20% of eligible visible landings, animation frequency unchanged. UI click/arrival/transition cues are mixed/throttled. Decodes reused, M4A preferred/WAV fallback, one-shots bounded and never queued late. Keep fetch wrapper to avoid bare fetch receiver Illegal invocation. Provenance in public/audio.

## Limits and safe storage

- Physical A54/Chrome retest, native orientation/fullscreen/audio perception and low-end smoothness remain unverified. Browser viewport checks are not physical-device proof.
- No admin/auth/upload/import/export implemented; future requirements retained separately.
- Keep `public/` and `.git` for future builds/history. User's original Downloads files can be removed if backed up on Drive; originals are not runtime dependencies. `node_modules/` and `dist/` are regenerable; rerun npm ci/build as needed.
- Never place private review inventories, drafts, credentials or JSON backups under public or in Git. Source originals/provenance/licenses remain traceable without shipping oversized originals.
