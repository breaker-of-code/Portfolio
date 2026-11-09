// Public assets must stay inside the Pages repository subpath.
export function assetUrl(value, base = import.meta.env?.BASE_URL || '/') {
  if (!value || /^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?)/i.test(value)) return value;
  const prefix = `${base.replace(/\/$/, '')}/`;
  if (prefix !== '/' && value.startsWith(prefix)) return value;
  return prefix + value.replace(/^(?:\.\/|\/)+/, '');
}
