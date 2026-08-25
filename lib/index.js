// dsh-question-jump-bar host entry.
// This plugin is browser-only: the browser half (lib/client.js) owns the
// shell.overlay rail. The empty apply exists so the row activates in the
// host loader; without it the plugin would never mount.
export const name = 'dsh-question-jump-bar';

/** Host plugin body — no host-side behavior for this surface plugin. */
export function apply() {}
