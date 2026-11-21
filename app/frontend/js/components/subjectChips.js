/**
 * js/components/subjectChips.js
 * Toggleable subject chips and their click handlers.
 */

const subjectChips = (sel) => `<div class="chips" role="group">${SUBJECTS.map(([s]) => `<button type="button" class="chip" aria-pressed="${sel.includes(s)}" data-s="${s}">${s}</button>`).join("")}</div>`;

/** Makes chips toggle values in the given array. */
function bindChipToggles(sel, attr = "s") {
    app.querySelectorAll(`[data-${attr}]`).forEach(b => b.onclick = () => {
        const s = b.dataset[attr];
        const i = sel.indexOf(s);
        i < 0 ? sel.push(s) : sel.splice(i, 1);
        b.setAttribute("aria-pressed", i < 0);
    });
}
