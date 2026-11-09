# Team log

Dates use the user's **Asia/Karachi** calendar. Append new entries; do not rewrite earlier decisions as though they were final at the time. Current accepted state is summarized in `docs/HANDOFF.md`.

## 2026-11-07 to 2026-11-08 — Portfolio implementation and iteration

**Agent: codex-bankd-macbook**

This consolidates work recorded in this chat rather than inventing timestamps/commits for each iteration. Changes are in the working tree; this log does not claim they were all committed or published.

### Foundation, navigation and travel

- Built/iterated the vanilla JavaScript/Three.js coastal portfolio, with five Home stops and separate Career/Projects islands.
- Added island fades through near-black teal, loading under cover, camera/card-image readiness before reveal, input blocking and reduced-motion behavior.
- Added clicked parking-bay/landmark/progress navigation, shared movement input rules, acceleration/braking and direction-aligned parking.
- Refined repeated-input locking, immediate arrival unlock, one reversal, last-passed stop tracking and approach-window continuation without restarting velocity.
- Added mobile side Previous/Next controls that remain when details hide during travel, plus keyboard/touch swipe support.
- Added subtle idle Jeep vibration, independent wheel/suspension motion and white exhaust smoke.
- Added/enlarged Back to the island, Home in the header, active-section coloring and Enter/tap-to-explore messages at Career/Projects gateways.
- Preserved gallery, related-work return, simple view/WebGL fallback, reduced motion and mobile rotation/fullscreen affordances.

### Art, labels, layout and typography

- Produced comparison options/renders in the sibling review workspace for icons, label colors/designs, buildings, parking, details layouts/colors, résumé controls, water and responsive views.
- Selected Home landmarks: Intro 1/avatar, Career B/dev desk, Projects C/arcade, Skills B/gears, Contact 1/mailbox. Added slow bobbing and shortened desk legs.
- Selected career building set B with distinct variants; addressed building/rock intersections, jitter and palm leaves crossing buildings.
- Selected label design B, deep teal and 1.25x size; removed tiny extra text. After HELLO board/rock fixes and further review, replaced the board with the approved avatar.
- Selected parking option 2: gray-green inset bays with warm outline/markings.
- Iterated details design B through olive/neutral alternatives; final choice is warm sand with smaller corners and reduced height. Moved media left, increased body/button type and improved image maximize contrast.
- Iterated résumé blue/sky-blue options; final choice is cream outline.
- Updated title to Senior Unity Developer; enlarged 9 YEARS separately from OF EXPERIENCE, adjusted breadcrumb placement/size and increased Simple view text 1.35x.
- Reorganized zoom/driving hints beneath centered navigation; utilities below Say hello, help outline circular.
- Enlarged loading-screen copy 1.25x and expanded its card for the larger headline.

### Ocean, scenery and career timeline

- Added boats/jumping fish, landing rings/droplets, a modern moored motorboat and offshore fishing area; moved the pier/boat inward to reduce edge clipping.
- Removed fish schools at the user's request and retained individual jumpers. Increased visual jump frequency earlier in iteration.
- Iterated water options, removed rejected roller/white foam bands, added raised smooth swells/finer shading and matched boat/fish sampling to the actual rendered surface.
- Added minor palm leaf movement and corrected prop/rock placement.
- Added career timeline rails/progress markers and a 3D year board animated with car travel. User approved sample years **2017 through current** until real employment data is supplied.
- Removed unwanted yellow/purple placeholder diamonds/date plates and the End of route pier board.

### Responsive zoom and performance

- Added per-view zoom sliders/values, extended maximum to 300%, simplified the label to Zoom and iterated defaults.
- Final default/reset zoom: **desktop 200%, mobile 130%**, with independent route/device storage and legacy/custom-value migration.
- Changed camera fitting to preserve model CSS-pixel scale across resize; smaller windows crop/track instead of shrinking the whole island. Removed solid mobile top/bottom background bars.
- Implemented the user-selected optimization work: adaptive quality/DPR, variable ocean detail, shadow scaling, static mesh batching, lazy section models and opt-in measurement.
- Recorded Home sample draw calls falling from roughly 1,390 to 560 including shadows; evidence in `../optimization-results.json`. Did not claim guaranteed low-end phone FPS.
- Added behavioral tests for camera scaling, driving/navigation, batching, adaptive quality, lazy loading/retry, water sampling, section/Jeep construction and audio lifecycle.

### Sound selections, cleanup and final mix

