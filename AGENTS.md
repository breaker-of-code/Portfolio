# Working on The Scenic Route

## Read first

1. `README.md` — setup and documentation index.
2. `docs/HANDOFF.md` — architecture, accepted behavior, verification and remaining work.
3. Latest `TEAM_LOG.md` entries — changes and ownership.
4. The relevant guide: `docs/CONTENT.md`, `docs/DEPLOYMENT.md`, or `docs/ADMIN_FUTURE.md`.

## Collaboration and scope

- Preserve existing modifications and untracked modules/assets. Do not reset or delete them for a clean checkout.
- Coordinate concurrent edits to `src/main.js`, `src/style.css`, `src/content.js`, package files and deployment configuration.
- Admin/backend is **deferred**. Current scope is a static portfolio. No login, database, upload API or JSON admin UI exists.
- GitHub Pages is deployed at `https://breaker-of-code.github.io/Portfolio/` from `breaker-of-code/Portfolio`, branch `main`. Pushes rebuild and deploy. Verify each deployment rather than assuming a push succeeded.
- All seven company/experience records are approved (2026-11-09), with editorial improvements authorized. Do not ask for repeated company approval; clarify only missing or conflicting facts. Arthur VR, Gods of Chess, Tap Challenge, XANA, E.V.A.L., Game Changer, Shape Jump, Enter the Dungeons, Pong 3D, Wonderland Runner and Pet Idle Miner are approved locally; other projects/sections still need approval. Source documents and the private review inventory are local.
- User authorized one combined deployment on 2026-11-09 after the Contact portrait change. This publishes the approved working tree. For subsequent work, retain the default: edit locally and publish only when requested; individual content approval alone is not deployment approval.
- Preserve the existing `.openai/hosting.json` Site identity and audience when working with the old Sites integration. It is not GitHub Pages configuration.

## Preserve these user decisions

- Default/reset zoom automatically fits the Home frame to the CSS viewport; slider 10–600%. Manual route/device values persist separately from automatic mode.
- Automatic mode refits on resize. Manual zoom preserves model CSS-pixel scale and crops/follows. Longer routes keep Home scale and align their starting edge with left padding.
- Rooftop sign option C is selected, now logo-only at 1.25× with no rooftop nameplate. All seven user-provided logos are in `public/media/company-logos/` and mapped by `company.logo`; keep originals/aspect ratios intact. Keep signs above roofs and attached to animated building roots.
- Details use warm sand and compact corners. Company dialogs are overview-only with left-to-right 50% project images / 50% overview text, without a resume control. No company Work/Impact tabs. Header Resume stays unchanged.
- Ask which company each project belongs to during that project’s approval, and apply each confirmed association immediately. Arthur VR belongs to Arthur Technologies. Do not infer other associations. Clicking a linked project cover opens its full gallery popup on the same company route.
- All movement input paths share drive-controller locking, reversal and continuation rules. Jeep taps bounce at endpoints. The first-opening controls hint dismisses on input; the untouched-page tour advances every 30 seconds and stops permanently on first input for that page opening.
- Keep smooth ocean swells. Rejected fish schools and artificial white roller/foam bands must not return.
- Sound defaults on for new visitors, subject to browser autoplay rules. Preserve saved/cross-tab mute, hidden-tab suspension and complete source/context cleanup.
- Fish **sound frequency** is 20% of eligible visible landings, not 20% volume. Preserve approved splash volume.
- Approved profile: Hafeez Akram, Lead Unity Developer, 9 years, Intro bio in `content.js`. Approved Arkadium: freelance Senior Unity Developer contract, Apr 2024–Present, as-needed work without fixed hours. All seven employers are approved in the LOCAL working tree, including Zepro Digital, Nutty Apps and Five Rivers Technologies. Infinity-Up game list excludes Mushroom Spring and includes Clucky Chick plus other games; retain approved Galactic Peggle retention figures but omit publisher-contract claims.
- The original supplied resume is attached unchanged LOCALLY at `public/files/Hafeez-Akram-Developer.pdf`. Do not silently rewrite it. Contact fields and projects are not yet approved.
- Do not invent personal work history, outcomes or URLs. Existing sample projects/artwork are illustrative.

## Validation and handoff

- Run relevant existing tests for behavior changes and build for release readiness; avoid redundant reruns without changed inputs.
- Use provided browser/computer tools for UI automation. Close audio-playing QA tabs after testing; an independent preview previously caused apparent continued sound after mute.
- Physical low-end-device smoothness is not established; do not infer guaranteed FPS from browser automation timing.
- Append dated changes, checks, limitations and follow-up work to `TEAM_LOG.md`, with your agent identity. Never put credentials in docs/logs.

- Latest local refinements: per-tab session restoration preserves route/stop on refresh; tutorial text is inside one cream panel; ocean level is 0.081 (60% of 0.135). Project docks have only thumbnails and one View all photos / photos & videos control. Gallery thumbnails scroll inside the modal. Project rocks reserve the enlarged icon footprint.
- `project-landmarks.js` maps actual project names to appropriate procedural icons (Arthur headset, E.V.A.L. red character, chess, tap, boxing, jump, dungeon, hex, Pong and metaverse; runners retain race). Arthur is applied now; remaining content still needs approval. Model previews are in sibling design-review/project-icons.html, not the production site.

- Details now rotate pairs every 4 seconds when there are >2 project photos or >2 linked Career project covers; preserve current-item click targets and cancellation. Arthur VR is linked to Arthur Technologies. Ask and apply the company association with each project review; never infer missing mappings.

- Confirmed association: Gods of Chess → Five Rivers Technologies (project index 1). Arthur VR → Arthur Technologies remains index 0. Both mappings are local; keep asking the company during each subsequent project review.

- Tap Challenge is approved at project index 2 and linked to Five Rivers Technologies alongside Gods of Chess (indices [1, 2]). Arthur Technologies retains Arthur VR [0]. Continue asking both copy approval and company for every subsequent project.

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

- Approved optimization pass (2026-11-09): render-budget.js caps driving/camera settling at30FPS and settled scenery at20FPS; deliberate caps are normalized out of adaptive quality timing. Scene setPaused composes named overlay/transition reasons and stops setAnimationLoop entirely for hidden documents and open dialogs; resume resets timing. Shadow maps update every rendered moving/settling frame and once on arrival, caching at2Hz when idle with immediate invalidation for route/zoom/resize/quality. Station/offscreen palm/boat/fish work is culled with margins; repeated palm leaves are spatial InstancedMesh batches; larger24-unit static batches reduce submission overhead. Engine cues fade while paused, ambience preferences unchanged. DPR and user zoom unchanged.
