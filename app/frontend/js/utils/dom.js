/**
 * js/utils/dom.js
 * DOM helpers: query shortcut, HTML escaping, status messages.
 */

const $ = s => document.querySelector(s);

const app = $("#app");

const escapeHtml = s => String(s ?? "").replace(/[&<>"]/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
}[c]));

/** Shows a success or error message in an element. */
function showMessage(id, t, bad) {
    const e = $("#" + id);
    e.textContent = t;
    e.className = bad ? "err" : "ok";
}
