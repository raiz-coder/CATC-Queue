/**
 * pages/progress.js
 * My Schedules (students) and My Schedule (professors).
 */

/** Student's subjects and booked sessions. */
function renderStudentProgress() {
    const u = currentUser();
    const all = getAllProfessors();
    const mineAll = DB.requests.filter(r => r.studentId === u.id);
    const rs = mineAll.filter(sfOk).sort((a, b) => b.at - a.at);
    app.innerHTML = `<h1>Schedules</h1><p class="lead">Your chosen subjects and the professors you booked.</p>
  <h2 style="margin-top:0">Subjects I chose</h2>
  <div class="chips">${u.subjects.map(s => `<span class="chip" style="background:var(--mark)">${escapeHtml(s)} · ${mineAll.filter(r => r.subject === s && r.status === "confirmed").length} confirmed</span>`).join("")}</div>
  <p class="mute small">${escapeHtml(u.sid || "")} · ${escapeHtml(u.course || "")}</p>
  <h2>${scheduleLabel(uiState.sf, false)}</h2>${rs.length ? rs.map(r => {
        const t = all.find(x => x.id === r.professorId) || { name: r.professor, subjects: [], avail: null };
        return `<div class="card" style="margin-bottom:12px"><div class="row" style="justify-content:space-between"><b>${escapeHtml(r.subject)}</b><span class="badge ${r.status}">${r.status}</span></div>
  <div>Professor: <b>${escapeHtml(t.name)}</b> <button class="link" data-view="${r.professorId}">View profile</button></div><div class="mute small">Domain: ${t.subjects.map(escapeHtml).join(", ")}</div>
  <div class="mute small">Exam schedule: ${r.day}, ${formatTime(r.time)} · Reference no.: <b>${escapeHtml(r.ref || "")}</b></div>${["pending", "confirmed"].includes(r.status) ? `<button data-cx="${r.id}">Cancel booking</button>` : ""}${r.status === "cancel_requested" ? '<div class="mute small">Cancellation sent. Waiting for the professor to agree.</div>' : ""}${r.status === "rescheduled" ? '<div class="small">The professor offered to reschedule. Book a new slot.</div>' : ""}
  ${r.status === "confirmed" ? (t.phone || t.email ? `<div class="mute small">Contact: ${escapeHtml(t.phone || "")} ${escapeHtml(t.email || "")}</div>` : "") : ""}
  ${r.status === "confirmed" ? (r.rating ? `<div class="star">You rated ${r.rating} ★</div>` : `<div class="row" style="margin-top:8px"><span class="small">Rate this professor:</span>${[1, 2, 3, 4, 5].map(n => `<button data-r="${r.id}" data-n="${n}" aria-label="${n} stars">${n}★</button>`).join("")}</div>`) : ""}</div>`;
    }).join("")
        : `<div class="card">${uiState.sf ? "Nothing in this list." : "No sessions yet. Go to Home and book a professor."}</div>`}`;
    app.querySelectorAll("[data-n]").forEach(b => b.onclick = () => {
        DB.requests.find(r => r.id === b.dataset.r).rating = +b.dataset.n;
        save();
        renderStudentProgress();
    });
}

function studentContactSuffix(r) {
    const x = DB.users.find(v => v.id === r.studentId);
    return x && x.phone && sharesContact(x) ? " · " + escapeHtml(x.phone) : "";
}

/** Schedule options shown in the sidebar on the Schedules page. */
const SCHEDULE_FILTERS = [["", "All schedules"], ["pending", "Pending / Requests"], ["confirmed", "Current"], ["history", "History"]];
function scheduleLabel(k, professor) {
    const l = (SCHEDULE_FILTERS.find(x => x[0] === (k || "")) || SCHEDULE_FILTERS[0])[1];
    return k === "pending" ? (professor ? "Pending" : "Requests") : l;
}

/** Sidebar index for Schedules (students and professors): All, Pending/Requests, Current, History. */
function renderScheduleIndex(side) {
    const u = currentUser(), pro = u.role === "professor", cur = uiState.sf || "";
    const mine = DB.requests.filter(r => (pro ? r.professorId : r.studentId) === u.id);
    side.innerHTML = `<div class="side-head"><b>Schedules</b></div>
  <nav aria-label="Schedule options">${SCHEDULE_FILTERS.map(([k]) => `<button class="sub" data-sf="${k}" ${k === cur ? 'aria-current="true"' : ""}><span class="grow">${scheduleLabel(k, pro)}</span><span class="cnt">${mine.filter(r => sfMatch(r, k)).length || ""}</span></button>`).join("")}</nav>
  <div class="side-foot"><button id="sout" style="width:100%">Log out</button></div>`;
    side.querySelectorAll("[data-sf]").forEach(b => b.onclick = () => {
        uiState.sf = b.dataset.sf;
        closeDrawer();
        renderApp();
        scrollTo(0, 0);
    });
    $("#sout").onclick = logout;
}

/** Professor's schedule list for the option picked in the sidebar. */
function renderProfessorSchedule() {
    const u = currentUser(), f = uiState.sf || "";
    const mine = DB.requests.filter(r => r.professorId === u.id);
    const list = mine.filter(sfOk).sort((a, b) => a.day.localeCompare(b.day) || a.time.localeCompare(b.time));
    const rated = mine.filter(r => r.rating);
    app.innerHTML = `<h1>Schedules</h1><p class="lead">Choose All, Pending, Current or History in the sidebar.</p>
  <h2 style="margin-top:0">${scheduleLabel(f, true)}</h2><div class="card">${list.length ? list.map(r => `<div class="req"><b>${r.day} · ${formatTime(r.time)}</b> — ${escapeHtml(r.student)} <button class="link" data-view="${r.studentId}">View profile</button>${studentContactSuffix(r)} <span class="badge ${r.status}">${r.status}</span><div class="mute small">${escapeHtml(r.subject)} · ${studentLine(r)}</div></div>`).join("") : '<span class="mute">Nothing in this list.</span>'}</div>
  ${!f || f === "confirmed" ? `<h2>Student ratings</h2><div class="card">${rated.length ? rated.map(r => `<div class="req"><span class="star">${r.rating} ★</span> from ${escapeHtml(r.student)} · ${escapeHtml(r.subject)}</div>`).join("") : '<span class="mute">No ratings yet.</span>'}</div>` : ""}`;
}
