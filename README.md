# The Scenic Route

A coastal portfolio for a Senior Unity Developer, built with vanilla JavaScript, CSS and Three.js. It runs as a static website; there is no Unity runtime, React app, database or admin backend.

**Status, 2026-11-08:** the static build works, the interactive experience/audio mix are implemented, and content is still illustrative. Admin is deferred. GitHub Pages workflow and repository-subpath assets are ready; repository setup and first publication are pending.

## Run locally

Use a Node version compatible with Vite 8: `^20.19.0` or `>=22.12.0`, according to the installed Vite package. A current supported Node LTS is appropriate.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite; a busy port can cause it to choose a different one.

```sh
npm test
npm run build
npm run preview
```

Build output is `dist/`; deploy that output, not `src/` or `node_modules/`. The latest run passed **47 tests** and the production build passed. See the team log for verification scope.

## Documentation

| Document | Purpose |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Instructions for agents taking over |
| [Handoff](docs/HANDOFF.md) | Architecture, accepted behavior/design, performance and open work |
| [Content editing](docs/CONTENT.md) | Update text, projects, career, media, résumé and links |
| [Deployment](docs/DEPLOYMENT.md) | Static hosting and remaining GitHub Pages work |
| [Deferred admin](docs/ADMIN_FUTURE.md) | Confirmed requirements for a later admin panel |
| [Team log](TEAM_LOG.md) | Dated implementation history and validation |

## Experience

- Home has Intro, Career, Projects, Skills and Contact. Career/Projects open longer islands whose size follows record count.
- An orange open-top Jeep accelerates, brakes and parks in aligned inset bays. Keyboard, stop buttons, clicked bays/landmarks and touch input share travel rules.
- Tapping the parked Jeep advances through stops, reverses direction at the last stop and goes forward again at the first. Existing travel locking still applies.
- On initial Home loading, desktop keyboard controls enlarge/move to the center; mobile side arrows pulse. Any interaction dismisses the introduction.
- If the page receives no input, an automatic tour advances every 30 seconds and reverses at endpoints. The first interaction stops it for that page opening; it does not restart after later inactivity.
- Details hide during travel while controls remain. Gateway stops show an Enter/tap-to-explore prompt above the dock.
- Default zoom automatically fits the screen, with a **10–600%** slider and saved per-route/device manual values. Reset returns to automatic fitting.
- Automatic zoom refits on resize; manual zoom preserves model scale and crops/follows the car. Long islands keep Home scale, start with left padding and extend off-screen. Mobile uses landscape with a portrait rotation prompt.
- Smooth displaced ocean swells, boats, moored motorboat, jumping fish/ripples, bobbing landmarks, swaying palms, idle Jeep vibration and light exhaust.
- Sound includes ocean, idle/driving loops, sparse recorded splashes, button taps, arrival notes and transition swishes. Fish sound plays on **20% of eligible visible landings**.
- Sound defaults on for new visitors but browsers may need a gesture; Start sound is offered. Mute persists, hidden tabs suspend, and closing/muting releases audio.
- Simple view, WebGL fallback and reduced-motion support remain available.

## Editing and release status

Most content is in `src/content.js`. Shipped media belongs in `public/media/`. Some header/experience text is hardcoded in `src/main.js`; follow the content guide.

Sample names, descriptions and artwork are illustrative. Empty external links are intentionally unavailable. Real profile/company/project data, résumé and URLs are needed for a personalized release.

Asset provenance is in `public/media/`, `public/audio/` and `public/fonts/`. The sibling `../design-review/` holds historical auditions/renders and preparation scripts; it is not the production app.

The site needs no backend to publish statically. The Pages workflow builds and publishes `dist/` on pushes to `main`, using the actual Pages base path. Runtime assets use `src/asset-url.js`. Follow the deployment guide to enable Pages and publish. After deployment, confirm each real section/project/company with the user before replacing the sample data from Google Drive.
