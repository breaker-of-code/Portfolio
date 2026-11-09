import { createHeldDrive } from './held-drive.js';
import { createBadgeMotion } from './skill-motion.js';
import { createPreviewRotation, fadePreviewPair } from './preview-rotation.js';
import { projectMedia, nextGalleryImage, releaseGalleryVideo } from './project-media.js';
import { companyProjectGalleries, companyPreviewImages } from './company-gallery.js';
import { assetUrl } from './asset-url.js';
import './style.css';
import { createNavigation, HUB_STOPS } from './navigation.js';
import { createDriveController } from './drive-controller.js';
import { profile, projects, companies, skillGroups, hub } from './content.js';
import { createSoundMixer } from './sound-mixer.js';
import { AmbientLoop } from './ambient-loop.js';
import { SoundEffect } from './sound-effect.js';
import { InterfaceSounds } from './interface-sounds.js';
import { SOUND_PREFERENCE_KEY, readSoundPreference, saveSoundPreference } from './sound-preference.js';
import { createBounceNavigator, createIdleTour } from './visitor-tour.js';
import { createControlsIntro } from './controls-intro.js';

const icons = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  external: '<path d="M14 4h6v6m0-6-9 9M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/>',
  play: '<path d="m8 5 11 7-11 7V5Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  photo: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m3 16 6-6 12 10"/><circle cx="16" cy="8" r="1"/>',
  expand: '<path d="M14 4h6v6M4 14v6h6m10-16-7 7M4 20l7-7"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  home: '<path d="m3 10 9-7 9 7v11H3V10Z"/><path d="M9 21v-8h6v8"/>',
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8 9h8m-8 4h5"/>',
  sound: '<path d="m11 4-5 5H2v6h4l5 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  fullscreen: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  mute: '<path d="m11 4-5 5H2v6h4l5 5V4Zm5 5 6 6m0-6-6 6"/>',
};
const svg = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.arrow}</svg>`;
const escape = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const demo = '<span class="sample-label"><i></i>Illustrative content</span>';
const NAVIGATION_SESSION_KEY = 'coastal-portfolio:location:v1';
let savedLocation = null;
try { savedLocation = JSON.parse(sessionStorage.getItem(NAVIGATION_SESSION_KEY)); } catch { /* Fresh Home when storage is unavailable. */ }
const nav = createNavigation({ hub: hub.length, projects: projects.length, career: companies.length }, savedLocation);
const driver = createDriveController({ getIndex: () => nav.state.index, getLength: () => ({ hub: hub.length, projects: projects.length, career: companies.length })[nav.state.route], go: index => { playUi('click'); nav.go(index); } });
let sceneRoute;
const companySceneItems = companies.map(c => ({ ...c, icon: 'building' }));
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const isMobileDevice = () => (matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0) && Math.min(innerWidth, innerHeight) <= 1024;
const zoomModeForViewport = () => isMobileDevice() || matchMedia('(max-height: 550px) and (orientation: landscape)').matches ? 'mobile' : 'desktop';
const zoomStorageKey = () => `coastal-portfolio:view-zoom:auto-v1:${zoomMode}`;
let zoomMode = zoomModeForViewport();
function loadZoom() {
  const values = { hub: null, career: null, projects: null };
  try {
    const saved = JSON.parse(localStorage.getItem(zoomStorageKey()) || '{}');
    for (const route of Object.keys(values)) {
      if (typeof saved?.[route] === 'number' && Number.isFinite(saved[route])) values[route] = Math.max(10, Math.min(600, Math.round(saved[route])));
    }
  } catch { /* Automatic fitting still works when storage is unavailable. */ }
  return values;
}
const viewZoom = loadZoom();
let badgeMotion = null;
let world, activeTab = 'overview', skillTab = 0, skillLevel = 'All', skillPage = 0, hiddenCard = false, moving = false, soundOn = readSoundPreference(), soundReady = false, audioDisposed = false, audioContext, audioMixer, ambientLoop, idleLoop, drivingLoop, splashSound, interfaceSounds, engineSpeed = 0;
let previewRotation = null;
let galleryImages = [], galleryIndex = 0, galleryIllustrative = true, returnLocation = null, toastTimeout;
let sectionTransition = false, pendingState = null, splashLandingCount = 0;
let experienceReady = false, startingExperience = false, startupAttempt = 0, loadingHintTimer;

document.querySelector('#app').innerHTML = `
  <canvas id="world" aria-label="Interactive low-poly coastal portfolio. Tap the Jeep, use the navigation buttons, or press Left/Right arrow keys to move the orange car."></canvas>
  <div class="ocean-vignette" aria-hidden="true"></div>
  <div id="section-transition" role="status" aria-live="polite" hidden><span>Preparing your next island…</span></div>
  <div id="controls-intro" role="status" aria-live="polite" hidden><div class="controls-intro-copy"><h2>Press ← / → to move</h2><p>You can tap the Jeep too. Click, tap or press a key to begin.</p></div></div>
  <div id="loading" class="loading-screen" role="status" aria-live="polite"><div class="loading-card"><span class="eyebrow">A SMALL WORLD. A BIG HELLO.</span><div class="loading-car" aria-hidden="true">▰</div><h1>Preparing your journey<span>.</span></h1><p>A little coast, a little code, a little curiosity.</p><div class="loading-track"><span></span></div><small>Loading the island</small><div class="loading-actions" hidden><button class="primary" data-action="retry-scene" hidden>Retry 3D view</button><button class="secondary" data-action="simple">Open simple view</button></div></div></div>
  <header class="site-header">
    <button class="brand" data-action="home" aria-label="Return to the main island"><img class="unity-logo" src="${assetUrl('/media/unity-logo.png')}" alt="Unity"/><span>${escape(profile.title.toUpperCase())}<small><strong>${profile.years} YEARS</strong> OF EXPERIENCE</small><span class="eyebrow route-breadcrumb" id="route-eyebrow">HOME / INTRO</span></span></button>
    <div class="journey-bar">
      <div class="journey-meta"><span class="eyebrow" id="journey-label">YOUR LITTLE DETOUR</span><span id="journey-count">01 <i>/</i> 05</span></div>
      <nav id="stops" class="stops" aria-label="Choose a destination"></nav>
      <div class="drive-controls"><button id="previous" class="drive-button" data-action="previous" aria-label="Previous stop">${svg('back')}<span>Previous</span></button><button id="next" class="drive-button" data-action="next" aria-label="Next stop"><span>Next stop</span>${svg('arrow')}</button></div>
      <div class="route-tools"><span class="control-hint"><kbd>←</kbd><kbd>→</kbd> to drive <span class="divider">·</span> <kbd>Enter</kbd> to explore</span><div class="zoom-control" role="group" aria-label="View zoom"><label id="zoom-label" for="zoom-slider">ZOOM</label><input id="zoom-slider" type="range" min="10" max="600" step="1" value="100" aria-label="Zoom" aria-valuetext="100 percent"/><output id="zoom-value" for="zoom-slider">100%</output><button data-action="reset-zoom" aria-label="Reset zoom to fit screen" title="Reset this view to fit screen">↺</button></div></div>
    </div>
    <nav class="header-nav" aria-label="Quick navigation"><button data-action="home" data-section="hub">Home</button><button data-route="projects">Projects</button><button data-route="career">Career</button><button data-action="resume">Resume ${svg('external')}</button><button class="contact-link" data-stop="4">Say hello ${svg('arrow')}</button></nav>
  </header>
  <main id="experience" aria-label="Interactive portfolio">
    <div class="route-heading"><button class="back-link" data-action="home" id="back-home" hidden>${svg('back')} Back to the island</button><span id="back-hint" class="back-hint" hidden>Press <kbd>Esc</kbd> to go back</span><h1 id="route-title">Take the scenic route<span>.</span></h1><p id="route-subtitle">Nine years of Unity. A world of things to explore.</p></div>
    <svg id="card-tether" aria-hidden="true"><path id="tether-path"/><circle id="tether-dot" r="4"/></svg>
    <aside id="info-card" class="info-card" aria-label="Selected stop"><button class="card-close icon-button" data-action="hide-card" aria-label="Minimize information card">${svg('close')}</button><div id="card-content"></div></aside>
    <button id="show-card" class="show-card" data-action="show-card" hidden>${svg('photo')} Show stop details</button>
    <div id="arrival" class="arrival" aria-live="polite"></div>
    <div id="enter-prompt" class="enter-prompt" hidden><button data-action="enter"><span class="explore-desktop">Press <kbd>Enter</kbd> to explore</span><span class="explore-touch">Tap to explore</span><strong id="enter-name">Projects</strong>${svg('arrow')}</button></div>
  </main>
  <div class="bottom-notes"><span class="mobile-hint">Tap a stop. Take your time.</span><div class="utility-controls"><button data-action="simple">Simple view</button><span>·</span><button id="fullscreen-toggle" data-action="landscape" aria-label="Open fullscreen landscape view" hidden>${svg('fullscreen')}</button><button id="sound-toggle" data-action="sound" aria-label="Disable sound" aria-pressed="true">${svg('sound')}</button><button data-action="help" class="help-button" aria-label="Show controls">?</button></div></div>

  <button id="start-sound" class="start-sound" data-action="start-sound" hidden>${svg('sound')} Start sound</button>
  <div id="toast" class="toast" role="status"></div>
  <dialog id="orientation-gate" closedby="none" class="orientation-gate" aria-labelledby="orientation-title" aria-describedby="orientation-note"><div class="orientation-card"><div class="rotate-device" aria-hidden="true"><span></span><b>↻</b></div><span class="eyebrow">A LITTLE MORE ROOM TO EXPLORE</span><h1 id="orientation-title">Let’s go landscape<span>.</span></h1><p id="orientation-note">Turn your device sideways to drive along the coast.</p><button class="primary" data-action="landscape">${svg('fullscreen')} Open landscape view</button><small>The journey starts when your screen is horizontal.</small></div></dialog>
  <dialog id="gallery" class="gallery-dialog" aria-label="Project image viewer"><button class="gallery-close icon-button" data-action="close-gallery" aria-label="Close image viewer">${svg('close')}</button><div class="gallery-top"><span id="gallery-title">Project screenshots</span><small>Illustrative project artwork</small></div><div class="gallery-image-wrap"><button data-action="gallery-previous" class="gallery-arrow" aria-label="Previous image">${svg('back')}</button><img id="gallery-image" alt=""/><video id="gallery-video" controls playsinline preload="none" hidden></video><button data-action="gallery-next" class="gallery-arrow" aria-label="Next image">${svg('arrow')}</button></div><div id="gallery-thumbs" class="gallery-thumbs"></div><span id="gallery-count"></span></dialog>
  <dialog id="help" class="help-dialog"><button class="dialog-close icon-button" data-action="close-help" aria-label="Close controls">${svg('close')}</button><span class="eyebrow">A LITTLE FIELD GUIDE</span><h2>Enjoy the drive.</h2><p>Explore the main island, then enter Career or Projects for a longer journey.</p><ul><li><span><kbd>→</kbd></span> Next stop</li><li><span><kbd>←</kbd></span> Previous stop</li><li><span><kbd>Enter</kbd></span> Open a section or card</li><li><span><kbd>Esc</kbd></span> Close a viewer / return home</li><li><span>Tap / click</span> Jump to a destination</li></ul><p class="help-note">One press drives to a stop. Hold an arrow to continue at each stop; release to finish the current trip. You can reverse once during a trip; controls unlock on arrival. Press again in the final quarter-second to continue through the next stop. On touch screens, use the Previous and Next buttons. Sound is on by default; your mute choice is remembered. Your system’s reduced-motion setting is respected.</p><button class="primary" data-action="close-help">Got it ${svg('arrow')}</button></dialog>
  <dialog id="simple-view" class="simple-dialog" aria-label="Simple portfolio view"><button class="dialog-close icon-button" data-action="close-simple" aria-label="Close simple view">${svg('close')}</button><div id="simple-content"></div></dialog>