- Defaulted sound on for new visitors; added post-loading autoplay attempt and Start sound fallback for browser restrictions.
- User selected Ocean A/gentle shoreline, Idle A/smooth purr and Driving B/rugged growl. Prepared seamless loop assets with M4A compression/WAV fallbacks.
- Driving audio follows actual velocity with short start/stop fades and idle crossfade, rather than playing a full long rev for a short trip.
- Replaced rejected bouncy synthetic splash auditions with recorded-water alternatives. User selected A, based on wormer2's CC0 recording; source/license retained in `public/audio/provenance.json`.
- Reduced ocean volume first to 75% of its earlier level, then by a further 60%, ending at **0.135**.
- Corrected the fish request from volume to frequency: restored approved splash volume, reduced sound to every other eligible landing, then finalized **20% / one in five**. Fish animation frequency remains unchanged.
- Fixed persistent mute, cross-tab preference updates, hidden-tab suspension, full source/context cleanup on mute/exit/HMR and stale asynchronous resume protection.
- Found an independent audio-playing QA preview contributing to apparent continued sound after another tab was muted. Muted/closed extra previews and documented the testing pitfall.
- Fixed the fetch receiver “Illegal invocation” bug; tested fallback decode, duplicate-load prevention, late/disposed decode handling and bounded one-shot playback with no delayed event queue.
- At the user's request, independently chose/implemented remaining UI audio: soft button taps, short two-note arrivals and airy island-transition swishes. Removed placeholder chimes; throttled rapid repeats.
- Balanced final mixer: master **0.8**, ocean **0.135**, engine **0.38**, idle loop **0.45**, splash **0.5** with voice **0.65**, UI **0.35**; limiter threshold **-3 dB**.
- Rendered a representative 16-second preview in `../design-review/public/audio/final-coastal-mix.wav`; report: **zero clipped samples**, peak approximately **-18.45 dBFS**. This does not establish physical-device loudness or every possible live overlap.
- Browser checks verified click dispatch, driving/idle switching, arrival after stopping, island swish, no audio console errors and mute with context closed. Restored mute and closed the final test tab.
- Latest implementation validation: **37 tests passed; production build passed**. Corrected help copy to reflect default-on sound and remembered mute.

### Admin and hosting planning

- Prepared an admin handoff prompt. User confirmed one-owner email/password login, private drafts/explicit Publish and portable JSON including image/résumé file contents.
- Discussed static/frontend/backend separation, GitHub Pages constraints, Supabase inactivity pauses and Cloudflare Workers/D1/R2 as a possible alternative to investigate.
- User then explicitly **deferred admin**, choosing static publication first and adding admin later with the same portfolio URL.
- Verified the static build. Identified missing Pages workflow/remote and root-relative runtime asset URLs requiring repository-subpath fixes. No GitHub deployment was performed.
- Older Sites identity remains in `.openai/hosting.json`; earlier source credential attempts returned NOT_FOUND. Do not imply the older hosted copy contains all later local changes.

## 2026-11-08 — Documentation and takeover preparation

**Agent: codex-bankd-macbook**

- Added workspace/app `AGENTS.md` entry points and this team log.
- Replaced the stale README: removed incorrect 112% defaults, fish schools/roller bands, old details ordering/date placeholders and sound-off/no-download claims.
- Added handoff, content-editing, deployment and deferred-admin guides covering source ownership, approved design/audio, storage/configuration, asset provenance, validation and outstanding work.
- Preserved runtime code/behavior. This docs task does not implement admin, configure Pages or publish anything.
- Verification: documentation links checked after writing and source/configuration facts cross-checked against the checkout. Runtime checks above are prior implementation evidence, not new hardware/deployment validation.
- Next: inspect `git status`, read the handoff, then make the user's requested change. Release blockers remain Pages setup/base paths, real data/URLs and physical-device QA.

## Template for later entries

```text
## YYYY-MM-DD — Short task title
Agent: your-identity
- Request and outcome:
- Files/areas changed:
- Validation performed:
- Limitations / deployment status:
- Next steps:
```


## 2026-11-08 — Jeep taps, opening controls hint and untouched-page tour

**Agent: codex-bankd-macbook**

- Added Jeep-first raycasting (including batched/nested geometry), pointer affordance and tap-to-advance via the existing drive controller. Taps move forward to the last stop, backward to the first, then forward again; taps during travel remain locked and route changes reset the direction.
- Added a once-per-page-opening Home controls introduction: the real desktop keyboard hint enlarges/centers and returns on first interaction; mobile arrows pulse beside the details dock. The overlay does not intercept the first click/touch. Reduced motion skips animation.
- Added a no-input tour starting after loading: one stop every 30 seconds with endpoint reversal. The first click/touch/key/scroll/input or window resize cancels the loop for that page opening. Input during loading prevents late onboarding/auto-start. Background/portrait pauses do not produce catch-up movement; active trips/dialogs/transitions are respected.
- New modules: `src/visitor-tour.js`, `src/controls-intro.js`; integrated through `main.js`, `scene.js` and scoped CSS. Added scheduler/direction/raycast tests and a regression test ensuring completed fill-forwards animations release the centered transform on dismissal.
- Validation: **44 tests passed; production build passed**. Browser verified actual Jeep taps from Intro to Career and Career to Projects, desktop hint returning to the header, mobile pulse layout, real untouched 30-second advance and mobile arrow takeover. Source/timer tests cover repeated intervals, endpoint reversal, cancellation, paused time and loading-time interaction.
- Review images: `../controls-intro-desktop.png`, `../controls-intro-mobile.png`. Temporary audio-muted QA preview is closed after verification; viewport override is reset.
- Updated README, agent instructions and handoff. No admin or GitHub deployment changes.
- Follow-up steering: tutorial, regular keyboard hint and help now show Left/Right arrows (← / →); Up/Down remain supported aliases. Browser also confirmed no further auto-advance after the first mobile input.


