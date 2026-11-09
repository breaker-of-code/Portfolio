# Portfolio workspace handoff

Updated 2026-11-09. Current application release: `5cc0406`, deployed successfully through [run 42676913997](https://github.com/breaker-of-code/Portfolio/actions/runs/42676913997).

## Start here

Read `README.md`, `docs/HANDOFF.md`, relevant content/deployment guides and the newest `TEAM_LOG.md` entries. The team log is historical; older sample counts, indices and local-only notes do not describe the latest release. Source wins over stale docs; correct the docs when behavior changes.

## Working rules

- App/Git root is `coastal-portfolio/`. Parent `design-review/`, `content-review/` and screenshots are private working artifacts, not production dependencies.
- Inspect `git status` before editing. Preserve existing modified/untracked work. Never reset, clean, force-push or overwrite unrelated work.
- User requested the combined deployment on 2026-11-09. All approved content/recent fixes are now live. Subsequent edits stay LOCAL until the user explicitly requests deployment; approving a record does not authorize publication.
- `main` pushes deploy automatically to https://breaker-of-code.github.io/Portfolio/. Verify CI and actual hosted assets after release.
- Admin/backend is deferred. Preserve `docs/ADMIN_FUTURE.md`; implement only when resumed by user.
- Preserve `.openai/hosting.json` identity; it is legacy Sites configuration, not Pages deployment configuration.
- Append material changes/checks/limitations/next steps to `TEAM_LOG.md`. Historical agent identity is **codex-bankd-macbook**; use the identity assigned for your work.

## Approved content and relationships

- Hafeez Akram, Lead Unity Developer, nine years. Approved bio/contact/skills are in `src/content.js`; no placeholder identity remains.
- All seven employers and eleven projects are approved. Project order and current zero-based company mappings are in `docs/CONTENT.md`; source is authoritative.
- ASK the desired position and company association before adding any future project. Apply confirmed mappings immediately; never infer employers. Hexagrids X was explicitly skipped.
- Pet Idle Miner is personal, main developer alongside a fellow developer. Lion Studios approached about publishing; no agreement is claimed. This supersedes old CV solo wording without changing the attached PDF.
- Arkadium is an ongoing as-needed freelance contract, Apr 2024–Present, not fixed-hours/full-time. Infinity Up: lead role/team 10; exclude Mushroom Spring and publisher-contract claims. Retention metrics currently in source are approved.
- Original résumé is hosted unchanged in `public/files/`; do not silently rewrite it. Website facts supersede its older 8+ years/Arkadium wording.
- Arkadium/Infinity Up project media await user input; keep their media placeholders instead of guessing associations.
- Skills contain 25 confirmed items; tools round was deferred. Do not infer Steam or unconfirmed expertise. Respect Strong/Working knowledge/Learning self-assessments, with no fabricated percentages.

## Preserve behavior/design

- Warm-sand dock, compact corners; cream-outline Resume utility on Home only, always available in header. Career overview only, 50% media left/50% copy right. Project dock has just two thumbnails and one View all photos/videos action.
- Intro square portrait crops right, copy hugs the image and grows without CTA scrolling. Contact is a wide banner with `object-position:right 20%`.
- Company labels retain title case, fixed character spacing and growing plaque width. Selected rooftop C: round logo-only badge,1.25x, minimal padding, all seven supplied logos.
- Preview pairs fade every 4 s when >2; single-project companies use multiple screenshots of that same project. Gallery stays on company route. No auto-playing/preloading all video media.
- Held Left/Right keyboard/touch arrows continue per stop until release. Jeep taps bounce endpoints; shared reversal/approach/travel locks remain. First-load controls intro dismisses on input; untouched-page tour advances 30 s until first input.
- Default/reset zoom fits Home to CSS viewport;10–600% slider. Manual zoom preserves CSS-pixel scale; long routes use Home scale/start padding and follow the car. Mobile portrait uses landscape rotation gate.
- Smooth displaced ocean swells; rejected white rollers/fish schools/date diamonds/End of route pier sign must not return.
- Sound defaults on subject to autoplay; saved/cross-tab mute and hidden-tab suspension/cleanup remain. Fish sound frequency 20% of eligible visible landings, not 20% volume.
- Frame budget 30 FPS active/20 FPS idle. Stop 3D loop behind dialogs/hidden tabs. Shadows update EVERY rendered travelling/settling frame plus once on arrival; cache 2 Hz only when settled. Do not restore the jittering 10 Hz travelling cap.
- Startup/section reveal awaits assets, shader compilation and explicit first frame. Keep context-loss recovery and browser page-cache resume. Failed startup offers Retry/Simple view, not silent blank 3D.

## Checks and storage

- Latest full suite 77 tests passes; exact `/Portfolio/` build and CI pass. Live verification matched 320 nonvideo file hashes and 10 video header lengths, 330 files total. Physical Galaxy A54 retest remains outstanding; do not guarantee low-end FPS.
- Run relevant tests and build for behavior/release changes. Use browser tools for UI automation; close temporary/audio QA tabs and reset temporary viewport overrides.
- Everything under `public/` is public. Never add secrets/private backups/drafts. Keep asset provenance and licenses.
- `public/` and `.git` must remain in the project. Downloads originals may be removed once backed up on Drive; runtime does not use them. `node_modules/`/`dist/` are regenerable. Do not delete user files without a clear request.
