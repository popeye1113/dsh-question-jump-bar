// dsh-question-jump-bar host entry.
// This plugin is browser-only: the browser half (lib/client.js) registers
// the quote panel, edit-and-resend and the custom user message renderer.
// The host half has no behavior; the empty apply exists so the row
// activates in the host loader (without it the plugin never mounts).
export const name = 'dsh-question-jump-bar';

/** Host plugin body — no host-side behavior for this surface plugin. */
export function apply() {}