## 2026-11-08 — Section Escape shortcut hint

**Agent: codex-bankd-macbook**

- Added “Press Esc to go back” directly beneath Back to the island on Career/Projects, with an Esc keycap and compact responsive styling. Hidden on the Home route.
- Updated `src/main.js` route rendering and `src/style.css`; existing Escape navigation behavior is retained.
- Validation: production build and browser check of section visibility/Home hiding; no new behavioral test needed for this display-only change.


## 2026-11-08 — GitHub Pages preparation and deployment guide

**Agent: codex-bankd-macbook**

- Added pinned official Pages Actions workflow: Node 22, install/test/build, `dist/` artifact and Pages deployment on `main`. Vite base is derived from the actual Pages configuration, supporting root and repository URLs.
- Added shared base-aware runtime URL helper for UI images/galleries/local document links and the shared audio loader. Preserved external URLs, audio mix and all existing behavior; CSS fonts/lazy chunks are handled by Vite.
- Updated agent instructions, README, deployment guide and handoff. Recorded user's future Google Drive workflow: confirm each section, company and project before applying; admin remains deferred.
- Validation: 46 tests passed; production build with `PAGES_BASE_PATH=/portfolio/` passed; all 32 built files returned exact content at the local repository subpath, including fonts/audio/lazy chunks. No new browser or hardware claims.
- Publication pending: GitHub CLI is not signed in; destination repository is unknown and no Git remote exists. No commit, push or public repository creation performed. Next: user creates/supplies empty repository, enables Pages via Actions and completes browser login; then publish and verify the returned live URL.


## 2026-11-09 — Screen-fitted default zoom

**Agent: codex-bankd-macbook**

- Replaced fixed desktop/mobile defaults with a fit calculated from Home's projected geometry and CSS viewport. Automatic mode refits on resize; manual zoom retains fixed model scale. Reset clears the route override and restores automatic fitting.
- Career/Projects retain Home scale regardless of record count. Camera endpoint clamps align the extended island's starting edge with Home's left padding; extra stops extend off-screen rather than shrinking all models.
- Expanded slider to 10–600% so large and small screens can display their fitted value. Saved manual overrides use a new `auto-v1` key; old fixed zoom values do not defeat the new default. Foreground/pier scenery may sit behind the details dock, matching the supplied composition.
- Validation: 47 tests passed, including fit constraints at 3572×1708, 1920×1080, 1280×720 and 844×390; production build passed. Browser verified automatic values of 204% at 1920×1080, 134% at 1280×720 and 88% at 844×390; Projects extends to the right at unchanged scale and manual slider/Reset work. Physical phones not tested.
- Screenshots: `../auto-zoom-desktop.png`, `../auto-zoom-projects.png`, `../auto-zoom-mobile.png`. No publication or data changes; GitHub setup remains pending.


## 2026-11-09 — Initial GitHub publication

**Agent: codex-bankd-macbook**

- User supplied the public destination `https://github.com/breaker-of-code/Portfolio` and completed GitHub CLI login. Verified repository is empty and Pages uses workflow builds, with HTTPS enabled.
- Publishing all production source, modules, docs, media/fonts/audio and workflow to `main`; retaining old Site metadata and existing history. No admin or real-data edits. Design auditions and parent-workspace files stay outside the app repository.
- Preflight: all 47 tests passed; build with exact case-sensitive `PAGES_BASE_PATH=/Portfolio/` passed. Verified pinned Actions commits exist. Checked publishable files for common credential/private-key patterns; none found. Build output/node_modules stay ignored.
- Expected public URL: `https://breaker-of-code.github.io/Portfolio/`. Actual workflow/deployment verification follows the push; do not treat this entry alone as proof it is live.

- Publication verified: Actions run `42607740759` succeeded for application commit `e9f17ca`; live URL `https://breaker-of-code.github.io/Portfolio/`. All 47 tests passed in GitHub CI. All 32 live deployment files match the local production build byte-for-byte, including fonts, images, audio and lazy JS chunks. Updated current-state docs to record the destination and deployment. Historical pending entries above describe earlier states.
