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
- After deployment, the user will connect Google Drive for real data. Confirm EACH section, project and company with the user before applying its data.
- Preserve the existing `.openai/hosting.json` Site identity and audience when working with the old Sites integration. It is not GitHub Pages configuration.

## Preserve these user decisions

- Default/reset zoom automatically fits the Home frame to the CSS viewport; slider 10–600%. Manual route/device values persist separately from automatic mode.
- Automatic mode refits on resize. Manual zoom preserves model CSS-pixel scale and crops/follows. Longer routes keep Home scale and align their starting edge with left padding.
- Details use warm sand, media on the left, compact corners and cream-outline résumé buttons.
- All movement input paths share drive-controller locking, reversal and continuation rules. Jeep taps bounce at endpoints. The first-opening controls hint dismisses on input; the untouched-page tour advances every 30 seconds and stops permanently on first input for that page opening.
- Keep smooth ocean swells. Rejected fish schools and artificial white roller/foam bands must not return.
- Sound defaults on for new visitors, subject to browser autoplay rules. Preserve saved/cross-tab mute, hidden-tab suspension and complete source/context cleanup.
- Fish **sound frequency** is 20% of eligible visible landings, not 20% volume. Preserve approved splash volume.
- Do not invent personal work history, outcomes or URLs. Existing sample records/artwork are illustrative.

## Validation and handoff

- Run relevant existing tests for behavior changes and build for release readiness; avoid redundant reruns without changed inputs.
- Use provided browser/computer tools for UI automation. Close audio-playing QA tabs after testing; an independent preview previously caused apparent continued sound after mute.
- Physical low-end-device smoothness is not established; do not infer guaranteed FPS from browser automation timing.
- Append dated changes, checks, limitations and follow-up work to `TEAM_LOG.md`, with your agent identity. Never put credentials in docs/logs.
