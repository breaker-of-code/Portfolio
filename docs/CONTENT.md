# Edit content without an admin

There is currently no editing UI. Change source/media, verify the result, build and redeploy `dist/`.

## Profile and contact

Edit `profile` in `src/content.js`: `name`, `title`, `years`, `bio`, `email`, `linkedin`, `resume`, `portrait`.

- `email` is an address; the UI constructs mailto. Use actual external URLs for LinkedIn/project links.
- Put distributable résumé PDFs/portraits in `public/media/` and reference their public URL, or use a valid external URL.
- Keep missing destinations empty rather than using fake links or `#`.
- **Also search `src/main.js` and `index.html`**: the brand/title, 9 YEARS badge, metadata and some experience text are hardcoded. `profile.years` alone does not update every instance.

## Projects

`projects` currently maps sample tuples to objects. Explicit objects may be clearer for real data; retain fields consumed by the renderer:

```js
{
  name: 'Verified project name',
  visual: 'puzzle',
  category: 'Gameplay',
  summary: 'A factual short description.',
  demo: false,
  images: ['/media/cover.jpg', '/media/detail.jpg'],
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