`;

const $ = selector => document.querySelector(selector);
const card = $('#info-card');
function renderZoom() {
  const route = nav.state.route;
  $('#zoom-label').textContent = 'ZOOM';
  const zoom = Math.round(viewZoom[route] ?? world?.defaultZoom ?? 100);
  $('#zoom-slider').value = zoom;
  $('#zoom-slider').setAttribute('aria-label', 'Zoom');
  $('#zoom-slider').setAttribute('aria-valuetext', `${zoom} percent`);
  $('#zoom-value').value = `${zoom}%`;
  const reset = $('[data-action=reset-zoom]');
  reset.setAttribute('aria-label', `Reset zoom to fit screen`);
  reset.title = `Reset this view to fit screen`;
}
function changeZoom(value) {
  const zoom = Number(value);
  if (!Number.isFinite(zoom)) return;
  viewZoom[nav.state.route] = Math.max(10, Math.min(600, Math.round(zoom)));
  world?.setZoom(viewZoom[nav.state.route]);
  renderZoom();
  try { localStorage.setItem(zoomStorageKey(), JSON.stringify(viewZoom)); } catch { /* Session settings remain usable. */ }
}
$('#zoom-slider').addEventListener('input', event => changeZoom(event.target.value));
const unavailable = (kind = 'Link') => toast(`${kind} will be available when your real content is added.`);
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => $('#toast').classList.remove('visible'), 3400); }
function externalLink(url, label, icon = 'external', cls = 'secondary') {
  if (!url) return `<button class="${cls} unavailable" data-unavailable="${escape(label)}" aria-disabled="true" title="This link has not been added yet">${svg(icon)}${escape(label)}</button>`;
  return `<a class="${cls}" href="${escape(assetUrl(url))}" ${url.startsWith('mailto:') ? '' : 'target="_blank" rel="noopener noreferrer"'}>${svg(icon)}${escape(label)}</a>`;
}
function thumbnails(images, title, indices = null, illustrative = true) {
  return `<div class="thumbnail-strip">${images.map((src, i) => `<button class="thumbnail" data-image="${i}" ${indices ? `data-project="${indices[i]}"` : ''} aria-label="${indices ? 'View related project' : 'Enlarge image'}: ${escape(title)} ${i + 1}"><img src="${escape(assetUrl(src))}" alt="${illustrative ? 'Illustrative ' : ''}${escape(title)} preview ${i + 1}" loading="lazy" decoding="async"/><span>${svg(indices ? 'arrow' : 'expand')}</span></button>`).join('')}</div>`;
}
function renderIntro() {
  return `<div class="intro-portrait"><img src="${escape(assetUrl(profile.portrait))}" alt="${escape(profile.name)}" decoding="async"/></div><div class="card-person"><div><span class="eyebrow">HELLO, WORLD</span><h2>Hi, I’m ${escape(profile.name)}<span>.</span></h2></div></div><p class="card-subtitle">${escape(profile.title)} · ${profile.years} years of experience</p><p class="card-description">${escape(profile.bio)}</p><div class="card-actions"><button class="primary" data-action="explore">Let’s explore ${svg('arrow')}</button></div>`;
}
function renderGateway(id) {
  const isProjects = id === 'projects';
  return `<span class="eyebrow">${isProjects ? 'MADE WITH CURIOSITY' : 'ONE CHAPTER AT A TIME'}</span><h2>${isProjects ? 'A few things I’ve built' : 'The journey so far'}<span>.</span></h2><p class="card-description">${isProjects ? 'Every stop is a project. Drive a little further to discover the details.' : 'Every company is a stop. Explore the roles, contributions, and work along the way.'}</p><div class="gateway-preview"><span>${String(isProjects ? projects.length : companies.length).padStart(2, '0')}</span><div>${isProjects ? 'project stops' : 'career chapters'}<small>${isProjects ? 'Sample collection · ready for your content' : 'Approved experience · more chapters to come'}</small></div></div><button class="primary full-width" data-action="enter"><kbd>↵</kbd> Enter ${isProjects ? 'Projects' : 'Career'} ${svg('arrow')}</button>${demo}`;
}
function renderProject() {
  const p = projects[nav.state.index];
  const tabs = ['overview', 'my role', 'media'];
  let body;
  if (activeTab === 'my role') body = `<div class="detail-block"><strong>Contribution</strong><p>${escape(p.role)}</p>${p.outcome ? `<strong>Outcome</strong><p>${escape(p.outcome)}</p>` : ''}</div>`;
  else if (activeTab === 'media') body = `<p class="card-description">${p.demo ? 'Tap either image for a closer look. This artwork is illustrative.' : 'Open a screenshot to browse the full gallery. Select a video, then press play to watch.'}</p>`;
  else body = `<p class="card-description">${escape(p.summary)}</p>`;
  return `<span class="eyebrow">${String(p.index + 1).padStart(2, '0')} / ${escape(p.category)}</span><h2>${escape(p.name)}<span>.</span></h2>${thumbnails((p.thumbnails || p.images).slice(0, 2), p.name, null, p.demo === true)}${`<button class="project-gallery-open" data-open-project-gallery="${p.index}">${svg('photo')} View all ${p.images.length} photos${p.videos?.length ? ' & videos' : ''}</button>`}<div class="card-tabs" role="tablist" aria-label="Project information">${tabs.map(t => `<button role="tab" aria-selected="${t === activeTab}" data-tab="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div>${body}<div class="tags">${p.technologies.map(t => `<span>${escape(t)}</span>`).join('')}</div>${p.demo ? demo : ''}${returnLocation ? `<button class="related-return" data-action="return-company">${svg('back')} Back to company</button>` : ''}`;
}
function renderCompany() {
  const c = companies[nav.state.index];
  const galleries = companyPreviewImages(c, projects);
  const media = galleries.length
    ? `<div class="company-project-strip" data-count="${galleries.length}">${galleries.slice(0, 2).map(project => `<button class="company-project-photo" data-company-project="${project.index}" aria-label="Open all images for ${escape(project.title)}"><img src="${escape(assetUrl(project.cover))}" alt="${escape(project.title)}" loading="lazy"/><span><span data-preview-title>${escape(project.title)}</span>${svg('expand')}</span></button>`).join('')}</div>`
    : `<div class="company-media-empty">${svg('photo')}<span>Project images</span></div>`;
  return `<div class="company-heading"><span class="company-logo">${String(nav.state.index + 1).padStart(2, '0')}</span><div><span class="eyebrow">A CHAPTER IN THE JOURNEY</span><h2>${escape(c.name)}</h2><p>${escape(c.role)} · ${escape(c.dates)}</p></div></div><div class="thumbnail-strip company-gallery">${media}</div><p class="card-description">${escape(c.description)}</p>${c.demo ? demo : ''}`;
}
function renderSkills() {
  const s = skillGroups[skillTab];
  const levels = ['Strong', 'Working knowledge', 'Learning'].filter(level => s.skills.some(item => item.level === level));
  if (skillLevel !== 'All' && !levels.includes(skillLevel)) skillLevel = 'All';
  const skills = s.skills.filter(item => skillLevel === 'All' || item.level === skillLevel);
  const capacity = innerHeight <= 550 ? 2 : innerWidth <= 900 ? 4 : 6;
  const pages = Math.ceil(skills.length / capacity);
  skillPage = Math.min(skillPage, Math.max(0, pages - 1));
  const visible = skills.slice(skillPage * capacity, (skillPage + 1) * capacity);
  return `<div class="skills-spotlight"><span class="eyebrow">MY TOOLKIT</span><div class="tech-float" aria-label="Unity, C#, Firebase, WebGL AWS cloud and VR development"><span class="tech-badge tech-unity"><img src="${assetUrl('/media/unity-logo.png')}" alt="Unity"/></span><span class="tech-badge tech-csharp">C#</span><span class="tech-badge tech-firebase">${svg('sun')}<small>Firebase</small></span><span class="tech-badge tech-web">&lt;/&gt;<small>WebGL</small></span><span class="tech-badge tech-cloud">${svg('fullscreen')}<small>Cloud</small></span><span class="tech-badge tech-aws">AWS</span><span class="tech-badge tech-vr">VR</span></div><h2>Code. Play. Ship.</h2><button class="skill-work-link" data-route="projects">See my work ${svg('arrow')}</button></div><div class="skills-browser"><div class="skill-categories" role="tablist" aria-label="Skill categories">${skillGroups.map((group,i)=>`<button role="tab" aria-selected="${i===skillTab}" data-skill="${i}">${escape(group.name)}</button>`).join('')}</div><div class="skill-filters" role="group" aria-label="Filter by experience">${['All',...levels].map(level=>`<button aria-pressed="${level===skillLevel}" data-skill-level="${level}" data-level="${level}">${level}</button>`).join('')}</div><div class="skill-list" aria-live="polite">${visible.map(item=>`<div class="skill-item" data-level="${item.level}" aria-label="${escape(item.skill)}: ${item.level}"><span>${escape(item.skill)}</span><span class="skill-fill" aria-hidden="true"><i></i></span></div>`).join('')}</div>${pages > 1 ? `<div class="skill-pages"><button data-skill-page="${skillPage-1}" ${skillPage===0?'disabled':''} aria-label="Previous skills">${svg('back')}</button><span>${skillPage+1} / ${pages}</span><button data-skill-page="${skillPage+1}" ${skillPage===pages-1?'disabled':''} aria-label="Next skills">${svg('arrow')}</button></div>` : ''}</div>`;
}
function renderContact() {
  return `<div class="contact-banner"><img src="${escape(assetUrl(profile.portrait))}" alt="${escape(profile.name)}" loading="lazy"/><span>${svg('mail')}</span></div><span class="eyebrow">THE NEXT CHAPTER</span><h2>Let’s build something<span>.</span></h2><p class="card-description">A team to join. An idea to explore.<br/>A game worth making together.</p><span class="availability"><i></i>${escape(profile.availability)}</span><div class="card-actions">${externalLink(profile.email ? `mailto:${profile.email}` : '', 'Email me', 'mail', 'primary')}${externalLink(profile.linkedin, 'LinkedIn')}${externalLink(profile.github, 'GitHub')}${externalLink(profile.whatsapp, 'WhatsApp', 'chat')}</div><div class="contact-minor"><span class="contact-email">${escape(profile.email)}</span><button data-action="copy-email">${svg('copy')} Copy email</button></div>`;
}
function renderCard() {
  previewRotation?.dispose(); previewRotation = null;
  const { route, index } = nav.state;
  let html;
  if (route === 'projects') html = renderProject();
  else if (route === 'career') html = renderCompany();
  else html = index === 0 ? renderIntro() : index === 1 || index === 2 ? renderGateway(HUB_STOPS[index]) : index === 3 ? renderSkills() : renderContact();
  const content = $('#card-content');
  const keepSpotlight = route === 'hub' && index === 3 ? content.querySelector('.skills-spotlight') : null;
  if (!keepSpotlight) { badgeMotion?.dispose(); badgeMotion = null; }
  content.innerHTML = html;
  if (keepSpotlight) content.querySelector('.skills-spotlight').replaceWith(keepSpotlight);
  const copy = document.createElement('div'), media = document.createElement('div');
  copy.className = 'dock-copy'; media.className = 'dock-media';
  for (const child of [...content.children]) {
    const target = child.matches('.intro-portrait,.skills-spotlight,.thumbnail-strip,.contact-banner,.card-actions,.gateway-preview,.related-return,.project-gallery-open,button.primary.full-width') ? media : copy;
    (route === 'hub' && index === 0 && child.matches('.card-actions') ? copy : target).append(child);
  }
  const tools = document.createElement('div'); tools.className = 'dock-tools';
  const hasResume = route === 'hub' && Boolean(profile.resume);
  tools.innerHTML = hasResume ? `<a class="resume-icon" href="${escape(assetUrl(profile.resume))}" target="_blank" rel="noopener noreferrer" aria-label="Open résumé" title="Open résumé">${svg('download')}<span>Resume</span></a>` : '';
  content.replaceChildren(media, copy, ...(hasResume ? [tools] : []));
  card.classList.toggle('has-resume', hasResume);
  card.classList.toggle('is-company', route === 'career');
  card.classList.toggle('is-intro', route === 'hub' && index === 0);
  card.classList.toggle('is-skills', route === 'hub' && index === 3);
  card.classList.toggle('is-contact', route === 'hub' && index === 4);
  const gateway = route === 'hub' && (index === 1 || index === 2);
  $('#enter-prompt').hidden = !gateway || moving || hiddenCard; $('#enter-name').textContent = index === 1 ? 'Career' : 'Projects';
  card.classList.toggle('is-gateway', gateway);
  card.classList.remove('is-hidden', 'driving', 'transitioning');
  card.hidden = hiddenCard || moving;
  card.setAttribute('aria-hidden', String(card.hidden));
  $('#show-card').hidden = !hiddenCard || moving;
  if (route === 'hub' && index === 3 && !badgeMotion) badgeMotion = createBadgeMotion(content.querySelector('.tech-float'));
  startPreviewRotation();
}
function startPreviewRotation() {
  const { route, index } = nav.state;
  let items = [], slots = [];
  if (route === 'projects') {
    const project = projects[index];
    slots = [...card.querySelectorAll('.thumbnail')];
    items = project.images.map((src, i) => ({
      src: assetUrl(project.thumbnails?.[i] || src), index: i, action: 'data-image',
      label: `Enlarge image: ${project.name} ${i + 1}`,
      alt: `${project.demo ? 'Illustrative ' : ''}${project.name} preview ${i + 1}`,
    }));
  } else if (route === 'career') {
    slots = [...card.querySelectorAll('.company-project-photo')];
    items = companyPreviewImages(companies[index], projects).map(project => ({
      src: assetUrl(project.cover), index: project.index, action: 'data-company-project', title: project.title,
      label: `Open all images for ${project.title}`, alt: project.title,
    }));
  }
  if (items.length <= 2 || slots.length !== 2) return;
  previewRotation = createPreviewRotation({
    items,
    prepare: pair => Promise.all(pair.map(async item => {
      const image = new Image(); image.decoding = 'async'; image.src = item.src; await image.decode();
    })),
    show: (pair, signal) => fadePreviewPair(slots, pair, signal, reducedMotionQuery.matches),
    canRotate: () => experienceReady && !document.hidden && !card.hidden && !moving && !sectionTransition && !document.querySelector('dialog[open]'),
  });
}
function renderNavigation() {
  const { route, index } = nav.state; const items = route === 'hub' ? hub : route === 'projects' ? projects : companies;
  $('#stops').innerHTML = items.map((item, i) => `<button class="stop ${i === index ? 'active' : ''} ${i < index ? 'visited' : ''}" data-node="${i}" aria-label="Go to ${escape(item.name)}" ${i === index ? 'aria-current="step"' : ''}><span class="stop-dot">${i === index ? '<i></i>' : ''}</span><span class="stop-name">${route === 'hub' ? escape(item.name) : String(i + 1).padStart(2, '0')}</span></button>`).join('');
  $('#journey-count').innerHTML = `${String(index + 1).padStart(2, '0')} <i>/</i> ${String(items.length).padStart(2, '0')}`;
  $('#journey-label').textContent = route === 'hub' ? 'YOUR LITTLE DETOUR' : route === 'projects' ? 'THE PROJECT ROUTE' : 'THE CAREER ROUTE';
  $('#previous').disabled = index === 0;
  $('#next').disabled = index === items.length - 1;
  $('#next span').textContent = route !== 'hub' && index === items.length - 1 ? 'End of route' : 'Next stop';
  $('#back-home').hidden = route === 'hub';
  $('#back-hint').hidden = route === 'hub';
  $('#route-eyebrow').textContent = route === 'hub' ? `HOME / ${hub[index].name.toUpperCase()}` : `HOME / ${route.toUpperCase()}`;
  $('#route-title').innerHTML = route === 'hub' ? 'Take the scenic route<span>.</span>' : route === 'projects' ? 'Made to be explored<span>.</span>' : 'A few chapters so far<span>.</span>';
  $('#route-subtitle').textContent = route === 'hub' ? 'Nine years of Unity. A world of things to explore.' : route === 'projects' ? 'A collection of worlds, systems, and small discoveries.' : 'The roles, teams, and work that shaped the journey.';
  document.body.dataset.route = route;
  document.querySelectorAll('.header-nav > button').forEach(button => {
    const section = button.dataset.section || button.dataset.route;
    const current = section === route;
    if (current) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  renderZoom();
  document.title = `${profile.name} - ${profile.title}`;
}
function applyState(state) {
  const items = state.route === 'hub' ? hub : state.route === 'projects' ? projects : companySceneItems;
  if (sceneRoute !== state.route) { driver.reset(); heldDrive.clear(); bounceNavigator.reset(); sceneRoute = state.route; moving = false; engineSpeed = 0; updateEngineSound(); }
  activeTab = 'overview'; hiddenCard = false;
  world?.setRoute(state.route, items, state.index);
  renderCard(); renderNavigation();
  const label = state.route === 'hub' ? hub[state.index].name : state.route === 'projects' ? projects[state.index].name : companies[state.index].name;
  $('#arrival').textContent = `Now exploring ${label}`;
}
function setState(state) {
  pendingState = state;
  if (sectionTransition) return;
  if (!world || sceneRoute === undefined || sceneRoute === state.route) {
    pendingState = null;
    applyState(state);
    return;
  }
  void transitionSection();
}
async function transitionSection() {
  sectionTransition = true;
  playUi('transition');
  const app = $('#app'), veil = $('#section-transition');
  app.inert = true;
  app.setAttribute('aria-busy', 'true');
  veil.hidden = false;
  world.setPaused(true, 'transition');
  const fade = async (from, to, duration) => {
    const animation = veil.animate([{ opacity: from }, { opacity: to }], {
      duration: reducedMotionQuery.matches ? 0 : duration, easing: 'ease-in-out', fill: 'forwards',
    });
    await animation.finished;
    veil.style.opacity = String(to);
    animation.cancel();
  };
  try {
    await fade(0, 1, 180);
    // Apply the latest destination while the entire viewport is covered.
    const destination = pendingState;
    pendingState = null;
    await world.prepareRoute(destination.route);
    applyState(destination);
    // Keep the veil up through route textures, shader compilation and a real frame.
    await Promise.all([world.renderReady(), readyCardImages()]);
    world.setPaused(false, 'transition'); updateOrientation();
    await fade(1, 0, 240);
  } catch (error) {
    console.warn('The next island could not load:', error);
    toast('This island could not load. Check your connection and try again.');
    nav.home();
  } finally {
    veil.hidden = true;
    veil.style.opacity = '0';
    app.inert = false;
    app.removeAttribute('aria-busy');
    sectionTransition = false;
    world?.setPaused(false, 'transition');
    updateOrientation();
    if (pendingState) setState(pendingState);
  }
}
nav.subscribe(state => {
  try { sessionStorage.setItem(NAVIGATION_SESSION_KEY, JSON.stringify(state)); } catch { /* Navigation remains usable without storage. */ }
  setState(state);
});

let galleryPreload = null;
function openGallery(images, index, title, illustrative = true) {
  if (!images.length) return;
  galleryIllustrative = illustrative;
  $('#gallery .gallery-top small').textContent = illustrative ? 'Illustrative project artwork' : 'Project gallery';
  galleryImages = images.map(item => typeof item === 'string' ? {type:'image',src:assetUrl(item),thumb:assetUrl(item),title} : {...item,src:assetUrl(item.src),thumb:assetUrl(item.thumb || item.poster || item.src),poster:item.poster ? assetUrl(item.poster) : ''});
  galleryIndex = index; $('#gallery-title').textContent = title; updateGallery(); $('#gallery').showModal();
}
function updateGallery() {
  const image = $('#gallery-image'), video = $('#gallery-video'), item = galleryImages[galleryIndex];
  releaseGalleryVideo(video); image.onload = null; image.removeAttribute('src'); galleryPreload = null;
  image.hidden = item.type === 'video'; video.hidden = item.type !== 'video';
  if (item.type === 'video') {
    video.poster = item.poster; video.src = item.src; video.setAttribute('aria-label', item.title);
  } else {
    image.alt = `${galleryIllustrative ? 'Illustrative ' : ''}${item.title || 'Project screenshot'}`;
    image.onload = () => {
      if (!$('#gallery').open) return;
      const next = nextGalleryImage(galleryImages, galleryIndex);
      if (next) { galleryPreload = new Image(); galleryPreload.src = next; }
    };
    image.src = item.src;
  }
  $('#gallery-count').textContent = `${galleryIndex + 1} / ${galleryImages.length}${item.type === 'video' ? ` · ${item.title}` : ''}`;
  $('#gallery-thumbs').innerHTML = galleryImages.map((entry, i) => `<button class="${i === galleryIndex ? 'selected' : ''}" data-gallery-index="${i}" aria-label="Show ${entry.type === 'video' ? 'video' : 'image'} ${i + 1}: ${escape(entry.title || '')}"><img src="${escape(entry.thumb)}" loading="lazy" decoding="async" alt="Preview ${i + 1}"/>${entry.type === 'video' ? svg('play') : ''}</button>`).join('');
}
$('#gallery').addEventListener('close', () => {
  releaseGalleryVideo($('#gallery-video')); $('#gallery-image').onload = null;
  $('#gallery-image').removeAttribute('src'); galleryPreload = null;
});
function renderSound() {
  $('#sound-toggle').innerHTML = svg(soundOn ? 'sound' : 'mute');
  $('#sound-toggle').setAttribute('aria-pressed', String(soundOn));
  $('#sound-toggle').setAttribute('aria-label', soundOn ? 'Disable sound' : 'Enable sound');
  const waiting = soundReady && soundOn && !document.hidden && audioContext?.state !== 'running';
  $('#start-sound').hidden = !waiting;
  $('#sound-toggle').dataset.playback = !soundOn ? 'off' : waiting ? 'waiting' : audioContext?.state === 'running' ? 'running' : 'loading';
  $('#sound-toggle').dataset.context = audioContext?.state || 'closed';
}
function updateEngineSound() {
  const speed = Math.min(1, Math.abs(engineSpeed)), paused = Boolean(world?.paused);
  idleLoop?.setLevel(paused || moving ? 0 : .45);
  drivingLoop?.setLevel(!paused && moving ? .6 + speed * .4 : 0);
  drivingLoop?.setPlaybackRate(.65 + speed * .8);
  const state = $('#sound-toggle').dataset;
  if (idleLoop?.source) state.idle = moving ? 'faded' : 'playing';
  if (drivingLoop?.source) state.driving = moving ? 'playing' : 'faded';
}
async function startSound(feedback = false) {
  if (!soundOn || document.hidden || audioDisposed) return;
  try {
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContext.addEventListener('statechange', renderSound);
      audioMixer = createSoundMixer(audioContext);
      ambientLoop = new AmbientLoop(audioContext, audioMixer.channels.ocean, {
        onState: (state, error) => {
          $('#sound-toggle').dataset.ambience = state;
          if (state === 'unavailable') {
            console.warn('Ocean sound could not load:', error);
            if (soundOn) toast('Ocean sound could not load. Toggle sound to retry.');
          }
        },
      });
      idleLoop = new AmbientLoop(audioContext, audioMixer.channels.engine, {
        urls: ['/audio/engine-idle.m4a', '/audio/engine-idle.wav'], level: moving ? 0 : .45, fadeIn: .2,
        onState: (state, error) => {
          $('#sound-toggle').dataset.idle = state === 'playing' && moving ? 'faded' : state;
          if (state === 'unavailable') {
            console.warn('Idle sound could not load:', error);
            if (soundOn) toast('Engine sound could not load. Toggle sound to retry.');
          }
        },
      });
      drivingLoop = new AmbientLoop(audioContext, audioMixer.channels.engine, {
        urls: ['/audio/engine-driving.m4a', '/audio/engine-driving.wav'], level: 0, fadeIn: .08, fadeTime: .035,
        onState: (state, error) => {
          $('#sound-toggle').dataset.driving = state === 'playing' && !moving ? 'faded' : state;
          if (state === 'unavailable') {
            console.warn('Driving sound could not load:', error);
            if (soundOn) toast('Driving sound could not load. Toggle sound to retry.');
          }
        },
      });
      splashSound = new SoundEffect(audioContext, audioMixer.channels.splash, {
        urls: ['/audio/fish-splash.m4a', '/audio/fish-splash.wav'],
        onState: (state, error) => {
          $('#sound-toggle').dataset.splash = state;
          if (state === 'unavailable') console.warn('Fish splash could not load:', error);
        },
      });
      interfaceSounds = new InterfaceSounds(audioContext, audioMixer.channels.ui, {
        onState: (name, state, error) => {
          $('#sound-toggle').dataset[`ui${name}`] = state;
          if (state === 'unavailable') console.warn(`${name} sound could not load:`, error);
        },
      });
      updateEngineSound();
    }
    const startingContext = audioContext;
    if (audioContext.state !== 'running') {
      // Autoplay may stay suspended until a gesture. Show the fallback immediately,
      // and let any click/key or the Start sound button retry resume without moving.
      const resume = audioContext.resume();
      renderSound();
      await resume;
    }
    if (audioContext !== startingContext) return;
    if (audioDisposed || !soundOn || document.hidden) { audioMixer?.setMuted(true); return; }
    renderSound();
    audioMixer.setMuted(!soundOn);
    if (!soundReady) return;
    if (soundOn) void ambientLoop.start().catch(() => { /* Keep other sound channels available; retry on unmute. */ });
    if (soundOn) void idleLoop.start().catch(() => { /* Ocean and interface audio remain available. */ });
    if (soundOn) void drivingLoop.start().catch(() => { /* Idle and the other channels remain available. */ });
    if (soundOn) void splashSound.prepare().then(() => { if (!audioDisposed) $('#sound-toggle').dataset.splash = 'ready'; }).catch(() => {});
    if (soundOn) void interfaceSounds.prepare();
    if (feedback && soundOn) playUi('click');
  } catch { renderSound(); }
}
function unlockSound(event) {
  if (!soundOn || event.target.closest('[data-action=sound]') || audioContext?.state === 'running') return;
  void startSound();
}
// Try when the island is ready; any gesture also unlocks restricted browsers.
document.addEventListener('pointerdown', unlockSound, { capture: true });
document.addEventListener('click', unlockSound, { capture: true });
document.addEventListener('keydown', unlockSound, { capture: true });
function silenceAudio() {
  audioMixer?.setMuted(true); splashSound?.stop(); interfaceSounds?.stop();
  if (audioContext?.state === 'running') void audioContext.suspend().catch(() => {});
}
function releaseAudio() {
  // Disconnect every source and close the context: mute cannot leave a background loop alive.
  audioMixer?.setMuted(true);
  ambientLoop?.dispose(); idleLoop?.dispose(); drivingLoop?.dispose(); splashSound?.dispose(); interfaceSounds?.dispose(); audioMixer?.dispose();
  const context = audioContext;
  audioContext = audioMixer = ambientLoop = idleLoop = drivingLoop = splashSound = interfaceSounds = null;
  if (context && context.state !== 'closed') void context.close().catch(() => {});
  const state = $('#sound-toggle').dataset;
  state.ambience = state.idle = state.driving = state.splash = 'stopped';
  renderSound();
}
window.addEventListener('storage', event => {
  if (event.key !== SOUND_PREFERENCE_KEY && event.key !== null) return;
  soundOn = readSoundPreference(); renderSound();
  if (soundOn) void startSound(); else releaseAudio();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) silenceAudio(); else if (soundOn && soundReady) void startSound();
});
renderSound();
const bounceNavigator = createBounceNavigator({
  getIndex: () => nav.state.index,
  getLength: () => ({ hub: hub.length, career: companies.length, projects: projects.length })[nav.state.route],
  isBusy: () => driver.busy || moving || sectionTransition || Boolean(world?.paused),
  go: index => driver.selectStop(index),
});
const idleTour = createIdleTour({
  advance: () => bounceNavigator.step(),
  canAdvance: () => soundReady && Boolean(world) && !world.paused && !moving && !sectionTransition && !document.hidden && !document.querySelector('dialog[open]'),
});
const controlsIntro = createControlsIntro({
  hint: $('.control-hint'), buttons: [$('#previous'), $('#next')], panel: $('#controls-intro'),
  isMobile: () => zoomModeForViewport() === 'mobile', reducedMotion: () => reducedMotionQuery.matches,
});
function visitorInput() { idleTour.interact(); controlsIntro.dismiss(); }
const visitorEvents = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'input', 'click'];
visitorEvents.forEach(type => document.addEventListener(type, visitorInput, { capture: true, passive: true }));
window.addEventListener('resize', visitorInput, { passive: true });
document.addEventListener('visibilitychange', () => idleTour.setPaused(document.hidden || Boolean(world?.paused)));
function playUi(name) {
  if (!soundOn || !soundReady || document.hidden || !interfaceSounds?.play(name)) return;
  const state = $('#sound-toggle').dataset;
  state.lastUi = name; state.uiCount = String(Number(state.uiCount || 0) + 1);
}
function relatedProject(index) { returnLocation = { ...nav.state }; nav.open('projects'); nav.go(index); }
function renderSimple() {
  $('#simple-content').innerHTML = `<span class="eyebrow">THE SCENIC ROUTE / SIMPLE VIEW</span><h1>${escape(profile.name)}<span>.</span></h1><p class="simple-lead">${escape(profile.title)} · ${profile.years} years of experience</p><p>${escape(profile.bio)}</p><p class="simple-notice">Browse my projects and career below, or get in touch about full-time roles and freelance work.</p><h2>Selected projects</h2><div class="simple-projects">${projects.map((p, i) => `<button class="simple-project" data-simple-project="${i}"><img src="${escape(assetUrl(p.thumbnails?.[0] || p.images[0]))}" alt="${p.demo ? 'Illustrative ' : ''}${escape(p.name)}" loading="lazy"/><span><strong>${escape(p.name)}</strong><small>${escape(p.category)}${p.demo ? ' · Sample project' : ''}</small></span>${svg('arrow')}</button>`).join('')}</div><h2>Career</h2><div class="simple-career">${companies.map(c => `<article><h3>${escape(c.name)}</h3><small>${escape(c.role)} · ${escape(c.dates)}</small><p>${escape(c.description)}</p></article>`).join('')}</div><h2>Say hello</h2><div class="card-actions">${externalLink(profile.email ? `mailto:${profile.email}` : '', 'Email me', 'mail', 'primary')}${externalLink(profile.linkedin, 'LinkedIn')}${externalLink(profile.github, 'GitHub')}${externalLink(profile.whatsapp, 'WhatsApp', 'chat')}${externalLink(profile.resume, 'Resume', 'download', 'secondary resume-button')}</div>`;
}
function syncScenePause() {
  const blocked = document.hidden || Boolean(document.querySelector('dialog[open]'));
  world?.setPaused(blocked, 'overlay');
  updateEngineSound();
  idleTour.setPaused(blocked);
  if (blocked) heldDrive.clear();
}
const scenePauseObserver = new MutationObserver(syncScenePause);
scenePauseObserver.observe(document.body, {subtree:true,attributes:true,attributeFilter:['open']});
document.addEventListener('visibilitychange', syncScenePause);
function updateOrientation() {
  const nextZoomMode = zoomModeForViewport();
  if (nextZoomMode !== zoomMode) {
    zoomMode = nextZoomMode;
    Object.assign(viewZoom, loadZoom());
    if (world) {
      Object.assign(world.zoomLevels, viewZoom);
      world.setZoom(viewZoom[nav.state.route]);
    }
    renderZoom();
  }
  requestAnimationFrame(renderZoom);
  const mobileDevice = isMobileDevice();
  const portrait = mobileDevice && innerHeight > innerWidth;
  const gate = $('#orientation-gate');
  if (portrait && !gate.open) gate.showModal();
  else if (!portrait && gate.open) gate.close();
  syncScenePause();
  $('#fullscreen-toggle').hidden = !mobileDevice;
  $('#orientation-gate [data-action=landscape]').hidden = !document.documentElement.requestFullscreen && !screen.orientation?.lock;
}
async function openLandscape() {
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    if (screen.orientation?.lock) await screen.orientation.lock('landscape');
  } catch { /* Manual device rotation remains available when the browser declines. */ }
  $('#orientation-note').textContent = 'Turn your device sideways to continue. If it stays upright, enable auto-rotate on your device.';
  updateOrientation();
}
$('#orientation-gate').addEventListener('cancel', event => event.preventDefault());
$('#orientation-gate').addEventListener('close', () => queueMicrotask(updateOrientation));
window.addEventListener('resize', updateOrientation);
for (const query of ['(max-width: 900px)', '(max-height: 550px)']) matchMedia(query).addEventListener('change', () => { if (nav.state.route === 'hub' && nav.state.index === 3) renderCard(); });
document.addEventListener('fullscreenchange', updateOrientation);
const actions = {
  'retry-scene': () => { void startExperience(); },
  'reset-zoom': () => { viewZoom[nav.state.route] = null; world?.setZoom(null); renderZoom(); try { localStorage.setItem(zoomStorageKey(), JSON.stringify(viewZoom)); } catch {} },
  landscape: openLandscape,
  previous: () => driver.step(-1), next: () => driver.step(1),
  enter: () => { if (driver.busy) return; if (nav.state.route === 'hub' && [1, 2].includes(nav.state.index)) nav.enter(); else { hiddenCard = false; renderCard(); } },
  home: () => { returnLocation = null; nav.home(); },
  explore: () => driver.to(1),
  'hide-card': () => { hiddenCard = true; renderCard(); },
  'show-card': () => { hiddenCard = false; renderCard(); },
  resume: () => profile.resume ? window.open(assetUrl(profile.resume), '_blank', 'noopener,noreferrer') : unavailable('Resume'),
  'copy-email': async () => { if (!profile.email) return unavailable('Email address'); try { await navigator.clipboard.writeText(profile.email); toast('Email copied. Say hello!'); } catch { toast(`Email: ${profile.email}`); } },
  'return-company': () => { if (!returnLocation) return; const target = returnLocation; returnLocation = null; nav.open('career'); nav.go(target.index); },
  'close-gallery': () => $('#gallery').close(),
  'gallery-next': () => { galleryIndex = (galleryIndex + 1) % galleryImages.length; updateGallery(); },
  'gallery-previous': () => { galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length; updateGallery(); },
  help: () => $('#help').showModal(), 'close-help': () => $('#help').close(),
  simple: () => { renderSimple(); $('#simple-view').showModal(); }, 'close-simple': () => $('#simple-view').close(),
  'start-sound': () => { void startSound(); },
  sound: () => {
    soundOn = !soundOn; saveSoundPreference(soundOn); renderSound();
    if (soundOn) void startSound(true);
    else releaseAudio();
  },
};
document.addEventListener('click', event => {
  const el = event.target.closest('button, a'); if (!el) return;
  const action = el.dataset.action;
  if (!experienceReady && !['retry-scene', 'simple', 'close-simple', 'landscape', 'sound'].includes(action) && !el.closest('dialog')) return;
  if (['previous','next'].includes(el.id) && event.detail > 0) return;
  const travel = el.dataset.route || el.dataset.node !== undefined || el.dataset.stop !== undefined
    || el.dataset.related !== undefined || el.dataset.project !== undefined || el.dataset.simpleProject !== undefined
    || ['previous', 'next', 'explore', 'enter', 'return-company'].includes(action) || action === 'home' && nav.state.route !== 'hub';
  if (!el.disabled && !travel && !['sound', 'start-sound'].includes(action)) playUi('click');
  if (el.dataset.action) actions[el.dataset.action]?.();
  if (el.dataset.route) { returnLocation = null; nav.open(el.dataset.route); }
  if (el.dataset.stop !== undefined) { if (nav.state.route !== 'hub') nav.home(); driver.to(Number(el.dataset.stop)); }
  if (el.dataset.node !== undefined) driver.selectStop(Number(el.dataset.node));
  if (el.dataset.tab) { activeTab = el.dataset.tab; renderCard(); }
  if (el.dataset.skill !== undefined) { skillTab = Number(el.dataset.skill); skillPage = 0; renderCard(); }
  if (el.dataset.skillPage !== undefined) { skillPage = Number(el.dataset.skillPage); renderCard(); }
  if (el.dataset.skillLevel !== undefined) { skillLevel = el.dataset.skillLevel; skillPage = 0; renderCard(); }
  if (el.dataset.companyProject !== undefined && nav.state.route === 'career') {
    const gallery = companyProjectGalleries(companies[nav.state.index], projects).find(project => project.index === Number(el.dataset.companyProject));
    if (gallery) openGallery(projectMedia(projects[gallery.index]), 0, gallery.title, gallery.illustrative);
  }
  else if (el.dataset.openProjectGallery !== undefined) {
    const project = projects[Number(el.dataset.openProjectGallery)];
    openGallery(projectMedia(project), 0, project.name, project.demo === true);
  }
  else if (el.dataset.related !== undefined || el.dataset.project !== undefined) relatedProject(Number(el.dataset.related ?? el.dataset.project));
  else if (el.dataset.image !== undefined) {
    const state = nav.state;
    const images = state.route === 'projects' ? projects[state.index].images : ['/media/puzzle.jpg', '/media/space.jpg'];
    const title = state.route === 'projects' ? projects[state.index].name : state.index === 3 ? 'A glimpse of the toolkit' : 'A glimpse of the work';
    openGallery(state.route === 'projects' ? projectMedia(projects[state.index]) : images, Number(el.dataset.image), title, state.route !== 'projects' || projects[state.index].demo === true);
  }
  if (el.dataset.galleryIndex !== undefined) { galleryIndex = Number(el.dataset.galleryIndex); updateGallery(); }
  if (el.dataset.unavailable) unavailable(el.dataset.unavailable);
  if (el.dataset.simpleProject !== undefined) {
    const index = Number(el.dataset.simpleProject);
    if (!experienceReady) openGallery(projectMedia(projects[index]), 0, projects[index].name, projects[index].demo === true);
    else { $('#simple-view').close(); nav.open('projects'); nav.go(index); }
  }
});

