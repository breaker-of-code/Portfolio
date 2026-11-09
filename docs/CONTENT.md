# Editing content and media

Updated 2026-11-09. All current records below are approved and published in application release 5cc0406. No admin exists: edit source/media locally, verify, then deploy only when requested. Private approvals/inventory/preparation scripts are in sibling content-review, not the public app.

## Approval workflow

- For every NEW project, ask desired insertion position, kind of game/application, personal contribution and employer/personal association. Confirm copy and apply only supplied/approved facts. Never guess metrics, links or relationships.
- ASK position before adding; array order controls island order. Current eleven are approved. Hexagrids X was explicitly skipped; don't restore it.
- Reorder by identity and update each project.index and every company.projectIndices together. They are zero-based positions, not stable IDs. Cover/gallery navigation depends on these mappings.
- Current company descriptions are approved; user authorized factual editorial improvements. Do not repeatedly ask approval for unchanged records.
- Future edits stay local until the next explicit deployment request, even if individual content was approved.

## Current project order and employers

| UI position | Array index | Project | Employer/ownership |
| --- | --- | --- | --- |
|1|0|Arthur VR|Arthur Technologies|
|2|1|Gods of Chess|Five Rivers Technologies|
|3|2|Pet Idle Miner|Personal, alongside fellow developer|
|4|3|E.V.A.L.|Five Rivers Technologies|
|5|4|XANA|No Borders Innovations|
|6|5|Tap Challenge|Five Rivers Technologies|
|7|6|Game Changer|Zepro Digital|
|8|7|Enter the Dungeons|Five Rivers Technologies|
|9|8|Shape Jump|Five Rivers Technologies|
|10|9|Pong 3D|Five Rivers Technologies|
|11|10|Wonderland Runner|Nutty Apps|

| Company | projectIndices |
| --- | --- |
|Zepro Digital|[6]|
|Nutty Apps|[10]|
|Five Rivers Technologies|[1,5,3,8,7,9]|
|No Borders Innovations|[4]|
|Arthur Technologies|[0]|
|Arkadium|[]—user will supply games later|
|Infinity Up|[]—user will supply games later|

Source spelling is authoritative (Pong 3D includes a space). Keep Wonderland after the ten explicitly reordered projects; Pet is third per the user's numbered list.

## Profile, contact and résumé

`src/content.js` exports profile fields name/title/years/bio/email/linkedin/github/whatsapp/availability/resume/portrait.

- Hafeez Akram, Lead Unity Developer,9 years. Approved bio is in source. Search main.js/index.html for hardcoded experience/help/metadata copy when changing years/title; update initial and runtime tab title consistently.
- Public email hafeez.akram 21@gmail.com. LinkedIn https://www.linkedin.com/in/hafeez-akr/; GitHub https://github.com/breaker-of-code; WhatsApp https://wa.me/923088127585. Both full-time and freelance/contract availability.
- Email is an address, UI constructs mailto. HTTPS external links use new tab/noopener/noreferrer. WhatsApp opens a chat, never sends automatically. Copy email fallback remains. Leave missing destinations empty, never fake # links.
- Original supplied PDF is `public/files/Hafeez-Akram-Developer.pdf`, referenced as `/files/Hafeez-Akram-Developer.pdf`. Keep unchanged unless user asks revision. It contains older 8+ years/Arkadium-end/solo-Pet wording; website uses later approved corrections.
- Original young.jpg is copied unchanged to `public/media/profile/hafeez-akram.jpg`. Intro is square, right-aligned crop; Contact is a wide cover banner with object-position:right 20% to move photo down. Do not apply square Contact crop again.

## Record shapes

Projects consume name,visual,category,summary,role,outcome,technologies,images,thumbnails,videos,links,demo,index. `demo:false` for real records. Keep outcome empty if no verified result. images and optional thumbnails have matching positions; videos are objects `{src,poster,title}`. `links:{watch,play,source}` remain data even though the project dock no longer shows separate link/video buttons.

Company records consume name,role,dates,timelineYear,description,outcome,projectIndices,logo,demo and optional legacy detail fields. dates are display text; numeric timelineYear anchors animation and now reflects approved chronology (2016/2017/2018/2020/2021/2024/2024). Current year/end handling is in scene.js. Preserve ongoing as-needed Arkadium contract (Apr 2024–Present), not fixed hours/full-time. Do not restore Mushroom Spring or publisher-contract claims for Infinity Up. Pet only claims Lion Studios approached about publishing, no signed deal.

