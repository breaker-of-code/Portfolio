# Current implementation handoff

Updated **2026-11-09** by **codex-bankd-macbook**. This is a maintained snapshot, not a claim that future code changes are already reflected here.

## Current decision and next priorities

The user chose **static hosting first; admin later**. Content edits currently require source changes and redeployment. The static build and 77 tests pass. GitHub Pages is live at `https://breaker-of-code.github.io/Portfolio/`, from `breaker-of-code/Portfolio` on `main`. First deployment succeeded on 2026-11-09.

1. Keep ongoing data changes local. Do not push: `main` auto-deploys. User wants one final publication after the complete data update is reviewed and approved.
2. Use the locally reviewed portfolio PDF and current resume; all seven company entries are approved, with editorial improvements authorized; confirm other sections and projects before local implementation. Preserve the ongoing Arkadium contract correction over the older resume end date.
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
- Header: **Lead Unity Developer**, official Unity mark and enlarged **9 YEARS** badge with OF EXPERIENCE kept separate. Some strings remain hardcoded in `main.js`.
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
| Ocean | 0.081 |
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

- Adaptive high/medium/low quality controls shadows, ocean detail, scenery update rate and smoke emission. Canvas resolution stays at the startup hardware tier so signs do not alternate between sharp and blurry; resize still applies the mobile/desktop DPR cap. Hardware hints and timed frame windows use warmup/cooldowns.
- DPR caps desktop/mobile: high 1.5/1.5; medium 1.25/1.5; low 1/1.25. Mobile resolution was raised on 2026-11-09 for label clarity; it remains capped below full retina DPR. Shadow maps: 2048/1024/512.
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


## Approved data, 2026-11-09

- Intro: Hafeez Akram, Lead Unity Developer, 9 years; exact approved bio lives in `src/content.js`.
- Resume: `/files/Hafeez-Akram-Developer.pdf` is the user's original PDF, publicly attached with approval, not a rewritten resume. Buttons/links work through the common base-path helper. The original PDF has older 8+ years / Arkadium end-date wording; website uses the user's subsequent corrections.
- Career: Arkadium only so far, Freelance Senior Unity Developer — Contract, Apr 2024–Present; work arrives as needed, no fixed-hours claim. Do not include unapproved project associations. UI handles an empty related-project list and a one-stop career route.
- Other companies/projects, contact fields and screenshots still need individual approval. Full private review inventory stays outside the repository at `../content-review/portfolio-inventory.json`.
- Details copy scrolls within the existing compact dock when long; no clipped text on mobile.

- Framing calibration: `DEFAULT_FRAME_FILL = 200 / 190` in `camera-layout.js` tightens automatic fit by 5.263% on every screen; scrolling-route endpoint padding uses the same calibration. Manual zoom stays untouched.

- Infinity-Up approved locally: Lead Unity Developer, Nov 2024–Present, 10 developers across 3 client and 3 in-house projects. Work list includes Galactic Peggle, Boat Magnet, Crossy Bridge, Clucky Chick and other games; shared architecture/standards and internal tools. Retention 27%/10%/8% at D1/D3/D7 is approved. Exclude Mushroom Spring and publisher-contract claims from the portfolio entry. Work/Impact text is available independently of approved related-project images. No deployment.

- Arthur Technologies approved locally: Senior VR Unity Developer, Mar 2021–Apr 2024. Refined overview, Work and Impact cover Unity/C#/Photon/AWS, multiplayer, VR-to-WebGL custom wrappers, EC2/S3 integration, memory/performance and real-time HD video. Budget/bandwidth metrics omitted; related-project links remain empty until project approval.

- No Borders Innovations approved locally: Senior Game Developer, Nov 2020–Mar 2021. Four-person team, Xana/Xana Live, Agora, AWS GameLift, QA/documentation improvements and on-time delivery. User authorized editorial review across descriptions; Intro and approved companies now use concise wording with consistent tense and less repetition. Unapproved projects/employers still require review.

