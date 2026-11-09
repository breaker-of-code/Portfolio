# Edit content without an admin

There is currently no editing UI. Change source/media, verify the result, build and redeploy `dist/`.

## Profile and contact

Edit `profile` in `src/content.js`: `name`, `title`, `years`, `bio`, `email`, `linkedin`, `resume`, `portrait`.

- `email` is an address; the UI constructs mailto. Use actual external URLs for LinkedIn/project links.
- Put distributable résumé PDFs/portraits in `public/media/` and reference their public URL, or use a valid external URL.
- Keep missing destinations empty rather than using fake links or `#`.
- **Also search `src/main.js` and `index.html`**: the brand/title, 9 YEARS badge, metadata and some experience text are hardcoded. `profile.years` alone does not update every instance.

## Projects

Arthur VR is the first approved project object; the remaining sample tuples await individual approval. Retain fields consumed by the renderer:

```js
{
  name: 'Verified project name',
  visual: 'puzzle',
  category: 'Gameplay',
  summary: 'A factual short description.',
  demo: false,
  images: ['/media/cover.jpg', '/media/detail.jpg'],
  thumbnails: ['/media/cover-thumb.webp', '/media/detail-thumb.webp'],
  videos: [{ src: '/media/demo.mp4', poster: '/media/demo-poster.webp', title: 'Feature demo' }],
  role: 'Your responsibilities.',
  outcome: 'A verified result.',
  technologies: ['Unity', 'C#'],
  links: { watch: '', play: '', source: '' },
  index: 0,
}
```

Those image paths match current root hosting. Adapt them through the asset-base solution before repository-subpath Pages deployment.

`visual` selects a supported procedural model; inspect `src/project-icons.js` before inventing a value. Provide the images expected by the two-image/gallery UI, or update rendering to handle fewer safely. Update explicit indices and company links when reordering.

## Career

Replace sample `companies` with verified records containing `name`, `role`, `dates`, `timelineYear`, `description`, `outcome`, `projectIndices`, `demo`.

- `dates` is employment display text; `timelineYear` is a numeric animation anchor. Current 2017–current values are sample anchors only.
- `projectIndices` contains **zero-based array positions**. Reordering/deleting projects can break references; update them together. Stable-ID migration is future admin work.
- Island size/stop count follows company/project record count; current four/eight counts are not fixed limits.
- Avoid empty route arrays unless navigation/rendering is updated to support them; current code assumes valid stops.

## Skills and Home sections

- `skillGroups`: `name`, `title`, `summary`, `images`.
- Skill images currently use **media stems**, e.g. `['puzzle', 'arena']`; `main.js` constructs `/media/puzzle.jpg`. They do not currently accept arbitrary full URLs in the same way project images do.
- `hub` ordering/IDs are coupled to `HUB_STOPS` in `navigation.js` and route-entry/contact logic in `main.js`. Adding a Home section needs code changes, not just another record.
- Preserve approved model/icon styles when only replacing data.

## Media and illustrative labels

- Everything in `public/` is public. Never put secrets, private backups or unpublished personal files there.
- Compress images and retain correct alt text/source/license metadata.
- Provenance: `public/media/provenance.json`, `public/audio/provenance.json`, bundled font licenses. Preserve Unity logo proportions and source/branding requirements.
- `demo: false` alone does **not** remove all sample labels. `main.js` contains shared illustrative markup and simple-view notices; change them after data is real.

## Verify and record

Check changed cards, images/gallery and links. For record/order changes, also test both longer routes, related-project jumps and return navigation. Check long text on desktop/mobile. Run relevant existing tests when behavior/relationships change and build before deployment. Verify the real hosted URL after publication. Append the result to `TEAM_LOG.md`.

## Company detail galleries (latest)

Company dialogs show only `description` as overview text, with 50% images on the left and 50% overview copy on the right. Career and Projects have no resume control inside details; the header provides Resume. Legacy `work`/`outcome` values remain in data for reference but no longer have tabs in this dialog. Once the user supplies mappings, set `projectIndices` to the approved projects' zero-based positions. `company-gallery.js` builds one cover per linked project, and clicking it opens all of that project's images in the existing popup, staying on the company route. Never assign projects by guessing employer relationships.

## Project media loading

