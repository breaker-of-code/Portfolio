# Current implementation handoff

Updated **2026-11-09** by **codex-bankd-macbook**. This is a maintained snapshot, not a claim that future code changes are already reflected here.

## Current decision and next priorities

The user chose **static hosting first; admin later**. Content edits currently require source changes and redeployment. The static build and 47 tests pass. GitHub Pages is live at `https://breaker-of-code.github.io/Portfolio/`, from `breaker-of-code/Portfolio` on `main`. First deployment succeeded on 2026-11-09.

1. Preserve the live Pages workflow; future pushes to `main` automatically deploy.
2. After deployment, use the user's connected Google Drive for real content. Confirm EACH section, company and project with the user before applying it; retain illustrative data until then.
3. Verify the actual hosted URL, including lazy sections, fonts and audio.
4. Test physical phones, native orientation/fullscreen behavior and lower-end hardware. Browser viewport checks are not physical-device validation.
5. A future admin must publish public data/media independently of live backend availability, so inactivity of the editor cannot take the portfolio offline.

## Workspace and source map

Workspace: `/Users/arkadium/Documents/Portfolio`. Main app: `coastal-portfolio/`. Auditions/preparation scripts: `design-review/`.

| Files | Responsibility |
| --- | --- |
| `src/main.js` | DOM, details/gallery/help/simple view, navigation bindings, section fade, orientation and audio orchestration |
| `src/content.js` | Profile, projects, companies, skills and hub records |
| `src/navigation.js` | Route/index state and returning to the originating hub stop |
| `src/drive-controller.js`, `src/motion.js` | Shared input locking, reversal/continuation and actual acceleration/braking |
| `src/scene.js` | Three.js world, camera, routes, picking, timeline, animation and renderer lifecycle |
| `src/visitor-tour.js`, `src/controls-intro.js` | Endpoint-bouncing Jeep taps, untouched-page 30-second tour and first-opening control animation |
| `src/camera-layout.js` | Fixed reference frame, cropping and camera-follow helpers |
| `src/jeep.js`, `src/exhaust.js` | Jeep geometry, independent animation roots and smoke |
| `src/ocean.js`, `src/ocean-waves.js`, `src/ocean-grid.js` | Scenery, shader/CPU wave sampling and variable-detail water mesh |
| `src/intro-avatar.js`, `src/developer-desk.js`, `src/arcade.js`, `src/skills-gears.js`, `src/contact-mailbox.js` | Approved Home landmarks |
| `src/career-building.js`, `src/project-icons.js`, `src/route-assets.js` | Lazy-loaded longer-island landmarks |
| `src/quality.js`, `src/mesh-batching.js`, `src/performance-probe.js` | Adaptive quality, static batching and opt-in diagnostics |
| `src/ambient-loop.js`, `src/sound-effect.js` | Cached decoding, format fallbacks, loops and bounded one-shots |
| `src/sound-mixer.js`, `src/interface-sounds.js`, `src/sound-preference.js` | Channel mixing, cue throttling and persistent mute |
| `src/style.css` | Theme and responsive layout; later overrides supersede earlier rules |
| `public/` | Shipped media, audio and fonts; everything here is public |

## Accepted art and layout

- Low-poly coastal islands, orange open-top Jeep, sand, faceted rocks/tunnels and stylized palms. Water was refined to look smoother than the land geometry.
- Header: **Senior Unity Developer**, official Unity mark and enlarged **9 YEARS** badge with OF EXPERIENCE kept separate. Some strings remain hardcoded in `main.js`.
- Header navigation: Home, Projects, Career, Resume, Say hello, with active-section coloring. Utilities sit below the right-side navigation; help has a circular outline.
- Hub choices: Intro **1/avatar**, Career **B/dev desk** with shorter legs, Projects **C/arcade**, Skills **B/gears**, Contact **1/mailbox**. Gentle icon bobbing and palm-leaf sway.
- Physical labels: selected **B**, deep teal/cream, amber number tile, **1.25x** size, no tiny subtitle above the label.
- Parking: selected **2**, gray-green inset bays with warm trim/markings. Parked Jeep direction matches the bay/road.
- Details: selected layout B, finally **warm sand**, compact 8–9px corners and shorter height, media on the left. Larger details/button text. Résumé is **cream outline**, replacing rejected blue variants.
- Gateway Enter/tap-to-explore message sits above the details dock. Mobile side navigation remains when details hide.
- Loading copy enlarged **1.25x**; desktop headline 33.75px, mobile override 30px.
- Rejected: fish schools, folded/intersecting HELLO board, artificial white roller/tide bands, yellow/purple placeholder diamonds/date plates and the End of route pier sign. Intro ultimately uses the avatar instead of a HELLO board.

