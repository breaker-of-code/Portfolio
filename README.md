# The Scenic Route

A lightweight interactive portfolio built with vanilla HTML, CSS, JavaScript, and Three.js. No Unity runtime, React, physics engine, backend, or external font service is needed.

## Run locally

```sh
npm install
npm run dev
```

Open the printed localhost URL. Build with `npm run build`; deploy the resulting `dist/` directory to a static host. `npm run preview` serves the production output locally. `npm test` checks route boundaries and return navigation.

## Experience

- The main coastal route has Intro, Career, Projects, Skills, and Contact stops.
- Arrow Up/Right advances; Arrow Down/Left returns to the previous stop. Click a physical landmark or bottom progress dot to jump directly. Touch buttons and swipes work on mobile.
- Press Enter at Career or Projects to enter its separate, longer route. The camera follows the car; only nearby stops need to be in the viewport.
- Escape returns from a section to its originating stop, or closes the native image viewer.
- Project cards keep two images visible while Overview, My role, and Media tabs switch the text. Clicking an image opens an accessible modal gallery.
- Company images link to related projects and provide a return action.
- Intro, Skills, and Contact use compact image-rich cards in the hub.
- Simple view provides a text-and-image version and is also offered if WebGL cannot initialize.
- Motion respects `prefers-reduced-motion`; sound is off until enabled. The sound effect is synthesized locally and downloads no audio file.

## Add your content

Edit `src/content.js`. Replace `profile`, `projects`, `companies`, and `skillGroups` with real information. Add project image files under `public/media/`, then reference them with `/media/your-image.jpg`. Keep screenshots optimized for the web. Fill the résumé, email, LinkedIn, and project URLs; missing destinations are marked unavailable instead of linking to fake pages.

The existing project names, company records, and generated artwork are explicitly illustrative. They do not represent the developer's actual employment or work. The `demo` flags are ready to be removed or set false when replacing those records; the template's sample labels should also be removed for a final personalized release.

Route length is derived from the number of records. Adding a project or company automatically extends its modular coast and navigation. The scene implementation lives in `src/scene.js`, interface behavior in `src/main.js`, and responsive styling in `src/style.css`.

## Assets and performance

All 3D models are built directly from low-poly geometry in `src/scene.js`: car with independent wheels, faceted coastline, road, palms, rocks, grass, railings, pier, lamps, and section/project landmarks. This first version does not depend on Blender or downloaded model packs. Those meshes can later be replaced with Blender-exported GLB assets while retaining the route and interface code.

Three illustrative preview images were generated with the built-in image generation tool; prompts are recorded in `public/media/provenance.json`. They are compressed JPEG files and loaded as images rather than as 3D textures. Fonts are bundled locally with their licenses in `public/fonts/`.

The only production JavaScript dependency is Three.js. Vite is used only for development and bundling. Pixel ratio is capped, materials are reused, there are no expensive postprocessing passes, and old route geometry/textures are disposed when changing sections.

## Current limits

This is a working first visual implementation of the approved mockup direction. Personal content, genuine project screenshots, company branding, and public links still need to be supplied. Mobile browser checks use a resized viewport; physical-device testing remains necessary. Detailed art matching and further performance tuning should be guided by review of the working scene.