- Experience approval is complete for all seven employers. Added Zepro Digital (2016–2017), Nutty Apps (2017–2018) and Five Rivers Technologies (Apr 2018–Oct 2020) from the reconciled sources. Descriptions are concise and factual; earliest roles have no invented metrics or results. Work/Impact tabs appear only when real content exists. Do not ask the user to re-approve experience records; clarify only material gaps/conflicts. Projects remain subject to review.

- Stop labels now use `label-layout.js` for fixed glyph size/tracking and measured minimum/growing plaque widths across Hub/Projects/Career. Career names retain title case, including Infinity Up. Rooftop options A/B/C are in `../design-review/rooftop-options.html`; user supplies logos, selection pending, no production rooftop design applied.

- Rooftop option C is selected and applied locally to all Career buildings. `rooftop-sign.js` adds a round cream/deep-teal badge and auto-width company nameplate, placed above each model's actual roof height before batching. Initials are explicitly placeholders until user logo files arrive; no fabricated official logos or network downloads. Career-only lazy loading is retained.

- Rooftop refinement: removed rooftop names (bottom route boards already name companies), enlarged option C to 1.25× and mapped all seven supplied logo files through `company.logo` under `/media/company-logos/`. Originals are copied unchanged; canvas rendering contains each logo on a white circular face without stretching. Loading callbacks are detached on texture disposal to avoid late route redraws. Provenance is beside the files. No external logo fetches or publication.

- Rooftop logo fit now fills the whole inner disk with a 3px safety margin on a 512px texture. `logo-layout.js` trims transparent/uniform source margins for display and fits the furthest visible artwork point to the circle, preserving proportions and preventing cropped mark edges. Original files remain unchanged.

- Latest company-dialog layout: no tabs, overview description only; left-to-right 50% project images / 50% overview text, without a resume control. A neutral image placeholder reserves the media area until assignments are provided. Broad resume buttons were removed from interactive details (header/Simple view unchanged).
- `company-gallery.js` resolves only explicit `projectIndices`, omits invalid/empty/duplicate associations and preserves full project image arrays. Company cover clicks open the existing gallery popup without navigating away from Career; real projects use a neutral gallery caption. Project assignments remain empty pending user mapping after project entry.

- Year board now shows only the centered rolling year; no yellow caption. Career and Projects dialogs have no resume control or reserved utility space; header Resume remains available. Board and rooftop textures use the GPU-supported anisotropy limit with mipmaps retained. Small supplied logos still have source-resolution limits. Stable startup DPR trades some adaptive fill-rate savings for consistent readability; physical low-end-device performance remains unverified.

- Arthur VR is approved and replaces the first sample project, index 0. Remaining seven sample stops await review; company assignments remain empty pending user mapping. Seventeen WebP screenshots and three full-duration H.264/AAC feature videos use separate small thumbnails/posters. `project-media.js` normalizes mixed galleries and bounds next-image preloading; `main.js` only assigns a video source on selection (`preload=none`, no autoplay), releasing it on change/close. Thumbnail strip is lazy; only two previews appear in details. Real projects no longer show illustrative labels/alt text or empty outcomes.

## Latest local interaction and media refinements