## Travel and island behavior

- Tapping the parked Jeep moves one stop in the current tap-tour direction, reverses at the last stop and returns to forward at the first. The shared drive controller blocks taps while travelling; direction resets when changing islands. Raycasting prioritizes the Jeep over the bay beneath it.
- On the initial Home load of each page opening (not each return Home), the actual desktop keyboard hint enlarges/centers; mobile side arrows pulse beside the dock. Any click/touch/key/scroll/input or window resize dismisses it. Input during loading prevents it from appearing later. Reduced motion skips animation.
- With no interaction, a timer starts once loading is ready and advances every 30 seconds, bouncing at endpoints. First interaction cancels it permanently until a fresh page load. Hidden/portrait time is paused with a fresh interval on resume; dialogs, transitions and moving scenes cannot be overridden.
- Right next, Left previous (Up/Down remain supported aliases); tutorial, regular controls hint and help show ← / →. Click/tap a bay, landmark or progress stop for a direct trip; touch swipes and side buttons work too.
- Repeated input cannot restart a trip. One opposite command reverses toward departure/last-passed stop, then input locks until arrival.
- In the last approximately 0.25 seconds of forward travel, one command may extend through the next stop without resetting velocity. Clicked destinations do not retarget an in-progress trip.
- Actual signed velocity is maintained by `advanceDriving`; maximum speed is exported from `motion.js`. Audio follows speed rather than a long prerecorded rev.
- Details disappear during travel and return on arrival. Idle body vibration, rotating wheels and white exhaust remain independent of static batching.
- Career/Projects show “Press Esc to go back” below Back to the island; the hint is hidden on Home.
- Island changes fade through near-black teal, load section assets under cover, render the camera and decode card images before reveal. Input is blocked. Reduced motion skips the fade.
- Career uses distinct building variants, timeline rails and a 3D year board animated with car progress. **2017 through current year is sample data**, not verified employment history.
- Island length follows record count; four companies/eight projects are current sample counts, not hard limits.

## Camera and responsive behavior

- Default/reset zoom fits the projected Home frame to the CSS viewport, allowing foreground scenery behind the details dock as in the approved reference. Slider **10–600%**. Per-route/device custom values persist under `coastal-portfolio:view-zoom:auto-v1:*`; old fixed defaults are not imported. Null means automatic fit.
- Storage: `coastal-portfolio:view-zoom:v4:desktop` and `coastal-portfolio:view-zoom:v3:mobile`; desktop legacy/custom-value migration exists.
- Camera helpers retain the 1280×720 scale reference. Automatic mode refits on resize; manual mode retains CSS-pixel scale and crops/follows. Longer routes use Home framing, never fit their full extended length; endpoint clamps preserve edge padding.
- Full canvas ocean continues behind mobile chrome; old solid top/bottom background bars were removed.
- Mobile/touch portrait uses a rotation gate. Fullscreen/orientation lock is attempted through a user gesture; hardware/browser support still needs physical testing.
- Simple view handles a text/images preference and WebGL startup failure. Preserve it and reduced-motion behavior.

## Audio: final accepted mix

| Channel/control | Value |
| --- | --- |
| Master | 0.8 |
| Ocean | 0.135 |
| Engine | 0.38 |
| Idle loop | 0.45 stopped, fading to 0 while moving |
| Driving loop | 0.6–1.0 with speed, fading to 0 on stopping |
| Splash channel / voice | 0.5 / 0.65 |
| Interface channel | 0.35 |
| Master limiter threshold | -3 dB |

