/**
 * js/components/avatar.js
 * Avatar (photo or initial) markup.
 */

const avatar = (p, n, c = "") => p ? `<img class="av ${c}" src="${p}" alt="">` : `<div class="av ${c}" aria-hidden="true">${escapeHtml((n || "?")[0])}</div>`;