- Per-tab sessionStorage key `coastal-portfolio:location:v1` remembers route/index. `createNavigation(lengths, saved)` validates/clamps restored state and infers the correct Home gateway; denied/corrupt storage starts at Home. Restore occurs under the loading veil; dialogs, playback and in-flight motion are not resumed.
- Tutorial keys/title/help copy sit inside one cream panel. Existing input dismissal, controls return animation and mobile side-arrow pulse remain. Ocean mix is now 60% of previous level: .135 → .081. Other channels unchanged.
- Project dock has two thumbnails and one View all X photos (or photos & videos) control; removed Watch videos and link controls. The photo count excludes videos; gallery total still includes all items. Thumbnails are horizontally scrollable within a viewport-bounded flex modal, with image/video area shrinking on small screens.
- Project rocks reserve actual enlarged icon X/Z bounds plus margin. Big rocks shift back until clear; shadows/foliage footprints follow actual rock positions. Regression checks a wide puzzle arch at 1.24×.
- `project-landmarks.js` supplies project-specific procedural geometry; Arthur headset is applied. Mappings/models are ready for Gods of Chess, Tap Challenge, XANA, E.V.A.L. red round character, Game Changer gloves/ring, Shape Jump, Enter the Dungeons, Hexagrids X, Pong 3D and Wonderland Runner (existing race icon retained). Unapproved project text/media are not added by this mapping. Local preview: ../design-review/project-icons.html.
- Arthur media preparation completed: 17 images, three full-duration 720p H.264/AAC videos, all faststart. Approx. 578.66 MiB sources → 57.0 MiB optimized media; first two previews 21,772 bytes, full gallery images 785,168 bytes, gallery thumbnails 198,476 bytes. No originals changed. No publication.

- Refresh framing detail: when resuming Career/Projects, the scene first constructs Home under the loading veil to establish Home reference bounds, then lazily prepares/restores the saved route. This avoids accidentally fitting an entire long island or changing the default model scale on refresh.

- Detail-preview rotation: `preview-rotation.js` drives two slots at four-second intervals for >2 project screenshots or >2 linked company project covers. Both slots fade out/in over 220ms each; reduced motion swaps without fading. Odd counts wrap (e.g. five: 0/1 → 2/3 → 4/0), and current image/project IDs, labels and captions change atomically with the image. Only two next thumbnails are predecoded. Hidden tabs/docks, travel, section transitions and open dialogs pause the rotation. Disposed/re-rendered cards abort pending fades and clear their timer. Company mappings remain empty; actual company cover rotation becomes visible when the user assigns projects.

- Latest content workflow: ask the employer/company for every project as it is reviewed and apply confirmed mappings immediately. Arthur VR → Arthur Technologies is confirmed (project index 0). Gods of Chess text/technologies are approved; its company question is pending. This supersedes earlier instructions to wait until all projects are entered before mapping.

- Gods of Chess is now local project index 1 with approved overview/contribution/Unity-C#-Photon tags, chess icon and 19 optimized screenshots (about 3.14 MiB versus 58.59 MiB originals). Arthur remains index 0; six remaining sample stops keep sequential indices. Gods of Chess company association is still awaiting the user response.

- Confirmed association: Gods of Chess → Five Rivers Technologies (project index 1). Arthur VR → Arthur Technologies remains index 0. Both mappings are local; keep asking the company during each subsequent project review.

- Tap Challenge is approved locally: project index 2, 12 optimized screenshots, Unity/C#/Firebase tags and tap-button landmark. Explicit employer: Five Rivers Technologies; company.projectIndices is [1, 2] for Gods of Chess and Tap Challenge. Arthur index 0/mapping is unchanged. Five sample stops remain.

- Latest approved local projects: Arthur VR [0] → Arthur Technologies; Gods of Chess [1], Tap Challenge [2] and E.V.A.L. [4] → Five Rivers Technologies; XANA [3] → No Borders Innovations. E.V.A.L. is a Unity platformer with Hafeez as main developer, using 12 optimized photos; XANA uses 16 photos and one full-duration on-demand video. Five Rivers now has three covers for automatic pair rotation. Five real records and three sample stops remain; no publication.

- Game Changer is approved locally at index 5: 3D boxing game, associate developer, Zepro Digital [5], 12 optimized photos and boxing landmark. Six real project records and two sample stops remain.

- Shape Jump is approved locally at index 6: endless jumping survival with drawing controls, main developer, Five Rivers Technologies [1, 2, 4, 6], 17 optimized photos and jump landmark. Seven real projects and one sample stop remain; further supplied projects still need review.