- Island size follows record count; no fixed four-company/eight-project limit. Current navigation assumes nonempty routes.
- Procedural project visuals are selected by project-landmarks.js/project-icons.js using reviewed names and visual fallback. Keep icon footprint clear of rocks at animated size. Arthur headset, E.V.A.L. character and Pet animals/cash are intentional.
- Company names use title case; label-layout.js measures growing board width with fixed glyph size/tracking. Rooftop C is logo-only,1.25x, disk 512 px with 3 px safety margin, source margins trimmed for display. Provided original logos/provenance in public/media/company-logos; retain aspect and source bytes.

## Detail/gallery behavior

- Career dock: overview description only, left 50% project photos/right 50% text, no Work/Impact tabs or Resume utility. Header Resume remains. Legacy extra data fields need not be deleted to hide tabs.
- company-gallery.js resolves only explicit valid/unique approved project links. If a company has exactly one project, use multiple screenshots of that project (at least two slots; duplicate only if sole source photo). More than one project uses one cover/project. Empty associations retain a placeholder.
- Clicking a Career preview opens the entire selected project's mixed gallery without changing Career route.
- Projects dock uses two photo thumbnails plus one View all X photos[& videos] button; photo count excludes videos. No separate Watch videos/Project link control.
- More than two eligible previews rotate pairs every 4 s with 220 ms fades; odd counts wrap. preview-rotation.js predecodes only the next pair; changed media/click target/alt/caption update together. Hidden/dialog/travel/transition/loading pauses, cancellation and reduced-motion behavior must remain.
- Full gallery strip scrolls within modal. Selected full image loads, then at most the next image preloads. Never preload video. Videos get a source only when selected, preload none, no autoplay; changing/closing pauses and releases source.

## Media preparation and paths

- Full images are proportional WebP, generally max 1600x 1000; thumbnails max 480x 300. Keep original aspect, sensible alt, small video posters. Videos are full-duration H.264/AAC faststart, no application background download of all clips.
- Each project folder under public/media/projects has provenance with input names/hashes/preparation. Original exports stayed in Downloads; preparation scripts/private approvals stay in sibling content-review. Do not add huge source folders or private inventories to Git.
- All runtime paths use root-style `/media/...` or `/files/...` then asset-url.js adds `/Portfolio/`. CSS/fonts go through Vite. Do not hardcode the deployment prefix into every content field; do not double-prefix.
- Current dist has 330 files,~104 MiB total public media,10 videos. Total on disk/repository is not initial transfer; nonvideo deployed files total~13.25 MB across all routes/gallery/audio/fonts, not all startup either.
- Everything in public and the public repository is public. Never include credentials, private backups/drafts or unapproved files. Preserve audio/image/font licenses and provenance.

## Skills and Home

- skillGroups has six `{name,title,skills:[{skill,level}]}` groups.25 confirmed skills; levels are exactly Strong,Working knowledge,Learning. No sample skill-image stems remain.
- Strong=green,Working=blue,Learning=yellow categorical bars/tiles. No invented numerical ratings. Only level filters available in selected category appear; reset absent selection to All. Paging 6 desktop/4 narrow/2 short replaces nested scrolling.
- Floating badges Unity/C#/Firebase/WebGL/Cloud/AWS/VR use skill-motion.js. Preserve DOM/controller across category/filter/page changes, continuous collision trajectories and reduced-motion/visibility handling.
- Tools round was unanswered/deferred; Steam was not confirmed. Ask before adding claims.
- hub remains ordered Intro,Career,Projects,Skills,Contact. These positions couple to navigation.HUB_STOPS, entry/contact logic and main.js. Adding a Home section requires code work beyond data.

## Verify and retain files

Check modified cards/links, both route lengths, company galleries after reorder, long copy, image crop and gallery containment at desktop/mobile sizes. Run relevant tests for behavior/relationships and production build before publication. Verify live URL after deploying and append checks/limits to TEAM_LOG.

Keep app/public and .git locally. User says source originals are on Drive and PC storage is low: Downloads originals may be deleted once backup is verified; runtime does not depend on them. node_modules and dist can be regenerated (npm ci/build). Removing original source copies can prevent rerunning private preparation scripts until downloaded again. Do not delete any user files without a clear request.
