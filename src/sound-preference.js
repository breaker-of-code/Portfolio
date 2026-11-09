export const SOUND_PREFERENCE_KEY = 'coastal-portfolio:sound';
export function readSoundPreference(storage) {
  try { return (storage ?? globalThis.localStorage).getItem(SOUND_PREFERENCE_KEY) !== 'off'; }
  catch { return true; }
}
export function saveSoundPreference(enabled, storage) {
  try { (storage ?? globalThis.localStorage).setItem(SOUND_PREFERENCE_KEY, enabled ? 'on' : 'off'); }
  catch { /* The current tab's mute still works without storage. */ }
}