- Enter the Dungeons is approved locally at index 7: multiplayer 2D strategy, main developer, Five Rivers Technologies [1, 2, 4, 6, 7], five optimized photos and dungeon landmark. All eight current project stops are real; Hexagrids X, Pong and Wonderland Runner are additional supplied projects still awaiting review, not yet entered.

- User skipped Hexagrids X (2026-11-09); do not add its project or media. Next review: Pong, then Wonderland Runner.

- Pong 3D is approved locally at index 8: 3D table tennis, main developer, Five Rivers Technologies [1, 2, 4, 6, 7, 8], six photos and one on-demand gameplay video. Nine real project stops; Wonderland Runner is next. Hexagrids X remains excluded.

- Wonderland Runner is approved locally at index 9: 3D endless runner, main developer, Nutty Apps [9], three optimized photos and existing race landmark. All ten included projects from supplied project folders are entered; Hexagrids X is explicitly skipped. Additional resume/PDF-only projects, contact and skills review remain separate.

- Pet Idle Miner is approved locally at index 10: personal idle pet/business management project, main developer alongside a fellow developer. This supersedes the original CV solo-project wording; do not rewrite the attached CV. Lion Studios approached about publishing, no deal claimed. Ten images/five on-demand videos, pet/coins landmark; no employer association. Eleven real projects total.

- Latest project order supersedes historical indices: Arthur VR, Gods of Chess, Pet Idle Miner, E.V.A.L., XANA, Tap Challenge, Game Changer, Enter the Dungeons, Shape Jump, Pong 3D, Wonderland Runner. Explicit numbered list places Pet third. Wonderland retained after listed ten. Company associations remapped by identity. ASK the desired position BEFORE adding any future project. Pet landmark now has two animals, coins and cash.

- Intro now uses user-approved young.jpg (copied unchanged to /media/profile/hafeez-akram.jpg) as a large photo replacing both sample previews; no avatar/sample artwork. Hub resume utility is a labeled square. Skills uses only 25 confirmed core/services items and self-assessed levels, six category tabs and experience filters; tools round unanswered/deferred, Steam excluded. No skill percentages or sample pictures. All local only.

- Skills refinement: compact floating-tech panel; green Strong, blue Working knowledge, yellow Learning tiles with categorical fill animation (not numerical ratings). Only levels present in selected category appear; unavailable filter resets to All. 6 tiles/page desktop, 4 narrow, 2 short screens; paging replaces internal scrolling. Resume utility vertically centered. Honor reduced motion.

- Contact now uses the approved portrait instead of unrelated sample project artwork; email/LinkedIn/GitHub/availability questions are pending. Skills badges use persistent 2D collision motion (wall/pair bounces, faster motion), preserve the same spotlight DOM/controller across tab/filter/page changes, and pause on hidden card/tab or reduced motion. Dispose when leaving Skills/page.

- Contact approved 2026-11-09: hafeez.akram21@gmail.com; LinkedIn https://www.linkedin.com/in/hafeez-akr/; GitHub https://github.com/breaker-of-code; WhatsApp https://wa.me/923088127585. Both full-time and freelance/contract availability. Contact and Simple view show all four methods. Mailto uses default mail handler (no blank tab); HTTP links open new tabs with noopener/noreferrer. WhatsApp only opens a chat, never sends automatically. All local only.

- Skills badge set includes AWS and VR (seven total), preserving continuous collision trajectories. Held keyboard arrows/mobile arrow buttons continue one stop per arrival until release; blur/hidden/route change clears hold. Existing single-input reversal/approach rules retained. Intro/Contact portrait square crops anchored right, removing left-side background.

- Portrait refinement: square applies only to Intro, whose media column now hugs the photo with a 24px gap to text. Contact restores the full-width rectangular portrait banner above its links.

- Intro card now grows to content rather than scrolling the biography/action column. Compact Explore button has intrinsic width below text; square photo remains top-aligned, Contact unchanged.

