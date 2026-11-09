import * as THREE from 'three';
import { assetUrl } from './asset-url.js';
import { logoContentBounds } from './logo-layout.js';

// Selected option C: enlarged logo-only badge; the route board names the company.
export function createRooftopSign(builder, building, company, makeCanvas = () => document.createElement('canvas'), makeImage = () => new Image()) {
  const roofY = new THREE.Box3().setFromObject(building).max.y;
  const sign = new THREE.Group(); sign.name = `Round rooftop sign: ${company.name}`;
  sign.position.set(0, roofY + .025, 0); building.add(sign);
  sign.scale.setScalar(1.25);
  const dark = 0x194b55, cream = 0xfff3d5;
  builder.box(sign, [.16, .55, .16], [0, .28, 0], dark, .02);
  const ring = builder.mesh(new THREE.CylinderGeometry(.78, .78, .2, 32), dark, sign);
  ring.rotation.x = Math.PI / 2; ring.position.set(0, 1.12, 0);
  const inset = builder.mesh(new THREE.CylinderGeometry(.67, .67, .035, 32), cream, sign);
  inset.rotation.x = Math.PI / 2; inset.position.set(0, 1.12, .12);

  const badge = makeCanvas(); badge.width = badge.height = 512;
  const ctx = badge.getContext('2d');
  ctx.fillStyle = '#194b55'; ctx.font = '700 165px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const initials = company.name.split(/[\s-]+/).slice(0, 2).map(word => Array.from(word)[0]).join('').toUpperCase();
  ctx.fillText(initials, 256, 256);
  const badgeTexture = new THREE.CanvasTexture(badge); badgeTexture.colorSpace = THREE.SRGBColorSpace;
  const badgeFace = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 1.34), new THREE.MeshBasicMaterial({ map: badgeTexture, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  badgeFace.position.set(0, 1.12, .15); sign.add(badgeFace); builder.routeTextures?.push(badgeTexture);

  badgeTexture.anisotropy = builder.renderer?.capabilities.getMaxAnisotropy() ?? 4;
  sign.userData.logoPlaceholder = true; sign.userData.company = company.name;
  if (company.logo) {
    const image = makeImage(); let active = true;
    let complete;
    badgeTexture.userData.ready = new Promise(resolve => { complete = resolve; });
    const release = () => { active = false; complete(); image.onload = image.onerror = null; badgeTexture.removeEventListener('dispose', release); };
    badgeTexture.addEventListener('dispose', release);
    image.onload = () => {
      if (!active || !image.naturalWidth || !image.naturalHeight) { complete(); return; }
      ctx.clearRect(0, 0, 512, 512); ctx.save(); ctx.beginPath(); ctx.arc(256, 256, 252, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 512, 512);
      const source = makeCanvas(); source.width = image.naturalWidth; source.height = image.naturalHeight;
      const sourceCtx = source.getContext('2d'); sourceCtx.drawImage(image, 0, 0);
      const crop = sourceCtx.getImageData
        ? logoContentBounds(sourceCtx.getImageData(0, 0, source.width, source.height))
        : { x: 0, y: 0, width: source.width, height: source.height, radius: Math.max(source.width, source.height) / 2 };
      const scale = 249 / crop.radius; // Only a 3px safety margin inside the circular face.
      const width = crop.width * scale, height = crop.height * scale;
      ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, (512 - width) / 2, (512 - height) / 2, width, height); ctx.restore();
      badgeTexture.needsUpdate = true; sign.userData.logoPlaceholder = false;
      complete();
    };
    image.onerror = () => { if (active) sign.userData.logoLoadFailed = true; complete(); };
    image.src = assetUrl(company.logo);
  }
  return sign;
}