- Selections: Ocean **A/gentle shoreline**, Idle **A/smooth purr**, Driving **B/rugged growl**, Fish **A/recorded short splash**.
- Fish sound is **one in five eligible visible landings (20%)**. Fish animation frequency is unchanged. Earlier splash-volume reductions were explicitly undone after the user clarified frequency.
- UI sounds: soft button tap, two-note arrival when actual travel ends, short airy island swish. Placeholder `chime()` was removed.
- Sound defaults on for new visitors. Autoplay is attempted after loading; browser policy may require a gesture. Start sound must work without moving the car.
- Preference key `coastal-portfolio:sound` stores `on`/`off`. Mute persists and synchronizes same-origin tabs via storage events.
- Mute disposes/disconnects every source and closes the AudioContext; unmute recreates it. Context identity checks block an old pending resume from restoring sound.
- Hidden tabs mute/suspend audio. `pagehide` and Vite hot-disposal release it. Close QA tabs: an independent audio-playing preview previously caused confusion after another tab was muted.
- Decode requests are cached/deduplicated, M4A preferred with WAV fallback. One-shots are bounded; missed events are not queued to play late.
- Keep the fetch loader wrapper `(...args) => fetch(...args)`; calling a stored bare fetch as an object method caused “Illegal invocation” in the browser.
- Most audio is original synthesis. Splash A is a CC0 recording by wormer2. Source/license and gain decisions are in `public/audio/provenance.json`.

## Optimization and evidence

- Adaptive high/medium/low quality controls DPR, shadows, ocean detail, scenery update rate and smoke emission. Hardware hints and timed frame windows use warmup/cooldowns.
- High DPR caps desktop/mobile: 1.5/1.25; medium: 1.25/1.15; low: 1/1. Shadow maps: 2048/1024/512.
- Static batching uses material/spatial groups while keeping animated landmark roots, Jeep suspension/wheels and picking behavior independent.
- Water is finer near the island/coarser offshore. CPU boat/fish height sampling matches the displaced rendered surface; do not replace it with a flat approximation.
- Career/Projects models load lazily; pending requests are shared and failures can retry, with a route-load error fallback.
- Historical Home sample: roughly **1,390 → 560 draw calls including shadows**, approximately 60% fewer. Not a fixed count for all routes/viewports/devices.
- Local evidence: `../optimization-results.json`. Probe URL: `?benchmark=my-label&quality=high` (or medium/low); read the `[coastal-performance]` console record after sampling.
- Browser automation timing made FPS unreliable. Do not claim guaranteed 60 FPS or proven low-end phone smoothness.

## Checks and remaining limits

Latest implementation verification before this docs task: **44 tests pass; production build passes**. Browser checks verified click dispatch, moving/idle crossfade, arrival timing, island swish, no audio console errors, and mute reaching a closed context.

A representative 16-second rendered mix had no clipped samples and a peak near **-18.45 dBFS**. This is not a physical-speaker listening test or every possible live overlap.

Earlier viewport checks covered portrait/landscape phones, tablet, desktop and wide desktop. Physical-device/cross-browser validation, native orientation lock and device audio perception remain outstanding.

- No service worker/guaranteed offline mode. Lazy-route failures report a connection/retry message; a failed initial document/script cannot run an in-app warning.
- Real profile/company/project data and URLs are missing. The illustrative `demo` markup is shared, not solely controlled by record flags.
- No Git remote or Pages workflow was present at the latest readiness inspection. Many implemented modules/assets remain untracked; include them in a real release commit.
- The older Sites URL/configuration is not proof of current hosted content. Earlier source credentials returned NOT_FOUND; this task did not deploy an update.

## Historical artifacts and tooling

- `../design-review/` holds option pages, renders and audio audition/preparation scripts; do not publish it as the app.
- Scripts include ocean/idle/driving option generators, `build_idle_loop.py`, `build_driving_loop.py`, `prepare_recorded_splash_options.py`, `build_interface_sounds.py`, `render_final_audio_mix.py`.
- `../design-review/public/audio/final-coastal-mix.wav` and `final-mix-report.json` are a review mix and measurements, not production dependencies.
- Historical screenshots are iteration evidence, not instructions to restore rejected designs.