- Career media always uses two photo slots when approved project media exists. Single-project companies show two screenshots from that project and cycle remaining screenshots every four seconds; both open the same full project gallery. Multi-project companies retain project-cover rotation. Companies with no supplied/mapped projects retain placeholder until data arrives.

- 2026-11-09 profiling (no optimization yet): see docs/PERFORMANCE_REVIEW_2026-11-09.md and private raw logs. Production desktop baseline ~608–703 draw calls/frame, ~33 FPS in automated browser, low effects retain startup DPR1.5; gallery still renders scene and measured ~25–26 FPS. Home heap/resource counts returned near baseline after routes. Browser title is Hafeez Akram - Lead Unity Developer across routes.

- Approved optimization pass (2026-11-09): render-budget.js caps driving/camera settling at30FPS and settled scenery at20FPS; deliberate caps are normalized out of adaptive quality timing. Scene setPaused composes named overlay/transition reasons and stops setAnimationLoop entirely for hidden documents and open dialogs; resume resets timing. Shadow maps cache between10Hz moving/2Hz idle updates with immediate invalidation for route/zoom/resize/quality. Station/offscreen palm/boat/fish work is culled with margins; repeated palm leaves are spatial InstancedMesh batches; larger24-unit static batches reduce submission overhead. Engine cues fade while paused, ambience preferences unchanged. DPR and user zoom unchanged.


## Mobile startup audit and recovery, 2026-11-09

The user's first-published version failed on Samsung Galaxy A54 / Chrome (island missing, Intro dock visible, limited navigation). Recent local optimizations/anisotropy/stable DPR improved load and clarity, but did not fix the old timer-based readiness. Exact physical-device cause is not established.

- Startup no longer uses two RAF callbacks plus an 850ms delay as proof of readiness. Scene starts paused; main awaits requested route code, rooftop-logo completion, current preview decoding, shader compilation and an explicit rendered frame before removing the loader. Full gallery images/videos remain on demand.
- Section transitions likewise await the actual frame/preview completion; removed the arbitrary 10-second route timeout so a slow successful download opens its requested section automatically. Actual failures retain the retry message.
- Failed startup offers visible Retry 3D / Simple view, rather than silently opening a 2D-only experience. After 15 seconds, a slow pending startup offers optional Simple view while continuing loading; reconnect retries a failed startup. Simple-view galleries remain usable if 3D cannot start.
- WebGL context loss pauses the scene and shows recovery; restored context recompiles/renders the current route before revealing/resuming. Unsupported shader errors cannot mark a blank frame ready. Browser back/forward cache suspends rather than disposes the retained scene, then resumes on pageshow.
- Startup mobile DPR caps are now 1.5 for medium/high, 1.25 low; adaptive effects still do not vary canvas resolution. This adds pixel cost relative to the former 1–1.25 mobile caps; recent draw-call/frame/shadow budgets remain in force. Physical A54 smoothness/crispness requires user retest after final publication.
- Regression tests cover delayed textures/shaders, interrupted/stale readiness and shader failure. No deployment: user's local-only instruction remains active.

## Travelling shadow correction, 2026-11-09

Shadow maps now refresh every rendered frame during Jeep travel/camera settling and once on arrival, replacing the earlier10Hz active shadow cap that caused stepped car shadows. Settled shadows still cache at2Hz. Render30FPS active/20FPS idle and dialog/hidden pauses remain unchanged. Active shadow-pass cost increases relative to the initial optimization; historical idle profile measurements are unchanged.

- Contact portrait framing refinement: wide banner keeps object-fit:cover with object-position:right20%, shifting the photo down to reveal the upper face. Intro square crop is unchanged.


## Combined publication requested, 2026-11-09

The user explicitly requested deployment after the Contact crop change, superseding the local-only hold for this combined release. Includes all approved content/media and recent mobile, performance, shadow and portrait fixes. All77 tests and exact /Portfolio/ build passed immediately before release. Future edits remain local until the next deployment request. See the latest TEAM_LOG entry for deployment outcome.
