import './style.css';
import { CoastalScene } from './scene.js';
import { createNavigation, HUB_STOPS } from './navigation.js';
import { createDriveController } from './drive-controller.js';
import { profile, projects, companies, skillGroups, hub } from './content.js';

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
  sound: '<path d="m11 4-5 5H2v6h4l5 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  fullscreen: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  mute: '<path d="m11 4-5 5H2v6h4l5 5V4Zm5 5 6 6m0-6-6 6"/>',
};
const svg = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.arrow}</svg>`;
const escape = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const demo = '<span class="sample-label"><i></i>Illustrative content</span>';
const nav = createNavigation({ hub: hub.length, projects: projects.length, career: companies.length });
const driver = createDriveController({ getIndex: () => nav.state.index, getLength: () => ({ hub: hub.length, projects: projects.length, career: companies.length })[nav.state.route], go: index => nav.go(index) });
let sceneRoute;
const companySceneItems = companies.map(c => ({ ...c, icon: 'building' }));
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let world, activeTab = 'overview', skillTab = 0, hiddenCard = false, moving = false, soundOn = false, audioContext;
let galleryImages = [], galleryIndex = 0, returnLocation = null, toastTimeout;
let sectionTransition = false, pendingState = null;

document.querySelector('#app').innerHTML = `
  <canvas id="world" aria-label="Interactive low-poly coastal portfolio. Use the navigation buttons or arrow keys to move the orange car."></canvas>
  <div class="ocean-vignette" aria-hidden="true"></div>
  <div id="section-transition" aria-hidden="true" hidden></div>
  <div id="loading" class="loading-screen"><div class="loading-card"><span class="eyebrow">A SMALL WORLD. A BIG HELLO.</span><div class="loading-car" aria-hidden="true">▰</div><h1>Preparing your journey<span>.</span></h1><p>A little coast, a little code, a little curiosity.</p><div class="loading-track"><span></span></div><small>Loading the island</small></div></div>
  <header class="site-header">
    <button class="brand" data-action="home" aria-label="Return to the main island"><img class="unity-logo" src="/media/unity-logo.png" alt="Unity"/><span>UNITY DEVELOPER<small><strong>9 YEARS</strong> OF EXPERIENCE</small></span></button>
    <nav class="header-nav" aria-label="Quick navigation"><button data-route="projects">Projects</button><button data-route="career">Career</button><button data-action="resume">Resume ${svg('external')}</button><button class="contact-link" data-stop="4">Say hello ${svg('arrow')}</button></nav>
  </header>
  <main id="experience" aria-label="Interactive portfolio">
    <div class="route-heading"><button class="back-link" data-action="home" id="back-home" hidden>${svg('back')} Back to the island</button><span class="eyebrow" id="route-eyebrow">WELCOME TO MY LITTLE CORNER</span><h1 id="route-title">Take the scenic route<span>.</span></h1><p id="route-subtitle">Nine years of Unity. A world of things to explore.</p></div>
    <svg id="card-tether" aria-hidden="true"><path id="tether-path"/><circle id="tether-dot" r="4"/></svg>
    <aside id="info-card" class="info-card" aria-label="Selected stop"><button class="card-close icon-button" data-action="hide-card" aria-label="Minimize information card">${svg('close')}</button><div id="card-content"></div></aside>
    <button id="show-card" class="show-card" data-action="show-card" hidden>${svg('photo')} Show stop details</button>
    <div id="arrival" class="arrival" aria-live="polite"></div>
    <div id="enter-prompt" class="enter-prompt" hidden><button data-action="enter"><kbd>↵</kbd><span>Enter <strong id="enter-name">Projects</strong></span>${svg('arrow')}</button></div>
  </main>
  <footer class="journey-bar">
    <div class="journey-meta"><span class="eyebrow" id="journey-label">YOUR LITTLE DETOUR</span><span id="journey-count">01 <i>/</i> 05</span></div>
    <nav id="stops" class="stops" aria-label="Choose a destination"></nav>
    <div class="drive-controls"><button id="previous" class="drive-button" data-action="previous" aria-label="Previous stop">${svg('back')}<span>Previous</span></button><button id="next" class="drive-button" data-action="next" aria-label="Next stop"><span>Next stop</span>${svg('arrow')}</button></div>
  </footer>
  <div class="bottom-notes"><span class="control-hint"><kbd>↑</kbd><kbd>↓</kbd> to drive <span class="divider">·</span> <kbd>Enter</kbd> to explore</span><span class="mobile-hint">Tap a stop. Take your time.</span><div class="utility-controls"><button data-action="simple">Simple view</button><span>·</span><button id="fullscreen-toggle" data-action="landscape" aria-label="Open fullscreen landscape view" hidden>${svg('fullscreen')}</button><button id="sound-toggle" data-action="sound" aria-label="Enable sound" aria-pressed="false">${svg('mute')}</button><button data-action="help" class="help-button" aria-label="Show controls">?</button></div></div>
  <div id="toast" class="toast" role="status"></div>
  <dialog id="orientation-gate" closedby="none" class="orientation-gate" aria-labelledby="orientation-title" aria-describedby="orientation-note"><div class="orientation-card"><div class="rotate-device" aria-hidden="true"><span></span><b>↻</b></div><span class="eyebrow">A LITTLE MORE ROOM TO EXPLORE</span><h1 id="orientation-title">Let’s go landscape<span>.</span></h1><p id="orientation-note">Turn your device sideways to drive along the coast.</p><button class="primary" data-action="landscape">${svg('fullscreen')} Open landscape view</button><small>The journey starts when your screen is horizontal.</small></div></dialog>
  <dialog id="gallery" class="gallery-dialog" aria-label="Project image viewer"><button class="gallery-close icon-button" data-action="close-gallery" aria-label="Close image viewer">${svg('close')}</button><div class="gallery-top"><span id="gallery-title">Project screenshots</span><small>Illustrative project artwork</small></div><div class="gallery-image-wrap"><button data-action="gallery-previous" class="gallery-arrow" aria-label="Previous image">${svg('back')}</button><img id="gallery-image" alt=""/><button data-action="gallery-next" class="gallery-arrow" aria-label="Next image">${svg('arrow')}</button></div><div id="gallery-thumbs" class="gallery-thumbs"></div><span id="gallery-count"></span></dialog>
  <dialog id="help" class="help-dialog"><button class="dialog-close icon-button" data-action="close-help" aria-label="Close controls">${svg('close')}</button><span class="eyebrow">A LITTLE FIELD GUIDE</span><h2>Enjoy the drive.</h2><p>Explore the main island, then enter Career or Projects for a longer journey.</p><ul><li><span><kbd>↑</kbd> / <kbd>→</kbd></span> Next stop</li><li><span><kbd>↓</kbd> / <kbd>←</kbd></span> Previous stop</li><li><span><kbd>Enter</kbd></span> Open a section or card</li><li><span><kbd>Esc</kbd></span> Close a viewer / return home</li><li><span>Tap / click</span> Jump to a destination</li></ul><p class="help-note">One press drives to a stop. You can reverse once during a trip; controls unlock on arrival. Press again in the final quarter-second to continue through the next stop. On touch screens, use the Previous and Next buttons. Sound starts off. Your system’s reduced-motion setting is respected.</p><button class="primary" data-action="close-help">Got it ${svg('arrow')}</button></dialog>
  <dialog id="simple-view" class="simple-dialog" aria-label="Simple portfolio view"><button class="dialog-close icon-button" data-action="close-simple" aria-label="Close simple view">${svg('close')}</button><div id="simple-content"></div></dialog>
