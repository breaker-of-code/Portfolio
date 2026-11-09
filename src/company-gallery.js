// Only explicit, reviewed company/project associations create gallery cards.
export function companyProjectGalleries(company, projects) {
  return [...new Set(company.projectIndices || [])].flatMap(index => {
    if (!Number.isInteger(index) || !projects[index]) return [];
    const project = projects[index];
    const images = (project.images || []).filter(image => typeof image === 'string' && image.length);
    return images.length ? [{ index, title: project.name, images, cover: project.thumbnails?.[0] || images[0], illustrative: project.demo === true }] : [];
  });
}

// One linked project still fills both photo slots, using its own screenshots.
export function companyPreviewImages(company, projects) {
  const galleries = companyProjectGalleries(company, projects);
  if (galleries.length !== 1) return galleries;
  const project = galleries[0];
  const previews = project.images.map((image, i) => ({
    ...project, cover: projects[project.index].thumbnails?.[i] || image,
  }));
  return previews.length === 1 ? [previews[0], { ...previews[0] }] : previews;
}
