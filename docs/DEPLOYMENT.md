# Static deployment and GitHub Pages readiness

Recorded **2026-11-08**: the static build succeeds. The user wants GitHub Pages and has postponed admin. GitHub publication completed **2026-11-09**. Live URL: [Portfolio](https://breaker-of-code.github.io/Portfolio/). Repository: [breaker-of-code/Portfolio](https://github.com/breaker-of-code/Portfolio).

## Prepared configuration

- App/Git root: `coastal-portfolio/`, not the parent workspace. Only this app is published; `design-review/` stays outside the repository.
- `.github/workflows/deploy.yml` runs on pushes to `main` or a manual Actions run. It installs with `npm ci`, runs tests, builds and publishes `dist/` through the `github-pages` environment.
- Workflow uses Node 22 and pinned official actions matching the current Vite deployment example. `configure-pages` supplies `base_path`; `PAGES_BASE_PATH` passes it into `vite.config.js`. Root sites and project subpaths need no repository name hardcoded in the source.
- `src/asset-url.js` handles runtime images, galleries, local résumé/portrait links and all loop/one-shot audio through their shared decoder. External/mailto/data/blob URLs stay unchanged; already prefixed paths are not duplicated. CSS fonts and lazy chunks are processed by Vite.
- Normal local build/development uses `/`. For a project-subpath check, run `PAGES_BASE_PATH=/portfolio/ npm run build` and `PAGES_BASE_PATH=/portfolio/ npm run preview`.
- `.openai/hosting.json` retains the older Sites identity; it is not Pages configuration.
- GitHub CLI is authenticated as `breaker-of-code`; `origin` points to `https://github.com/breaker-of-code/Portfolio.git`. `main` tracks `origin/main`. Never store authentication credentials in source.

## First publication (completed; retained for reference)

1. Create an **empty public repository** on GitHub (for free Pages), e.g. `portfolio`. Do not initialize it with a README, license or `.gitignore`; these files already exist locally.
2. In that repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**. This must be enabled before the workflow's `configure-pages` step runs.
3. Sign in from your terminal with `gh auth login`, choose GitHub.com, HTTPS and browser authentication. Complete the browser login yourself; never paste passwords, tokens or one-time codes into source or chat.
4. Send the repository link to the working agent, or run the following from the app directory, replacing OWNER/REPOSITORY with your actual destination:

```sh
cd /Users/arkadium/Documents/Portfolio/coastal-portfolio
git status --short
git add .
git commit -m "Prepare static portfolio for GitHub Pages"
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
```

The checkout already uses `main`. Review the files before committing: include all production modules, docs and `public/` assets. `node_modules/`, `dist/`, local credentials and zip archives are ignored. If an origin or initialized remote appears in the meantime, inspect it before running these commands; do not overwrite history or force-push.

5. Open the repository **Actions** tab and wait for **Deploy portfolio to GitHub Pages** to succeed. The deployment's URL is also shown under **Settings → Pages**, normally `https://OWNER.github.io/REPOSITORY/`.
6. Verify the live site before calling publication complete. Later pushes to `main` automatically rebuild and update it.

## Validation recorded 2026-11-08

- **46 tests passed**, including new root/subpath/external asset URL cases; production build passed with the workflow's `PAGES_BASE_PATH=/portfolio/` setting.
- Local HTTP check returned exact expected bytes for all **32** deployed files under `/portfolio/`, including JS chunks, fonts, images and M4A/WAV audio. Built HTML/CSS/runtime helper contain the correct base.
- This validates build/path handling, not a live GitHub deployment or a new physical-device/browser session. First publication subsequently succeeded: [deployment run](https://github.com/breaker-of-code/Portfolio/actions/runs/42607740759). All 47 tests passed in CI and all 32 live deployment files match the local production build.

## Data after deployment

Keep demo content for initial publication. The user will connect Google Drive afterward. Read and propose the source data, then obtain confirmation for **each section, project and company before applying it**. Do not batch-publish unconfirmed records. Confirm approved content is public before copying files into `public/` or the repository.

## Production smoke check

- Initial load and refresh, no missing assets/console errors.
- Screen-fitted default zoom on desktop/mobile, custom zoom, Reset returning to automatic mode, resizing and long-route edge padding.
- Navigation, direct bay picking, travel lock/reversal/continuation, section fade and return home.
- Career timeline, gallery/related-work links, details layout and genuine URLs.
- Simple view, reduced motion, portrait rotation gate and physical fullscreen/orientation behavior.
- Sound startup/fallback, button/arrival/transition cues, short-trip engine fades and sparse splashes.
- Mute while playing, reload/reopen muted, hide/show/close tab; close QA previews afterward.
- Interrupted loading: there is no service worker or guaranteed offline mode; do not promise a universal no-internet overlay.

## Future admin

See `ADMIN_FUTURE.md`. Publish self-contained public content/media so the portfolio remains online when the admin backend is unavailable. Never include private drafts, secrets or JSON backups in the public build.

Recheck platform documentation when implementing:

- [GitHub Pages overview](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Vite static deployment](https://vite.dev/guide/static-deploy.html)


## Combined content/update release, 2026-11-09

User authorized publishing the approved local working tree after Contact framing. Seven employers, eleven projects and their optimized on-demand media, profile/skills/contact/resume, mobile readiness/context recovery and rendering optimizations are included. Release checks:77 tests pass; exact /Portfolio/ build succeeds; no remote divergence. Largest asset is a31.43MiB on-demand Arthur video, below GitHub's per-file hard limit. All media totals about104MiB on disk, not initial transfer. No admin backend was added. Verify CI and live artifact bytes before marking complete; record outcome in TEAM_LOG. Subsequent changes remain local until requested.
