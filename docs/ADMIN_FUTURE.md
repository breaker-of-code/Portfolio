# Deferred admin panel

**User decision, 2026-11-08: skip admin for now; publish static first.** The features below are preserved requirements, not implemented features or dependencies of the current site.

## Confirmed choices

- One owner, **email/password login**, no public registration.
- Save **private drafts**, then **explicitly publish**.
- Edit profile, companies, projects, skills, contact information, images, résumé, files and links through a UI.
- Admin-only, versioned JSON import/export; include image/résumé file bytes and metadata so backups restore on another computer without original local files or temporary URLs.
- Import/export controls and private backup files must not appear on the public portfolio. Published data itself is necessarily public.
- Keep the portfolio URL when adding admin later.

## Hosting direction discussed

GitHub Pages serves the static frontend. Real authentication, persistent drafts and uploads need a separate backend.

Supabase Free was discussed, but the user rejected its inactive-project pausing risk. Cloudflare Workers + D1 + R2 was discussed as an alternative with free usage allowances. **No backend/provider account/database/bucket/paid service was created.** Recheck quotas, required billing setup and authentication design when implementation resumes; free tier does not mean unlimited service.

Publish public portfolio data and required media independently of a live admin backend. The public site must not require regular owner logins or an active editor database to remain available.

## Implementation requirements for later

- Add `/admin` with separate styles; public fullscreen/overflow rules must not prevent dashboard scrolling.
- Enforce authorization server-side for every private operation. No hardcoded browser password or localStorage-only authentication.
- Keep credentials/tokens out of Git, frontend bundles, public assets and JSON exports.
- Use stable IDs and validate company/project relationships; migrate/adapt current numeric `projectIndices`.
- Validate files/types/sizes, records, URLs and schema versions. Preview imports, create recovery snapshots and avoid partial restoration. Restore to draft, not directly to public content.
- Include `schemaVersion`, `exportedAt`, content, file metadata/bytes and integrity checks. Explain oversized-file handling; preserve external links as links.
- Implement save/publish status, validation/errors, unsaved-change warnings and authenticated draft previews.
- Ensure publication updates actual public headers/cards, timelines, stop counts, links and files.

## Theme

Use a lightweight 2D dashboard: ocean/deep teal shell, warm sand `#ead3ab`, cream `#fff8e9`, dark teal text `#173e49`, muted `#6f7b78`, amber `#ffb329`, deep teal `#004b55`. Reuse bundled DM Sans/Manrope fonts, approximately 8px corners, outline icons and restrained shadows with accessible contrast. Do not render the Three.js ocean behind admin.

Suggested areas: Overview, Profile, Career, Projects, Skills, Contact, Files, Backup/Restore, Settings.

Validate authentication/unauthorized access, private draft isolation, CRUD/order/relationships, safe uploads, portable JSON round trips/recovery, explicit publication, responsive admin layouts and public-site regressions.


Status reaffirmed 2026-11-09: the combined static content release is live (5cc0406); no admin/backend work was resumed. User approval is required to resume this separate task.