`;

const $ = selector => document.querySelector(selector);
const card = $('#info-card');
const unavailable = (kind = 'Link') => toast(`${kind} will be available when your real content is added.`);
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => $('#toast').classList.remove('visible'), 3400); }
function externalLink(url, label, icon = 'external', cls = 'secondary') {
  if (!url) return `<button class="${cls} unavailable" data-unavailable="${escape(label)}" aria-disabled="true" title="This link has not been added yet">${svg(icon)}${escape(label)}</button>`;
  return `<a class="${cls}" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${svg(icon)}${escape(label)}</a>`;
}
function thumbnails(images, title, indices = null) {
  return `<div class="thumbnail-strip">${images.map((src, i) => `<button class="thumbnail" data-image="${i}" ${indices ? `data-project="${indices[i]}"` : ''} aria-label="${indices ? 'View related project' : 'Enlarge image'}: ${escape(title)} ${i + 1}"><img src="${escape(src)}" alt="Illustrative ${escape(title)} preview ${i + 1}" loading="lazy" decoding="async"/><span>${svg(indices ? 'arrow' : 'expand')}</span></button>`).join('')}</div>`;
}
function renderIntro() {
  return `<div class="card-person"><span class="avatar">${profile.portrait ? `<img src="${escape(profile.portrait)}" alt="${escape(profile.name)}"/>` : svg('person')}</span><div><span class="eyebrow">HELLO, WORLD</span><h2>Hi, I’m ${escape(profile.name)}<span>.</span></h2></div></div><p class="card-subtitle">${escape(profile.title)} · ${profile.years} years of experience</p>${thumbnails(['/media/puzzle.jpg', '/media/space.jpg'], 'selected work')}<p class="card-description">${escape(profile.bio)}</p><div class="card-actions">${externalLink(profile.resume, 'Resume', 'download')}<button class="primary" data-action="explore">Let’s explore ${svg('arrow')}</button></div>${demo}`;
}
function renderGateway(id) {
  const isProjects = id === 'projects';
  return `<span class="eyebrow">${isProjects ? 'MADE WITH CURIOSITY' : 'ONE CHAPTER AT A TIME'}</span><h2>${isProjects ? 'A few things I’ve built' : 'The journey so far'}<span>.</span></h2><p class="card-description">${isProjects ? 'Every stop is a project. Drive a little further to discover the details.' : 'Every company is a stop. Explore the roles, contributions, and work along the way.'}</p><div class="gateway-preview"><span>${String(isProjects ? projects.length : companies.length).padStart(2, '0')}</span><div>${isProjects ? 'project stops' : 'career chapters'}<small>Sample collection · ready for your content</small></div></div><button class="primary full-width" data-action="enter"><kbd>↵</kbd> Enter ${isProjects ? 'Projects' : 'Career'} ${svg('arrow')}</button>${demo}`;
}
function renderProject() {
  const p = projects[nav.state.index];
  const tabs = ['overview', 'my role', 'media'];
  let body;
  if (activeTab === 'my role') body = `<div class="detail-block"><strong>Contribution</strong><p>${escape(p.role)}</p><strong>Outcome</strong><p>${escape(p.outcome)}</p></div>`;
  else if (activeTab === 'media') body = `<p class="card-description">Tap either image for a closer look. Replace these illustrations with your project screenshots and videos.</p>`;
  else body = `<p class="card-description">${escape(p.summary)}</p>`;
  return `<span class="eyebrow">${String(p.index + 1).padStart(2, '0')} / ${escape(p.category)}</span><h2>${escape(p.name)}<span>.</span></h2>${thumbnails(p.images, p.name)}<div class="card-tabs" role="tablist" aria-label="Project information">${tabs.map(t => `<button role="tab" aria-selected="${t === activeTab}" data-tab="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div>${body}<div class="tags">${p.technologies.map(t => `<span>${escape(t)}</span>`).join('')}</div><div class="card-actions project-links">${externalLink(p.links.watch, 'Watch', 'play')}${externalLink(p.links.play, 'Play', 'external', 'primary')}${externalLink(p.links.source, 'Project link')}</div>${demo}${returnLocation ? `<button class="related-return" data-action="return-company">${svg('back')} Back to company</button>` : ''}`;
}
function renderCompany() {
  const c = companies[nav.state.index];
  const ps = c.projectIndices.map(i => projects[i]);
  const tabs = ['overview', 'impact', 'work'];
  const description = activeTab === 'impact' ? c.outcome : activeTab === 'work' ? 'Choose a project image to explore the work from this chapter.' : c.description;
  return `<div class="company-heading"><span class="company-logo">${String(nav.state.index + 1).padStart(2, '0')}</span><div><span class="eyebrow">A CHAPTER IN THE JOURNEY</span><h2>${escape(c.name)}</h2><p>${escape(c.role)} · ${escape(c.dates)}</p></div></div>${thumbnails(ps.map(p => p.images[0]), c.name, c.projectIndices)}<div class="card-tabs" role="tablist" aria-label="Company information">${tabs.map(t => `<button role="tab" aria-selected="${t === activeTab}" data-tab="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div><p class="card-description">${escape(description)}</p><button class="primary full-width" data-related="${c.projectIndices[0]}">Explore related work ${svg('arrow')}</button>${demo}`;
}
function renderSkills() {
  const s = skillGroups[skillTab];
  return `<span class="eyebrow">TOOLS OF THE TRADE</span><h2>A curious toolkit<span>.</span></h2><div class="card-tabs" role="tablist" aria-label="Skill categories">${skillGroups.map((s, i) => `<button role="tab" aria-selected="${i === skillTab}" data-skill="${i}">${s.name}</button>`).join('')}</div>${thumbnails(s.images.map(i => `/media/${i}.jpg`), s.title)}<h3>${escape(s.title)}</h3><p class="card-description">${escape(s.summary)}</p><button class="primary full-width" data-route="projects">See it in the work ${svg('arrow')}</button>${demo}`;
}
function renderContact() {
  return `<div class="contact-banner"><img src="/media/puzzle.jpg" alt="Illustrative little island" loading="lazy"/><span>${svg('mail')}</span></div><span class="eyebrow">THE NEXT CHAPTER</span><h2>Let’s build something<span>.</span></h2><p class="card-description">A team to join. An idea to explore.<br/>A game worth making together.</p><span class="availability"><i></i>Roles & freelance conversations</span><div class="card-actions">${externalLink(profile.email ? `mailto:${profile.email}` : '', 'Email me', 'mail', 'primary')}${externalLink(profile.linkedin, 'LinkedIn')}</div><div class="contact-minor"><button data-action="copy-email">${svg('copy')} Copy email</button><button data-action="resume">${svg('download')} Resume</button></div>${demo}`;
}
function renderCard() {
  const { route, index } = nav.state;
  let html;
  if (route === 'projects') html = renderProject();
  else if (route === 'career') html = renderCompany();
  else html = index === 0 ? renderIntro() : index === 1 || index === 2 ? renderGateway(HUB_STOPS[index]) : index === 3 ? renderSkills() : renderContact();
  const content = $('#card-content');
  content.innerHTML = html;
  const copy = document.createElement('div'), media = document.createElement('div');
  copy.className = 'dock-copy'; media.className = 'dock-media';
  for (const child of [...content.children]) {
    const target = child.matches('.thumbnail-strip,.contact-banner,.card-actions,.gateway-preview,.related-return,button.primary.full-width') ? media : copy;
    target.append(child);
  }
  content.replaceChildren(copy, media);
  const gateway = route === 'hub' && (index === 1 || index === 2);
  $('#enter-prompt').hidden = !gateway || moving; $('#enter-name').textContent = index === 1 ? 'Career' : 'Projects';
  card.classList.toggle('is-gateway', gateway);
  card.classList.remove('is-hidden', 'driving', 'transitioning');
  card.hidden = hiddenCard || moving;
  card.setAttribute('aria-hidden', String(card.hidden));
  $('#show-card').hidden = !hiddenCard || moving;
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
  $('#route-eyebrow').textContent = route === 'hub' ? `HOME / ${hub[index].name.toUpperCase()}` : `HOME / ${route.toUpperCase()}`;
  $('#route-title').innerHTML = route === 'hub' ? 'Take the scenic route<span>.</span>' : route === 'projects' ? 'Made to be explored<span>.</span>' : 'A few chapters so far<span>.</span>';
  $('#route-subtitle').textContent = route === 'hub' ? 'Nine years of Unity. A world of things to explore.' : route === 'projects' ? 'A collection of worlds, systems, and small discoveries.' : 'The roles, teams, and work that shaped the journey.';
  document.body.dataset.route = route;
  document.title = `${route === 'hub' ? 'The Scenic Route' : `${route === 'projects' ? projects[index].name : companies[index].name} — ${route === 'projects' ? 'Projects' : 'Career'}`} · Unity Developer`;
}
function applyState(state) {
  const items = state.route === 'hub' ? hub : state.route === 'projects' ? projects : companySceneItems;
  if (sceneRoute !== state.route) { driver.reset(); sceneRoute = state.route; }
  activeTab = 'overview'; hiddenCard = false;
  world?.setRoute(state.route, items, state.index);
  renderCard(); renderNavigation();
  const label = state.route === 'hub' ? hub[state.index].name : state.route === 'projects' ? projects[state.index].name : companies[state.index].name;
  $('#arrival').textContent = `Now exploring ${label}`;
  if (soundOn && !moving) chime();
}
function setState(state) {
  pendingState = state;
  if (sectionTransition) return;
  if (!world || sceneRoute === undefined || sceneRoute === state.route || reducedMotionQuery.matches) {
    pendingState = null;
    applyState(state);
    return;
  }
  void transitionSection();
}
async function transitionSection() {
  sectionTransition = true;
  const app = $('#app'), veil = $('#section-transition');
  app.inert = true;
  app.setAttribute('aria-busy', 'true');
  veil.hidden = false;
  world.setPaused(true);
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
    applyState(destination);
    updateOrientation();
    // Wait for the new camera to render and card images to decode before revealing it.
    const images = [...card.querySelectorAll('img')];
    let imageTimeout;
    await Promise.race([
      Promise.allSettled(images.map(image => image.decode())),
      new Promise(resolve => { imageTimeout = setTimeout(resolve, 500); }),
    ]);
    clearTimeout(imageTimeout);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await fade(1, 0, 240);
  } finally {
    veil.hidden = true;
    veil.style.opacity = '0';
    app.inert = false;
    app.removeAttribute('aria-busy');
    sectionTransition = false;
    updateOrientation();
    if (pendingState) setState(pendingState);
  }
}
nav.subscribe(setState);