- `images` contains full gallery images; optional `thumbnails` uses the same order and small files for detail previews, gallery strip, Simple view and company covers. Legacy records without thumbnails fall back to images.
- `videos` contains `{src, poster, title}`. Videos follow the images in the same gallery inside the single View all photos & videos viewer. Keep posters small. No autoplay: source is assigned only when its item is selected, with `preload="none"`. The browser may use its own preload policy; no application fetch/preload of video is scheduled.
- Only two project image thumbnails appear in the dock. The gallery strip uses lazy thumbnails; the selected full image loads and then preloads at most the next image. Never preload a next video. Closing/changing media pauses and releases the video source.
- Real project copy/alt text must not say illustrative. Sample records remain marked until individually replaced. Empty outcome copy is omitted; do not invent a metric to fill it.
- Arthur media is in `public/media/projects/arthur/`, with original filenames/hashes and processing in provenance. Originals remain in Downloads. Preparation script is private workspace `../content-review/prepare-arthur.py`, not a production dependency. Do not copy the original 586 MB folder into the repository.

- Project docks no longer show Watch videos, Project link, Play or source buttons; URLs remain in content for future use. The only media action counts `images.length` photos and adds “& videos” only when videos exist. Samples also use this gallery action.
- `project-landmarks.js` maps reviewed names to 3D visuals. Use explicit `visual` as fallback for unknown names. The E.V.A.L. model follows the supplied red round character; no character model asset was invented or downloaded. Models load with the Projects chunk.

## Rotating detail previews

- Projects with more than two screenshots rotate pairs in the existing two image slots every four seconds, using only thumbnail URLs. Video posters/clips are not included in this rotation. Counts of one or two remain static.
- Career rotates two project covers when more than two explicitly linked projects have images. It does not rotate arbitrary screenshots within a company cover or infer employer associations. Empty company mappings still show the existing placeholder.
- `preview-rotation.js` handles pair order/wrapping, decode-before-fade, cancellation and reduced motion. `main.js` supplies image indices or linked-project indices, keeping the click target, accessible label and image caption synchronized.
- The current pair stays still while any dialog is open, the dock is hidden, the car moves, a section transitions or the tab is hidden. Re-rendering/disposal cancels its previous interval and animations. Only the next pair of small previews is decoded on demand.

- Approval workflow (2026-11-09): ask which company each project was made with as part of each project review. Apply confirmed links immediately; do not wait for all projects or infer the employer. Arthur VR → Arthur Technologies is confirmed.

- Confirmed association: Gods of Chess → Five Rivers Technologies (project index 1). Arthur VR → Arthur Technologies remains index 0. Both mappings are local; keep asking the company during each subsequent project review.

- Tap Challenge is approved locally: project index 2, 12 optimized screenshots, Unity/C#/Firebase tags and tap-button landmark. Explicit employer: Five Rivers Technologies; company.projectIndices is [1, 2] for Gods of Chess and Tap Challenge. Arthur index 0/mapping is unchanged. Five sample stops remain.

- Latest approved local projects: Arthur VR [0] → Arthur Technologies; Gods of Chess [1], Tap Challenge [2] and E.V.A.L. [4] → Five Rivers Technologies; XANA [3] → No Borders Innovations. E.V.A.L. is a Unity platformer with Hafeez as main developer, using 12 optimized photos; XANA uses 16 photos and one full-duration on-demand video. Five Rivers now has three covers for automatic pair rotation. Five real records and three sample stops remain; no publication.

- Game Changer is approved locally at index 5: 3D boxing game, associate developer, Zepro Digital [5], 12 optimized photos and boxing landmark. Six real project records and two sample stops remain.

- Shape Jump is approved locally at index 6: endless jumping survival with drawing controls, main developer, Five Rivers Technologies [1, 2, 4, 6], 17 optimized photos and jump landmark. Seven real projects and one sample stop remain; further supplied projects still need review.

- Enter the Dungeons is approved locally at index 7: multiplayer 2D strategy, main developer, Five Rivers Technologies [1, 2, 4, 6, 7], five optimized photos and dungeon landmark. All eight current project stops are real; Hexagrids X, Pong and Wonderland Runner are additional supplied projects still awaiting review, not yet entered.

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
