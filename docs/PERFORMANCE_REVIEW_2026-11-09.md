# Local performance review — 2026-11-09

Agent: codex-bankd-macbook. Baseline profile followed by the user-approved optimization pass below.

## Method and limits

Production Vite build served locally at `/Portfolio/`, Codex in-app Chromium browser, 1440×900 CSS viewport. Machine: Intel i7-9750H MacBook Pro, 16 GiB RAM. Normal adaptive quality used for baseline; sound was autoplay-blocked initially, then muted. Existing review tabs were left intact. This is not an isolated native Safari/Chrome hardware trace and does not establish FPS on every device.

Opt-in `?benchmark=baseline` now reports successive bounded ten-second windows and resets on route changes. Each report excludes its first two seconds. Added whole-frame CPU timing beside renderer-submission CPU timing; GPU execution time, GPU memory and complete browser-process memory are not measured. Heap is JavaScript only. Transfer-size totals are cache-dependent, not the full asset download size. Private raw output is in sibling `content-review/performance-baseline.json`.

## Measurements

| State | FPS | Median draw calls/frame | JS heap | GPU geometries / textures |
| --- | --- | --- | --- | --- |
| Home, low effects after adaptation | 32.6–33.0 | 608–610 | 24–33 MB | 378–379 / 12 |
| Career, low effects | 32.7–34.2 | 697–703 | 39–42 MB | 437 / 20 |
| Projects, low effects | 34.2–34.3 | 678 | 45–47 MB | 410 / 13 |
| Projects with photo gallery open | 25.4–26.1 | 676–679 | 46–48 MB | 410 / 13 |
| Return Home after Career/Projects/gallery | 27.6–30.1 | 609–616 | 28–32 MB | 372–378 / 12 |

Typical measured whole-frame CPU p95 was about 4.7–6.4 ms, mostly renderer submission. Frame intervals were commonly around 33 ms and sometimes 50 ms with the gallery. These measurements do not isolate GPU/compositor time from browser scheduling.

## Findings

- Substantial continuous render work remains even when parked: roughly 600–700 draw calls per frame, including shadow work. Existing batching is already saving hundreds of calls; it is not absent.
- Adaptive quality drops effects/shadow size, but deliberately retains the startup render pixel ratio. In this run Low effects still rendered 2160×1350 at DPR 1.5, or 2.25× CSS pixel count.
- The full 3D scene keeps drawing behind photo galleries; the gallery’s backdrop/compositing coincided with worse frame rate.
- Home geometry/texture counts and heap returned near their starting values after a route/gallery cycle. No obvious accumulating leak in this short check; this does not rule out longer-session, image-decoding or GPU-memory issues.
- Videos remain on demand; the large media directory is not all loaded on initial Home entry.
- Source also requests high-performance graphics, redraws shadows continuously and applies a CSS saturation/contrast filter to the full canvas. Each merits a controlled follow-up rather than claiming a measured individual saving.

## Diagnostic resolution comparison

A fixed Low/DPR1 run rendered 1440×900 instead of 2160×1350 (56% fewer pixels), but did not demonstrate an FPS improvement: stabilized Home samples were about 29.6–29.7 FPS. Early samples overlapped another benchmark tab and are excluded from comparison. Browser scheduling/shared GPU activity prevents a clean isolated A/B conclusion; reducing DPR alone is not a proven fix here. Preserve this caveat when recommending it. Both benchmark tabs were closed and viewport override reset afterward.

## Recommended next approvals

1. Pause 3D behind gallery/help/Simple view and when the document is hidden; keep input/restore behavior correct.
2. Let adaptive quality reduce canvas DPR under sustained load; retain DOM text quality and evaluate in-world board readability.
3. Cache static shadow work and reduce updates for dynamic shadows; investigate additional batching/instancing and offscreen scenery updates.
4. Offer a balanced 30 FPS / parked idle budget so graphics work is bounded rather than continuously attempting maximum refresh.
5. Run a longer route/gallery/video memory soak after those changes before proposing further asset-quality reductions.

The requested browser title is now `Hafeez Akram - Lead Unity Developer` at initial load and on every route. No publication.

## Approved optimization implementation

User approved all four follow-up items. Rendering now targets30FPS for driving/camera settling and20FPS when idle. Open dialogs/hidden documents stop the WebGL animation loop entirely; transition/overlay pause reasons compose, with clocks reset on resume. Static shadow results are reused between10Hz active and2Hz idle refreshes, plus forced refresh on route/zoom/resize/quality changes. This caches the whole shadow map between updates rather than maintaining separate baked/static and dynamic shadow maps.

Repeated swaying palm geometry is spatially instanced; duplicates are retired, matrix temporaries reused, and instance buffers disposed on route teardown. Static world batches use24-unit spatial cells. Stations/palm batches and ambient boats/fish outside the view skip rendering/animation work with safety margins; fish retain flight state to avoid false splash cues on reentry. Canvas DPR, user zoom and ocean shape remain unchanged.

Initial post-change samples at the same1440×900 viewport / DPR1.5:

| Route | Before median calls/frame | After median calls/frame | After target / observed idle FPS |
| --- | --- | --- | --- |
| Home |608–610 |335–343 |20 /19.0–19.7 |
| Career start |697–703 |359–366 |20 /18.8–19.5 |
| Projects start |678 |324 |20 /19.3–19.5 |

These are roughly45–52% fewer submissions per rendered frame, before accounting for fewer idle frames. Post-change examples retained High effects/2048 shadows while the earlier baseline had adapted to Low/512, so this is not a fixed-quality GPU A/B. The intent is less sustained work, not claiming a higher uncapped frame rate. Post-change Home geometry count344 vs baseline378; Career389–393 vs437. JS heap still fluctuates with GC/cache; do not claim a proven heap reduction.

Browser checks: Simple view and Help set the canvas to paused; performance reporting stopped throughout Help and resumed after closing it. A long Jeep trip paused under Help and continued after closing. Routes remain visible with shadows/palms preserved.

Final validation:74 tests pass, including scheduler/pause/instancing/offscreen fish coverage; exact `/Portfolio/` production build and whitespace checks pass. Browser confirmed gallery image navigation works while WebGL remains paused, closing resumes rendering, and no errors were reported. Long Career trip reached Infinity Up after Help pause/resume. Production raw optimized logs are in private `content-review/performance-optimized.json`; they include earlier reload/build sessions, so compare the final scene-B78mXD5p samples rather than treating all reports as one uninterrupted run.
