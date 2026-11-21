/**
 * pages/viewProfile.js
 * Read-only profile of another user.
 * - Students can view any professor.
 * - Professors can view students who have sent them a session request.
 * Contact details are shown only after a confirmed booking and only if the owner allows sharing.
 */

/** Opens another user's profile and remembers which page to return to. */
function openProfileView(userId, backPage) {
    uiState.viewId = userId;
    uiState.viewBack = backPage;
    uiState.page = "view";
    renderApp();
    window.scrollTo(0, 0);
}

/**
 * Any element with data-view="<userId>" opens that profile. One delegated listener works
 * on every page, even after a page re-draws itself.
 */
app.addEventListener("click", event => {
    const button = event.target.closest("[data-view]");
    if (button) {
        openProfileView(button.dataset.view, uiState.page);
    }
});

const hasRequestBetween = (professorId, studentId) => DB.requests.some(r => r.professorId === professorId && r.studentId === studentId);

const hasConfirmedBooking = (professorId, studentId) =>
    DB.requests.some(r => r.professorId === professorId && r.studentId === studentId && r.status === "confirmed");

/** One "label: value" row; empty values are skipped. */
const factRow = (label, value) => (value ? `<dt>${label}</dt><dd>${value}</dd>` : "");

const countryAge = x => [x.country, x.age ? x.age + " years old" : ""].filter(Boolean).map(escapeHtml).join(" · ");

function profileUnavailableHtml() {
    return `<div class="card"><h1>Profile not available</h1><p class="mute">You can only view professors, or students who sent you a request.</p></div>`;
}

/** Professor profile as seen by a student. */
function professorProfileHtml(t, viewer) {
    const booked = hasConfirmedBooking(t.id, viewer.id);
    const contact = booked ? [t.phone, t.email].filter(Boolean).map(escapeHtml).join(" · ") : "";
    const resume = t.resume && String(t.resume.data).startsWith("data:")
        ? `<a class="linkbtn" href="${t.resume.data}" download="${escapeHtml(t.resume.name)}">Download resume (${escapeHtml(t.resume.name)})</a>`
        : `<span class="mute">No resume shared.</span>`;
    return `<div class="card">
  <div class="row pv-head">${avatar(t.photo, t.name, "big")}
    <div><h1 style="margin:0">${escapeHtml(t.name)}</h1><div class="mute">Professor · ${ratingLabel(t)}</div></div></div>
  <p>${escapeHtml(t.bio)}</p>
  <dl class="facts">
    ${factRow("Country and age", countryAge(t))}
    ${factRow("Subjects", t.subjects.map(escapeHtml).join(", "))}
    ${factRow("Experience", escapeHtml(t.exp))}
    ${factRow("Department", escapeHtml(t.dept || ""))}${factRow("Employee ID", escapeHtml(t.empId || ""))}${factRow("Status", statusBar(t.status) + " " + statusLabel(t.status))}
    ${factRow("Available", formatAvailability(t.avail))}
    ${factRow("Contact", contact || '<span class="mute">Shown after a confirmed booking</span>')}
  </dl>
  <h2>Resume</h2><p>${resume}</p>
  <p><button class="primary" id="bk">Book a session</button></p></div>`;
}

/** Student profile as seen by a professor. */
function studentProfileHtml(s, viewer) {
    const booked = hasConfirmedBooking(viewer.id, s.id);
    const contact = booked && sharesContact(s) ? escapeHtml(s.phone || "") : "";
    const sessions = DB.requests.filter(r => r.professorId === viewer.id && r.studentId === s.id)
        .map(r => `<div class="req">${escapeHtml(r.subject)} · ${r.day} ${formatTime(r.time)} <span class="badge ${r.status}">${r.status}</span></div>`).join("");
    return `<div class="card">
  <div class="row pv-head">${avatar(s.photo, s.name, "big")}
    <div><h1 style="margin:0">${escapeHtml(s.name)}</h1><div class="mute">Student</div></div></div>
  <dl class="facts">
    ${factRow("Country and age", countryAge(s))}
    ${factRow("Student ID", escapeHtml(s.sid || ""))}${factRow("Course and year", escapeHtml(s.course || ""))}
    ${factRow("Interests", s.subjects.map(escapeHtml).join(", "))}
    ${factRow("Contact", contact || '<span class="mute">Shown after a confirmed booking, if the student allows it</span>')}
  </dl>
  <h2>Sessions with you</h2>${sessions}</div>`;
}

/** Profile view page (student or professor target depending on who is looking). */
function renderViewProfilePage() {
    const viewer = currentUser();
    let body;
    if (viewer.role === "student") {
        const t = findProfessor(uiState.viewId);
        body = t ? professorProfileHtml(t, viewer) : profileUnavailableHtml();
    } else {
        const s = DB.users.find(u => u.id === uiState.viewId && u.role === "student");
        body = s && hasRequestBetween(viewer.id, s.id) ? studentProfileHtml(s, viewer) : profileUnavailableHtml();
    }
    app.innerHTML = `<button class="link" id="back">← Back</button>${body}`;
    $("#back").onclick = () => {
        uiState.page = uiState.viewBack || "home";
        renderApp();
    };
    if ($("#bk")) {
        $("#bk").onclick = () => openBookingDialog(findProfessor(uiState.viewId));
    }
}
