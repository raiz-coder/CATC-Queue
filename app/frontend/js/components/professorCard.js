/**
 * js/components/professorCard.js
 * Professor card markup used on the student Home page.
 */

/** Returns the HTML of one professor card. */
function professorCardHtml(t, showBook = true) {
    return `<div class="card professor">${avatar(t.photo, t.name)}
  <div><h3>${escapeHtml(t.name)} ${t.real ? '<span class="ok small">· new</span>' : ""}</h3>
  <div class="small">${ratingLabel(t)} · <span class="mute">${escapeHtml(t.exp)} experience</span></div>
  <div class="mute small">${escapeHtml(t.dept || "")} department</div><div class="mute small">Teaches: ${t.subjects.map(escapeHtml).join(", ")}</div>
  ${t.country || t.age ? `<div class="mute small">${[t.country, t.age ? t.age + " years old" : ""].filter(Boolean).map(escapeHtml).join(" · ")}</div>` : ""}
  <div class="mute small">Available: ${formatAvailability(t.avail)}</div>
  <p style="margin:6px 0 10px">${escapeHtml(t.bio)}</p>${showBook ? `<button class="primary" data-id="${t.id}">Book a session</button> <button data-view="${t.id}">View profile</button>` : ""}</div>
  <div class="price">${statusBar(t.status)}<div class="mute small" style="font-weight:400">${statusLabel(t.status)}</div></div></div>`;
}