const heldDrive = createHeldDrive({
  step: direction => driver.step(direction),
  canMove: () => experienceReady && !sectionTransition && !document.hidden && !world?.paused && !document.querySelector('dialog[open]'),
});
for (const [id, direction] of [['previous', -1], ['next', 1]]) {
  const button = document.getElementById(id);
  button.addEventListener('pointerdown', event => {
    if (event.button !== 0 || button.disabled) return;
    event.preventDefault(); button.setPointerCapture(event.pointerId);
    heldDrive.press(`pointer:${event.pointerId}`, direction);
  });
  button.addEventListener('lostpointercapture', event => heldDrive.release(`pointer:${event.pointerId}`));
}
for (const type of ['pointerup', 'pointercancel']) document.addEventListener(type, event => heldDrive.release(`pointer:${event.pointerId}`));
document.addEventListener('keyup', event => heldDrive.release(event.key));
window.addEventListener('blur', () => heldDrive.clear());
document.addEventListener('visibilitychange', () => { if (document.hidden) heldDrive.clear(); });
document.addEventListener('keydown', event => {
  if (!experienceReady && !document.querySelector('dialog[open]')) return;
  if (sectionTransition) { event.preventDefault(); return; }
  if (event.target.matches('input, textarea, select') || event.ctrlKey || event.metaKey || event.altKey) return;
  const dialog = document.querySelector('dialog[open]');
  if (dialog) {
    if (dialog.id === 'orientation-gate' && event.key === 'Escape') { event.preventDefault(); return; }
    if (dialog.id === 'gallery' && ['ArrowRight', 'ArrowLeft'].includes(event.key)) { event.preventDefault(); actions[event.key === 'ArrowRight' ? 'gallery-next' : 'gallery-previous'](); }
    return;
  }
  if (event.key === 'Escape') { event.preventDefault(); nav.state.route === 'hub' ? actions['hide-card']() : actions.home(); return; }
  if (event.repeat) return;
  if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'Enter'].includes(event.key)) {
    const selectedGateway = nav.state.route === 'hub' && [1, 2].includes(nav.state.index)
      && Number(event.target.closest('[data-node]')?.dataset.node) === nav.state.index;
    if (event.key === 'Enter' && event.target.closest('button,a') && !selectedGateway) return;
    if (event.key !== 'Enter') { event.preventDefault(); heldDrive.press(event.key, ['ArrowUp','ArrowRight'].includes(event.key) ? 1 : -1); return; }
    event.preventDefault(); actions[event.key === 'Enter' ? 'enter' : ['ArrowUp', 'ArrowRight'].includes(event.key) ? 'next' : 'previous']();
  }
});
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } }));
let wheelAt = 0;
$('#world').addEventListener('wheel', event => { if (sectionTransition || Math.abs(event.deltaY) < 12 || performance.now() - wheelAt < 650 || document.querySelector('dialog[open]')) return; event.preventDefault(); wheelAt = performance.now(); driver.step(event.deltaY > 0 ? 1 : -1); }, { passive: false });
let touchStart;
$('#world').addEventListener('touchstart', e => { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
$('#world').addEventListener('touchend', e => { if (!touchStart || sectionTransition) { touchStart = null; return; } const dx = e.changedTouches[0].clientX - touchStart.x, dy = e.changedTouches[0].clientY - touchStart.y; if (Math.max(Math.abs(dx), Math.abs(dy)) > 50) driver.step((Math.abs(dx) > Math.abs(dy) ? dx : -dy) < 0 ? 1 : -1); touchStart = null; }, { passive: true });


function showSceneLoading(recovering = false) {
  experienceReady = false; heldDrive.clear(); controlsIntro.dismiss();
  const loading = $('#loading'); loading.hidden = false; loading.classList.remove('loaded');
  loading.querySelector('h1').textContent = recovering ? 'Restoring your island.' : 'Preparing your journey.';
  loading.querySelector('p').textContent = recovering ? 'Your graphics view was interrupted. Restoring it here.' : 'A little coast, a little code, a little curiosity.';
  loading.querySelector('small').textContent = 'Loading the island';
  loading.querySelector('.loading-track').hidden = false;
  loading.querySelector('.loading-actions').hidden = true;
  loading.querySelector('[data-action=retry-scene]').hidden = true;
  clearTimeout(loadingHintTimer);
  loadingHintTimer = setTimeout(() => {
    loading.querySelector('small').textContent = 'Still preparing the 3D view…';
    loading.querySelector('.loading-actions').hidden = false;
    if (recovering) { startingExperience = false; loading.querySelector('[data-action=retry-scene]').hidden = false; }
  }, 15000);
}
async function readyCardImages() {
  // Only currently displayed previews are needed; full galleries/videos stay on demand.
  await Promise.allSettled([...card.querySelectorAll('img'), $('.unity-logo')].filter(Boolean).map(image => image.decode()));
}
async function revealExperience() {
  const scene = world;
  try { await Promise.all([scene.renderReady(), readyCardImages()]); }
  catch (error) { if (scene !== world) return; throw error; }
  if (scene !== world) return;
  clearTimeout(loadingHintTimer);
  world.setPaused(false, 'loading'); world.setPaused(false, 'context');
  updateOrientation(); experienceReady = true;
  $('#loading').classList.add('loaded'); document.body.classList.add('ready');
  soundReady = true; void startSound();
  if (!idleTour.interacted && nav.state.route === 'hub') controlsIntro.show();
  idleTour.start();
}
function showSceneError(error) {
  console.error('The 3D view could not start:', error);
  clearTimeout(loadingHintTimer); experienceReady = false;
  const loading = $('#loading'); loading.hidden = false; loading.classList.remove('loaded');
  loading.querySelector('h1').textContent = 'The island needs another try.';
  loading.querySelector('p').textContent = 'The 3D view could not finish loading. Retry here, or browse the simple view.';
  loading.querySelector('small').textContent = navigator.onLine ? 'Your place is saved.' : 'You appear to be offline. Reconnect to continue.';
  loading.querySelector('.loading-track').hidden = true;
  loading.querySelector('.loading-actions').hidden = false;
  loading.querySelector('[data-action=retry-scene]').hidden = false;
}
async function startExperience() {
 if (startingExperience) return;
 const attempt = ++startupAttempt;
 startingExperience = true; showSceneLoading();
 world?.dispose(); world = null; sceneRoute = undefined;
 try {
  // Paint the lightweight loading UI before downloading/parsing the 3D engine.
  const { CoastalScene } = await import('./scene.js');
  if (attempt !== startupAttempt) return;
  world = new CoastalScene($('#world'), {
    zoomLevels: viewZoom,
    reducedMotion: reducedMotionQuery.matches,
    onStop: index => { if (!sectionTransition) driver.selectStop(index); },
    onCar: () => bounceNavigator.step(),
    onApproach: () => driver.approach(),
    onWaypoint: index => driver.passed(index),
    onSpeed: value => { engineSpeed = value; updateEngineSound(); },
    onSplash: ({ pan }) => {
      if (!soundReady || !soundOn || document.hidden) return;
      // Sound once every five visible landings; preserve the approved splash volume.
      if (splashLandingCount++ % 5 !== 0) return;
      if (splashSound?.play({ level: .65, pan })) {
        const state = $('#sound-toggle').dataset; state.splashCount = String(Number(state.splashCount || 0) + 1);
      }
    },
    onMove: value => {
      const wasMoving = moving;
      moving = value;
      if (!value) engineSpeed = 0;
      updateEngineSound();
      if (wasMoving && !value && !sectionTransition) playUi('arrival');
      if (!value) driver.arrive(); renderCard();
      if (!value) heldDrive.arrive();
    },
    onContextChange: state => {
      if (state === 'lost') { showSceneLoading(true); syncScenePause(); }
      else void revealExperience().catch(showSceneError);
    },
  });
  // Establish Home framing under the loading veil before restoring a long route.
  if (nav.state.route !== 'hub') world.setRoute('hub', hub, 0, true);
  await world.prepareRoute(nav.state.route);
  if (attempt !== startupAttempt) return;
  setState(nav.state); updateOrientation();
  await revealExperience();
 } catch (error) {
  // A restored context completes the same section automatically; don't replace it with Home.
  if (attempt === startupAttempt && !world?.contextUnavailable) showSceneError(error);
 } finally { if (attempt === startupAttempt) startingExperience = false; }
}
void startExperience();
reducedMotionQuery.addEventListener('change', event => { if (world) world.reducedMotion = event.matches; });
window.addEventListener('online', () => { if (!experienceReady && !world?.contextUnavailable) void startExperience(); });
function disposeAudio() {
  audioDisposed = true; releaseAudio();
}
function disposeVisitorTour() {
  startupAttempt++;
  clearTimeout(loadingHintTimer);
  scenePauseObserver.disconnect();
  document.removeEventListener('visibilitychange', syncScenePause);
  heldDrive.clear();
  badgeMotion?.dispose(); badgeMotion = null;
  previewRotation?.dispose(); previewRotation = null;
  idleTour.dispose(); controlsIntro.dispose();
  visitorEvents.forEach(type => document.removeEventListener(type, visitorInput, true));
  window.removeEventListener('resize', visitorInput);
}
window.addEventListener('pagehide', event => {
  if (event.persisted) { world?.setPaused(true, 'page-cache'); silenceAudio(); return; }
  disposeVisitorTour(); world?.dispose(); disposeAudio();
});
window.addEventListener('pageshow', event => {
  if (!event.persisted) return;
  world?.setPaused(false, 'page-cache'); updateOrientation();
  if (soundOn && soundReady) void startSound();
});
if (import.meta.hot) import.meta.hot.dispose(() => { disposeVisitorTour(); world?.dispose(); disposeAudio(); });
