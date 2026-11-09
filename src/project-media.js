// Full media URLs are used only by the selected gallery item, never its thumbnails.
export function projectMedia(project) {
  return [
    ...(project.images || []).map((src, index) => ({ type: 'image', src, thumb: project.thumbnails?.[index] || src, title: `${project.name} screenshot ${index + 1}` })),
    ...(project.videos || []).map(video => ({ type: 'video', ...video, thumb: video.poster })),
  ];
}

export function nextGalleryImage(items, index) {
  if (items.length < 2) return null;
  const next = items[(index + 1) % items.length];
  return next.type === 'image' ? next.src : null;
}

export function releaseGalleryVideo(video) {
  video.pause();
  video.removeAttribute('src');
  video.removeAttribute('poster');
  video.load();
}
