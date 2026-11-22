/**
 * pages/home.js
 * Home: a search bar and the professor profiles. Schedule, subjects, rate and time live in the sidebar.
 */

const TIME_BANDS = [["morning", "Morning", "06:00", "12:00"], ["afternoon", "Afternoon", "12:00", "17:00"], ["evening", "Evening", "17:00", "22:00"]];

const SEARCH_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';

const searchBar = placeholder => `<div class="searchbar" role="search">${SEARCH_ICON}<input id="q" type="search" aria-label="${placeholder}" placeholder="${placeholder}" value="${escapeHtml(uiState.q)}" autocomplete="off"></div>`;

/** Applies the search text and the sidebar filters (subject, rate, days, time of day). */
function filterProfessors(all) {
    const q = uiState.q.trim().toLowerCase();
    const band = TIME_BANDS.find(b => b[0] === uiState.fTime);
    return all
        .filter(t => !uiState.subject || t.subjects.includes(uiState.subject))
        .filter(t => !uiState.maxRate || t.dept === uiState.maxRate).filter(t => !uiState.status || t.status === uiState.status)
        .filter(t => !uiState.fDays.length || (t.avail && uiState.fDays.some(d => t.avail.days.includes(d))))
        .filter(t => !band || (t.avail && t.avail.days.length && t.avail.from < band[3] && t.avail.to > band[2]))
        .filter(t => !q || [t.name, t.dept || "", t.bio, t.country || "", ...t.subjects].join(" ").toLowerCase().includes(q))
        .sort((a, b) => a.name.localeCompare(b.name));
}

/** Student Home. */
function renderStudentHome() {
    const u = currentUser();
    const all = getAllProfessors();
    const next = upcoming(DB.requests.filter(r => r.studentId === u.id && r.status === "confirmed"))[0];
    app.innerHTML = `${searchBar("Search professors by name, subject or keyword")}
  <h1>Hi ${escapeHtml(u.name.split(" ")[0])}, which exam did you miss?</h1>
  <p class="lead">${next ? `Next session: ${escapeHtml(next.subject)} with ${escapeHtml(next.professor)}, ${next.day} at ${formatTime(next.time)}.` : "No sessions yet. Pick a professor to book your first one."}</p>
  <h2 id="rh" aria-live="polite" style="margin-top:0"></h2><div id="results"></div>`;
    const draw = () => {
        const list = filterProfessors(all);
        $("#rh").textContent = `${list.length} professor${list.length === 1 ? "" : "s"}${uiState.subject ? " for " + uiState.subject : ""}`;
        $("#results").innerHTML = list.length ? list.map(t => professorCardHtml(t)).join("") : '<div class="card">No professors match. Try another search or clear the filters in the sidebar.</div>';
        $("#results").querySelectorAll("[data-id]").forEach(b => b.onclick = () => openBookingDialog(all.find(t => t.id === b.dataset.id)));
    };
    $("#q").oninput = e => {
        uiState.q = e.target.value;
        draw();
    };
    draw();
}

