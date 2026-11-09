# GitHub Pages deployment

Updated 2026-11-09. [Live portfolio](https://breaker-of-code.github.io/Portfolio/) · [Repository](https://github.com/breaker-of-code/Portfolio).

## Current verified release

- App commit **5cc0406419a609ff2ec68ff76286ea83eae216ab**: Publish approved portfolio content and responsive performance fixes.
- [Deploy run 42676913997](https://github.com/breaker-of-code/Portfolio/actions/runs/42676913997) completed successfully in 35 seconds, including 77 tests and production build.
-330 hosted files verified against local exact `/Portfolio/` build:320 nonvideo SHA-256 matches,10 video HEAD length matches. Full video bodies were not re-downloaded by this check. Public media are~104 MiB on disk, loaded on demand rather than all at startup.
- All approved content/recent mobile/readiness/performance/shadow/portrait changes are in this release. Admin is not included.
- First publication e9f17ca/run 42607740759 remains historical. Docs-only follow-ups use `[skip ci]` and do not rebuild application assets.

## Configuration

- App/Git root: coastal-portfolio, branch main, origin https://github.com/breaker-of-code/Portfolio.git. main tracks origin/main; gh authenticated owner is breaker-of-code. No credentials belong in docs/source.
- .github/workflows/deploy.yml runs pushes to main/manual dispatch. Node 22, npm ci/test/build, pinned official checkout/setup-node/configure-pages/upload-pages-artifact/deploy-pages actions.
- Pages Settings source is GitHub Actions, already enabled. configure-pages supplies base_path; build env PAGES_BASE_PATH passes it to vite.config.js. Deploy dist output only; not src/node_modules.
- Runtime media/audio/resume/gallery URLs use src/asset-url.js; CSS/fonts/lazy chunks are processed by Vite. Actual project prefix is case-sensitive `/Portfolio/`.
- Preserve legacy .openai/hosting.json Sites identity; it does not control Pages.
- No backend/account/database/bucket/service worker required. A future admin must publish a standalone static snapshot independent of editor/backend availability.

## Next release workflow

Only deploy when explicitly requested. Do not publish each approved content edit automatically.

1. Read AGENTS/HANDOFF and git status. Review intended diff/new assets, preserve unrelated changes. Ensure media/public data have user approval, no private backup/secrets, no files over GitHub's per-file limit.
2. Fetch origin and inspect divergence; don't force-push or discard remote changes.
3. Run relevant tests and full release checks:

```sh
npm test
PAGES_BASE_PATH=/Portfolio/ npm run build
```

4. Review/stage exact application/docs/assets; commit and push main. A push initiates Pages deployment. Do not commit dist/node_modules/private sibling review/design directories.
5. Find the run for that commit and wait for success:

```sh
gh run list --workflow deploy.yml --limit 3
gh run watch RUN_ID --exit-status --interval 10
```

6. Verify live index/chunks and representative media/PDF/audio paths against exact build; inspect actual live page/navigation/galleries/errors. CI success alone is not visual verification. A failing build/deploy leaves prior version live; inspect failing job/log before retrying.
7. Record commit/run URL/checks/limits in TEAM_LOG and update current docs. A documentation-only commit with `[skip ci]` avoids another app rebuild.

Actual build/upload/deploy duration varies; this release took 35 s. CDN/browser caches may need refresh to show new HTML; verify assets before claiming completion.

## Smoke-check scope

- Fresh load/refresh/route restore, firstFrame readiness before reveal, no missing assets/console errors; lazy Career/Projects under loading veil.
- Default-fit/custom/reset zoom, resize, long-route edge padding and no cropped motorboat.
- Drive/hold/reversal/approach/picking, gateway entry/return, Esc hints, project-specific models/rooftop logos/year board.
- Profile/contact framing, skills filters/paging, Career project links/paired fades, mixed gallery containment/on-demand playback, Resume PDF.
- Dialog/hidden pauses, context recovery/retry, no renderer disposed on browser page-cache restoration.
- Sound mute/reload/cross-tab cleanup and autoplay fallback; close temporary audio-playing QA tabs.
- Physical phone rotation/fullscreen/low-end/GPU/audio checks remain separate. Galaxy A54/Chrome retest requested after this release; do not claim physical verification from an emulated viewport.
- No guaranteed offline mode. Initial document/script failure cannot run an app warning. Startup errors show Retry/Simple view after app JS has loaded.

## Storage and recovery

Keep source/public/.git for future releases. User has original assets on Drive and may remove Downloads copies after verifying backup; they are not live dependencies. node_modules/dist are regenerable. Avoid deleting files on behalf of the user without an explicit request.

Deferred authentication/drafts/upload/JSON backup requirements are in ADMIN_FUTURE.md. Current public static site must remain independent of a future admin backend.