function openGallery(images, index, title) {
  galleryImages = images; galleryIndex = index; $('#gallery-title').textContent = title; updateGallery(); $('#gallery').showModal();
}
function updateGallery() {
  $('#gallery-image').src = galleryImages[galleryIndex]; $('#gallery-image').alt = `Illustrative project image ${galleryIndex + 1}`;
  $('#gallery-count').textContent = `${galleryIndex + 1} / ${galleryImages.length}`;
  $('#gallery-thumbs').innerHTML = galleryImages.map((src, i) => `<button class="${i === galleryIndex ? 'selected' : ''}" data-gallery-index="${i}" aria-label="Show image ${i + 1}"><img src="${src}" alt="Preview ${i + 1}"/></button>`).join('');
}
function chime() {
  try { audioContext ??= new (window.AudioContext || window.webkitAudioContext)(); const o = audioContext.createOscillator(), g = audioContext.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(420 + nav.state.index * 55, audioContext.currentTime); g.gain.setValueAtTime(0.028, audioContext.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3); o.connect(g); g.connect(audioContext.destination); o.start(); o.stop(audioContext.currentTime + 0.3); } catch { soundOn = false; }
}
function relatedProject(index) { returnLocation = { ...nav.state }; nav.open('projects'); nav.go(index); }
function renderSimple() {
  $('#simple-content').innerHTML = `<span class="eyebrow">THE SCENIC ROUTE / SIMPLE VIEW</span><h1>${escape(profile.name)}<span>.</span></h1><p class="simple-lead">${escape(profile.title)} · ${profile.years} years of experience</p><p>${escape(profile.bio)}</p><p class="simple-notice">This is a working portfolio template. Project artwork, company records, and unfilled personal details are illustrative placeholders.</p><h2>Selected projects</h2><div class="simple-projects">${projects.map((p, i) => `<button class="simple-project" data-simple-project="${i}"><img src="${p.images[0]}" alt="Illustrative ${escape(p.name)}" loading="lazy"/><span><strong>${escape(p.name)}</strong><small>${escape(p.category)} · Sample project</small></span>${svg('arrow')}</button>`).join('')}</div><h2>Career</h2><div class="simple-career">${companies.map(c => `<article><h3>${escape(c.name)}</h3><small>${escape(c.role)} · ${escape(c.dates)}</small><p>${escape(c.description)}</p></article>`).join('')}</div><h2>Say hello</h2><div class="card-actions">${externalLink(profile.email ? `mailto:${profile.email}` : '', 'Email me', 'mail', 'primary')}${externalLink(profile.linkedin, 'LinkedIn')}${externalLink(profile.resume, 'Resume', 'download')}</div>`;
}
function updateOrientation() {
  const mobileDevice = Math.min(innerWidth, innerHeight) <= 700 || (matchMedia('(pointer: coarse)').matches && Math.min(innerWidth, innerHeight) <= 1024);
  const portrait = mobileDevice && innerHeight > innerWidth;
  const gate = $('#orientation-gate');
  if (portrait && !gate.open) gate.showModal();
  else if (!portrait && gate.open) gate.close();
  world?.setPaused(portrait);
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
document.addEventListener('fullscreenchange', updateOrientation);
const actions = {
  landscape: openLandscape,
  previous: () => driver.step(-1), next: () => driver.step(1),
  enter: () => { if (driver.busy) return; if (nav.state.route === 'hub' && [1, 2].includes(nav.state.index)) nav.enter(); else { hiddenCard = false; renderCard(); } },
  home: () => { returnLocation = null; nav.home(); },
  explore: () => driver.to(1),
  'hide-card': () => { hiddenCard = true; renderCard(); },
  'show-card': () => { hiddenCard = false; renderCard(); },
  resume: () => profile.resume ? window.open(profile.resume, '_blank', 'noopener,noreferrer') : unavailable('Resume'),
  'copy-email': async () => { if (!profile.email) return unavailable('Email address'); try { await navigator.clipboard.writeText(profile.email); toast('Email copied. Say hello!'); } catch { toast(`Email: ${profile.email}`); } },
  'return-company': () => { if (!returnLocation) return; const target = returnLocation; returnLocation = null; nav.open('career'); nav.go(target.index); },
  'close-gallery': () => $('#gallery').close(),
  'gallery-next': () => { galleryIndex = (galleryIndex + 1) % galleryImages.length; updateGallery(); },
  'gallery-previous': () => { galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length; updateGallery(); },
  help: () => $('#help').showModal(), 'close-help': () => $('#help').close(),
  simple: () => { renderSimple(); $('#simple-view').showModal(); }, 'close-simple': () => $('#simple-view').close(),
  sound: () => { soundOn = !soundOn; $('#sound-toggle').innerHTML = svg(soundOn ? 'sound' : 'mute'); $('#sound-toggle').setAttribute('aria-pressed', String(soundOn)); $('#sound-toggle').setAttribute('aria-label', soundOn ? 'Disable sound' : 'Enable sound'); if (soundOn) chime(); },
};
document.addEventListener('click', event => {
  const el = event.target.closest('button, a'); if (!el) return;
  if (el.dataset.action) actions[el.dataset.action]?.();
  if (el.dataset.route) { returnLocation = null; nav.open(el.dataset.route); }
  if (el.dataset.stop !== undefined) { if (nav.state.route !== 'hub') nav.home(); driver.to(Number(el.dataset.stop)); }
  if (el.dataset.node !== undefined) driver.to(Number(el.dataset.node));
  if (el.dataset.tab) { activeTab = el.dataset.tab; renderCard(); }
  if (el.dataset.skill !== undefined) { skillTab = Number(el.dataset.skill); renderCard(); }
  if (el.dataset.related !== undefined || el.dataset.project !== undefined) relatedProject(Number(el.dataset.related ?? el.dataset.project));
  else if (el.dataset.image !== undefined) {
    const state = nav.state;
    const images = state.route === 'projects' ? projects[state.index].images : state.route === 'hub' && state.index === 3 ? skillGroups[skillTab].images.map(i => `/media/${i}.jpg`) : ['/media/puzzle.jpg', '/media/space.jpg'];
    const title = state.route === 'projects' ? projects[state.index].name : state.index === 3 ? 'A glimpse of the toolkit' : 'A glimpse of the work';
    openGallery(images, Number(el.dataset.image), title);
  }
  if (el.dataset.galleryIndex !== undefined) { galleryIndex = Number(el.dataset.galleryIndex); updateGallery(); }
  if (el.dataset.unavailable) unavailable(el.dataset.unavailable);
  if (el.dataset.simpleProject !== undefined) { $('#simple-view').close(); nav.open('projects'); nav.go(Number(el.dataset.simpleProject)); }
});

document.addEventListener('keydown', event => {
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
    if (event.key === 'Enter' && event.target.closest('button,a')) return;
    event.preventDefault(); actions[event.key === 'Enter' ? 'enter' : ['ArrowUp', 'ArrowRight'].includes(event.key) ? 'next' : 'previous']();
  }
});
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } }));
let wheelAt = 0;
$('#world').addEventListener('wheel', event => { if (sectionTransition || Math.abs(event.deltaY) < 12 || performance.now() - wheelAt < 650 || document.querySelector('dialog[open]')) return; event.preventDefault(); wheelAt = performance.now(); driver.step(event.deltaY > 0 ? 1 : -1); }, { passive: false });
let touchStart;
$('#world').addEventListener('touchstart', e => { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
$('#world').addEventListener('touchend', e => { if (!touchStart || sectionTransition) { touchStart = null; return; } const dx = e.changedTouches[0].clientX - touchStart.x, dy = e.changedTouches[0].clientY - touchStart.y; if (Math.max(Math.abs(dx), Math.abs(dy)) > 50) driver.step((Math.abs(dx) > Math.abs(dy) ? dx : -dy) < 0 ? 1 : -1); touchStart = null; }, { passive: true });


try {
  world = new CoastalScene($('#world'), {
    reducedMotion: reducedMotionQuery.matches,
    onStop: index => driver.to(index),
    onApproach: () => driver.approach(),
    onWaypoint: index => driver.passed(index),
    onMove: value => { moving = value; if (!value) driver.arrive(); renderCard(); },
    onReady: () => setTimeout(() => { $('#loading').classList.add('loaded'); document.body.classList.add('ready'); }, reducedMotionQuery.matches ? 50 : 850),
    onError: () => { $('#loading').hidden = true; document.body.classList.add('no-webgl'); renderSimple(); $('#simple-view').showModal(); },
  });
  setState(nav.state); updateOrientation();
  reducedMotionQuery.addEventListener('change', event => { world.reducedMotion = event.matches; });
} catch (error) {
  console.error('The 3D view could not start:', error);
  $('#loading').hidden = true; renderNavigation(); renderCard(); renderSimple(); if (!$('#simple-view').open) $('#simple-view').showModal();
}
window.addEventListener('pagehide', () => { world?.dispose(); audioContext?.close(); });