/** Professor Home: stats and session requests, with the same search bar. */
function renderProfessorHome() {
    const u = currentUser();
    const mine = DB.requests.filter(r => r.professorId === u.id).sort((a, b) => b.at - a.at);
    const rt = getRating({ id: u.id, real: 1 });
    app.innerHTML = `${searchBar("Search requests by student, ID or subject")}
  <h1>Welcome, ${escapeHtml(u.name.split(" ")[0])}.</h1>
  <p class="lead">Students searching ${u.subjects.map(escapeHtml).join(", ")} can book you for missed exams.</p>
  <div class="card" style="margin-bottom:12px"><b>My status</b> ${statusBar(u.status)}<div class="chips" style="margin-top:8px">${[["GREEN", "Available"], ["YELLOW", "On break"], ["RED", "Unavailable"]].map(([c, l]) => `<button class="chip" data-st="${c}" aria-pressed="${(u.status || "GREEN") === c}"><span class="dot st-${c}"></span>${l}</button>`).join("")}</div></div><div class="stats"><div class="card stat"><b>${mine.filter(r => r.status === "pending").length}</b>Pending requests</div><div class="card stat"><b>${mine.filter(r => r.status === "confirmed").length}</b>Confirmed sessions</div>
  <div class="card stat"><b>${rt.count ? rt.avg.toFixed(1) + " ★" : "–"}</b>${rt.count ? rt.count + " rating" + (rt.count > 1 ? "s" : "") : "No ratings yet"}</div></div>
  <h2>Calendar of activity</h2><div class="card">${calendarHtml(mine)}</div><h2>Session requests</h2><div class="card" id="results"></div>`;
    const draw = () => {
        const q = uiState.q.trim().toLowerCase();
        const pend = mine.filter(r => (r.status === "pending" || r.status === "cancel_requested") && (!uiState.subject || r.subject === uiState.subject) && (!q || [r.student, studentOf(r).sid || "", r.subject, r.msg || ""].join(" ").toLowerCase().includes(q)));
        $("#results").innerHTML = pend.length ? pend.map(r => `<div class="req"><b>${escapeHtml(r.student)}</b> (${studentLine(r)}) · ${escapeHtml(r.subject)} <span class="badge ${r.status}">${r.status}</span>
  <div class="mute small">${r.day} · ${formatTime(r.time)}</div>${r.msg ? `<div>${escapeHtml(r.msg)}</div>` : ""}
  <div class="row" style="margin-top:8px">${r.status === "cancel_requested" ? `<button class="primary" data-a="cancelok" data-r="${r.id}">Approve cancellation</button>` : `<button class="primary" data-a="confirmed" data-r="${r.id}">Accept</button><button data-a="declined" data-r="${r.id}">Decline</button>`}<button class="link" data-view="${r.studentId}">View student</button></div></div>`).join("")
            : '<span class="mute">No pending requests.</span>';
        $("#results").querySelectorAll("[data-a]").forEach(b => b.onclick = () => {
            const r = DB.requests.find(x => x.id === b.dataset.r), d = $("#dlg"), a = b.dataset.a;
            const when = `${r.day} at ${formatTime(r.time)}`, me = currentUser().name;
            const finish = (status, type, msg, extra) => { Object.assign(r, extra || {}, { status }); addEvent(r, type, "student", msg); save(); d.close(); renderApp(); };
            if (a === "cancelok") {
                return finish("cancelled", "cancelled", `${me} approved your cancellation of ${r.subject} on ${when}.`);
            }
            const head = `<h2 style="margin-top:0">${a === "confirmed" ? "Confirm request" : "Decline request"}</h2><p>${escapeHtml(r.student)} (${studentLine(r)})<br>${escapeHtml(r.subject)} · ${when}${r.msg ? "<br>Message: " + escapeHtml(r.msg) : ""}</p>`;
            if (a === "confirmed") {
                d.innerHTML = head + `<label for="cr">Type the student's reference number exactly</label><input id="cr" autocomplete="off">
  <div class="grid2"><div><label for="rm">Room</label><input id="rm"></div><div><label for="cp2">Campus</label><input id="cp2"></div></div>
  <label for="rp">Reply message</label><textarea id="rp" rows="2"></textarea>
  <div class="err" id="ce" role="alert"></div><div class="row" style="margin-top:14px"><button class="primary" id="cy">Confirm</button><button id="cn">Quit</button></div>`;
                d.showModal();
                $("#cn").onclick = () => d.close();
                $("#cy").onclick = () => {
                    if ($("#cr").value.trim() !== r.ref) { return $("#ce").textContent = "Reference number does not match this booking."; }
                    if (!$("#rm").value.trim() || !$("#cp2").value.trim()) { return $("#ce").textContent = "Enter the room and the campus."; }
                    const acceptRef = answerRef(r, "A33p");
                    finish("confirmed", "accepted", `${me} accepted your booking for ${r.subject} on ${when}. Authentication no. ${acceptRef}.`, { acceptRef, room: $("#rm").value.trim(), campus: $("#cp2").value.trim(), reply: $("#rp").value.trim() });
                };
            } else {
                d.innerHTML = head + `<label for="rp">Reply message</label><textarea id="rp" rows="2"></textarea><p>Do you want it to be rescheduled?</p><div class="row"><button class="primary" id="dy">Yes</button><button id="dd">Decline only</button><button id="dn">Quit</button></div>`;
                d.showModal();
                $("#dn").onclick = () => d.close();
                const decline = (status, text) => finish(status, status, `${me} ${text} ${r.subject} on ${when}.`, { declineRef: answerRef(r, "D53l"), reply: $("#rp").value.trim() });
                $("#dy").onclick = () => decline("rescheduled", "offered to reschedule your booking for");
                $("#dd").onclick = () => decline("declined", "declined your booking for");
            }
        });
    };
    $("#q").oninput = e => {
        uiState.q = e.target.value;
        draw();
    };
    draw();
}
