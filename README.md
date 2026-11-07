# The Scenic Route

A lightweight interactive portfolio built with vanilla HTML, CSS, JavaScript, and Three.js. No Unity runtime, React, physics engine, backend, or external font service is needed.

## Run locally

```sh
npm install
npm run dev
```

Open the printed localhost URL. Build with `npm run build`; deploy the resulting `dist/` directory to a static host. `npm run preview` serves the production output locally. `npm test` checks route boundaries, return navigation, the speed curve, repeated travel commands, reversal limits, and immediate arrival unlock, continuation, and velocity-preserving travel.

## Experience

- The main coastal route has Intro, Career, Projects, Skills, and Contact stops.
- The car accelerates from rest, cruises, and brakes smoothly into each stop. The selected landmark grows on arrival and returns to its resting size when leaving. Both effects respect reduced motion.
- Arrow Up/Right advances; Arrow Down/Left returns to the previous stop. Repeated input cannot restart a trip. One opposite command reverses to the departure stop, then travel commands wait until arrival. Controls unlock immediately on arrival; in the last 0.25 seconds of a forward trip, another command can extend travel through the stop without resetting velocity. Click a physical landmark or bottom progress dot to jump directly. Touch buttons and swipes work on mobile.
- The ocean has flowing water shading, drifting wave crests, rolling shoreline foam, three fish schools, two drifting sailboats with wakes, and a bobbing wooden dinghy near the pier. Ambient animation pauses behind the phone orientation screen and freezes under reduced motion.
- Faceted coastal tunnels hide the road cut at both ends of every route, with recessed dark interiors, stone portal arches, and warm entrance lights.
- The home camera fits both island ends across the screen with horizontal padding. Projects use a wider camera view. Layout A docks all stop details in a wide bottom panel, with text on the left and two project images and actions on the right. Compact transparent stop navigation, driving buttons, and utility controls sit above the 3D area. The camera reserves the dock area even while the card is hidden, and clamps long-route tracking near both ends. Landscape phones use a shorter dock. All stop cards disappear during travel and appear at full opacity on arrival, with no internal scrolling. The gently curved road controls car orientation through its tangent.
- Press Enter at Career or Projects to enter its separate, longer route. The camera follows the car; only nearby stops need to be in the viewport.
- Escape returns from a section to its originating stop, or closes the native image viewer.
- Entering or leaving a section fades the viewport through near-black teal. The route changes under full cover; the camera renders and card images decode before the new view is revealed. Inputs are blocked during the brief transition. Reduced motion skips the fade.
- Project cards keep two images visible while Overview, My role, and Media tabs switch the text. Clicking an image opens an accessible modal gallery.
- Career has parallel 3D timeline rails, a moving progress marker, company milestones, and date plates. Placeholder records show “DATES TO ADD” until real employment dates are supplied. Company cards use Overview, Impact, and Work tabs; images link to related projects with a return action.
- Intro, Skills, and Contact use compact image-rich cards in the hub.
- Simple view provides a text-and-image version and is also offered if WebGL cannot initialize.
- Phones and touch tablets require landscape for the 3D experience. Portrait shows a rotate-device screen and pauses animation/travel. A user-initiated fullscreen button attempts `screen.orientation.lock("landscape")`; browsers without support continue after manual device rotation. Native orientation lock needs physical-device validation.
- Motion respects `prefers-reduced-motion`; sound is off until enabled. The sound effect is synthesized locally and downloads no audio file.

## Add your content

Edit `src/content.js`. Replace `profile`, `projects`, `companies`, and `skillGroups` with real information. Add project image files under `public/media/`, then reference them with `/media/your-image.jpg`. Keep screenshots optimized for the web. Fill the résumé, email, LinkedIn, and project URLs; missing destinations are marked unavailable instead of linking to fake pages.

The existing project names, company records, and generated artwork are explicitly illustrative. They do not represent the developer's actual employment or work. The `demo` flags are ready to be removed or set false when replacing those records; the template's sample labels should also be removed for a final personalized release.

Route length is derived from the number of records. Adding a project or company automatically extends its modular coast and navigation. The scene implementation lives in `src/scene.js`, the reusable Jeep model in `src/jeep.js`, interface behavior in `src/main.js`, and responsive styling in `src/style.css`.

## Assets and performance

All 3D models are built directly from low-poly geometry in `src/scene.js`: open-top orange off-road Jeep with a roll cage, spare tyre, independent treaded wheels and speed-matched wheel rotation, faceted coastline, road, palms, rocks, grass, railings, pier, lamps, and section/project landmarks. This first version does not depend on Blender or downloaded model packs. Those meshes can later be replaced with Blender-exported GLB assets while retaining the route and interface code.

Three illustrative preview images were generated with the built-in image generation tool; prompts are recorded in `public/media/provenance.json`. They are compressed JPEG files and loaded as images rather than as 3D textures. Fonts are bundled locally with their licenses in `public/fonts/`. The Unity cube image is the unmodified official asset linked from https://unity.com/legal/branding-trademarks and bundled as `public/media/unity-logo.png`.

The ocean implementation lives in `src/ocean.js`. Water motion runs in the existing material shader; 90 small wave crests share one instanced draw call. Boats and fish use procedural low-poly geometry, with no new packages or downloaded assets. Ambient scenery is excluded from the island camera-fit bounds and rebuilt/disposed with each route. Boat and fish paths were sampled over four minutes on three route lengths to check offshore clearance; geometry cleanup and frozen-time poses were also checked.

The only production JavaScript dependency is Three.js. Vite is used only for development and bundling. Pixel ratio is capped, materials are reused, there are no expensive postprocessing passes, and old route geometry/textures are disposed when changing sections. Soft contact shadows use small shared procedural textures. The visual revision adds beveled plinths, a shaped hatchback with inset glass and wheel details, segmented palms, masonry arches and vines, a racing landmark, and a lower three-quarter camera oriented to follow the approved reference composition.

## Current limits

This is a working first visual implementation of the approved mockup direction. Personal content, genuine project screenshots, company branding, and public links still need to be supplied. Responsive browser checks cover phone portrait (320×568, 390×844), phone landscape (844×390), tablet (768×1024), desktop (1440×900), and wide desktop (1920×1080). These are resized browser viewports; physical-device and cross-browser testing remain necessary. Detailed art matching and further performance tuning should be guided by review of the working scene.
