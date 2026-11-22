/**
 * js/components/navbar.js
 * Header navigation (Home, Profile, Schedules, Settings, Help) and the subject sidebar.
 */

const GEAR = '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>';

const NAV_PAGES = [
    ["home", "Home", '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>'],
    ["profile", "Profile", '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>'],
    ["progress", "Schedules", '<path d="M4 20v-9M10 20V5M16 20v-6M22 20H2"/>'],
    ["settings", "Settings", GEAR],
    ["help", "Help", '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>']
];

const navIcon = d => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

/** Each subject gets its own hue, used for the coloured spine in the sidebar, schedule and tables. */
const subjectHue = s => (Math.max(0, SUBJECTS.findIndex(x => x[0] === s)) * 36 + 140) % 360;

const closeDrawer = () => document.body.classList.remove("drawer");

function goTo(page) {
    uiState.page = page;
    uiState.profileUserId = null;
    uiState.saved = false;
    closeDrawer();
    renderApp();
    if (API_MODE && AUTH) {
        pull().then(renderApp).catch(() => {});
    }
    scrollTo(0, 0);
}

function logout() {
    AUTH = null;
    const me = currentUser();
    if (me && !API_MODE) {
        me.lastSeen = 0;
        save();
    }
    DB.session = null;
    save();
    uiState.subject = null;
    uiState.page = "home";
    closeDrawer();
    renderApp();
}

$("#scrim").onclick = closeDrawer;
document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        closeDrawer();
    }
});

const todayIndex = () => (new Date().getDay() + 6) % 7;

/** Sessions ordered by what comes up soonest, counting from now. */
function upcoming(list) {
    const t = r => new Date(r.day + "T" + r.time).getTime(), now = Date.now();
    return [...list].sort((a, b) => (t(a) < now) - (t(b) < now) || t(a) - t(b));
}

/** Draws the main navigation, the account area and the sidebar. */
function renderNav() {
    renderRail();
    renderBell();
    touchPresence();
    const u = currentUser();
    const ok = u && u.role && u.done;
    $(".shell").dataset.sb = ok ? "on" : "off";
    $("#nav").innerHTML = u ? `<div class="who"><span class="mute small name">${escapeHtml(u.name)} · ${u.role || "new"}</span><button class="out" id="out">Log out</button></div>` : "";
    $("#mainnav").innerHTML = ok ? (u.role === "admin" ? adminNav() : NAV_PAGES).map(([k, l, d]) => `<button data-p="${k}" ${uiState.page === k ? 'aria-current="page"' : ""}>${navIcon(d)}<span>${l}</span></button>`).join("") : "";
    $("#mainnav").querySelectorAll("[data-p]").forEach(b => b.onclick = () => goTo(b.dataset.p));
    if (u) {
        $("#out").onclick = logout;
    }
    $("#subbtn").style.display = ok ? "" : "none";
    $("#subbtn").onclick = () => document.body.classList.add("drawer");
    renderSide();
}

/** Sidebar: subjects, rate, time and schedule. Students also filter professors here. */
function renderSide() {
    const side = $("#side");
    const u = currentUser();
    if (!(u && u.role && u.done)) {
        side.hidden = true;
        side.innerHTML = "";
        return;
    }
    side.hidden = false;
    if (uiState.page === "settings") {
        return renderSettingsIndex(side);
    }
    if (u.role === "admin") {
        return renderAdminIndex(side);
    }
    if (uiState.page === "progress") {
        return renderScheduleIndex(side);
    }
    const professor = u.role === "professor";
    const home = uiState.page === "home";
    const sessions = DB.requests.filter(r => (professor ? r.professorId : r.studentId) === u.id && r.status !== "declined");
    const hr = t => formatTime(t).replace(":00", "");
    const bar = s => `<span class="spine" style="--h:${subjectHue(s)}"></span><span class="grow">${escapeHtml(s)}</span>`;
    const item = s => {
        const n = sessions.filter(r => r.subject === s).length;
        return `<button class="sub" data-sub="${escapeHtml(s)}" aria-pressed="${uiState.subject === s}">${bar(s)}<span class="cnt" title="${n} session${n === 1 ? "" : "s"}">${n || ""}</span></button>`;
    };
    const plain = s => `<div class="sub plain">${bar(s)}</div>`;
    const group = (title, body, empty) => `<h2 class="side-group">${title}</h2>${body || `<p class="side-empty">${empty}</p>`}`;
    const sec = (title, body) => `<div class="side-sec"><h2 class="side-group">${title}</h2>${body}</div>`;
    const filtered = uiState.maxRate || uiState.status || uiState.fDays.length || uiState.fTime;
    const rate = professor ? sec("Department", `<div>${escapeHtml(u.dept || "")}</div>`) : home ? sec("Filter", `<select id="sr" aria-label="Department"><option value="">All departments</option>${DEPTS.map(d => `<option ${uiState.maxRate === d ? "selected" : ""}>${d}</option>`).join("")}</select><select id="ss" aria-label="Status" style="margin-top:8px"><option value="">Any status</option>${[["GREEN", "Available"], ["YELLOW", "On break"], ["RED", "Unavailable"]].map(([c, l]) => `<option value="${c}" ${uiState.status === c ? "selected" : ""}>${l}</option>`).join("")}</select>`) : "";
    const time = professor ? sec("Time", `<div>${escapeHtml(formatAvailability(u.avail))}</div><button class="link" id="sprof" style="padding:4px 0">Change on Profile</button>`)
        : home ? sec("Time", `<div class="chips" role="group" aria-label="Days">${DAYS.map(d => `<button class="chip" data-day="${d}" aria-pressed="${uiState.fDays.includes(d)}">${d}</button>`).join("")}</div>
  <div class="chips" role="group" aria-label="Time of day" style="margin-top:8px">${TIME_BANDS.map(b => `<button class="chip" data-tm="${b[0]}" aria-pressed="${uiState.fTime === b[0]}">${b[1]}</button>`).join("")}</div>
  ${filtered ? '<button class="link" id="sclr" style="padding:6px 0 0">Clear filters</button>' : ""}`) : "";
    const sched = upcoming(sessions).slice(0, 6).map(r => `<div class="sched"><span class="spine" style="--h:${subjectHue(r.subject)}"></span><div><b>${r.day} ${hr(r.time)}</b> ${escapeHtml(r.subject)}<div class="mute small">${escapeHtml(professor ? r.student : r.professor)}${r.status === "pending" ? " · pending" : ""}</div></div></div>`).join("");
    side.innerHTML = `<div class="side-head"><b>My subjects</b><button class="link" id="sedit">Edit</button></div>
  <button class="sub" data-sub="" aria-pressed="${!uiState.subject}"><span class="spine" style="background:var(--line)"></span><span class="grow">All subjects</span></button>
  ${professor ? group("Teaching", u.subjects.map(item).join(""), "Add the subjects you teach.") : ""}
  ${group("Learning", professor ? (u.learn || []).map(plain).join("") : u.subjects.map(item).join(""), "Add subjects you want to learn.")}
  ${rate}${time}
  ${sec("Schedule", sched || '<p class="side-empty" style="margin:0">No sessions yet.</p>')}
  <div class="side-foot"><button id="sout" style="width:100%">Log out</button></div>`;
    const again = sel => {
        renderApp();
        if ($(sel)) {
            $(sel).focus();
        }
    };
    side.querySelectorAll("[data-sub]").forEach(b => b.onclick = () => {
        uiState.subject = b.dataset.sub && uiState.subject !== b.dataset.sub ? b.dataset.sub : null;
        uiState.page === "home" ? (closeDrawer(), renderApp()) : goTo("home");
    });
    if ($("#sr")) {
        $("#sr").onchange = e => {
            uiState.maxRate = e.target.value;
            again("#sr");
        };
    }
    side.querySelectorAll("[data-day]").forEach(b => b.onclick = () => {
        const i = uiState.fDays.indexOf(b.dataset.day);
        i < 0 ? uiState.fDays.push(b.dataset.day) : uiState.fDays.splice(i, 1);
        again(`[data-day="${b.dataset.day}"]`);
    });
    side.querySelectorAll("[data-tm]").forEach(b => b.onclick = () => {
        uiState.fTime = uiState.fTime === b.dataset.tm ? "" : b.dataset.tm;
        again(`[data-tm="${b.dataset.tm}"]`);
    });
    if ($("#sclr")) {
        $("#sclr").onclick = () => {
            uiState.maxRate = ""; uiState.status = ""; uiState.fDays = [];
            uiState.fTime = "";
            renderApp();
        };
    }
    if ($("#sprof")) {
        $("#sprof").onclick = () => goTo("profile");
    }
    $("#sedit").onclick = openSubjectsDialog;
    $("#sout").onclick = logout;
}

/** Dialog to change the subjects taught (professors) or learned. */
function openSubjectsDialog() {
    const u = currentUser();
    const professor = u.role === "professor";
    const pick = { main: [...u.subjects], learn: [...(u.learn || [])] };
    const d = $("#dlg");
    const chips = key => `<div class="chips" role="group">${SUBJECTS.map(([s]) => `<button type="button" class="chip" data-g="${key}" data-s="${s}" aria-pressed="${pick[key].includes(s)}">${s}</button>`).join("")}</div>`;
    d.innerHTML = `<h2 style="margin-top:0">Edit my subjects</h2>
  <label style="margin-top:0">${professor ? "Subjects I teach" : "Subjects I am a student"}</label>${chips("main")}
  ${professor ? `<label>Subjects I want to learn</label>${chips("learn")}` : ""}
  <div class="err" role="alert" id="sem"></div>
  <div class="row" style="margin-top:16px"><button class="primary" id="ssv">Save subjects</button><button id="sx">Cancel</button></div>`;
    d.querySelectorAll("[data-s]").forEach(b => b.onclick = () => {
        const list = pick[b.dataset.g];
        const i = list.indexOf(b.dataset.s);
        i < 0 ? list.push(b.dataset.s) : list.splice(i, 1);
        b.setAttribute("aria-pressed", i < 0);
    });
    d.showModal();
    $("#sx").onclick = () => d.close();
    $("#ssv").onclick = () => {
        if (!pick.main.length) {
            $("#sem").textContent = "Keep at least one subject.";
            return;
        }
        u.subjects = pick.main;
        if (professor) {
            u.learn = pick.learn;
        }
        if (uiState.subject && !u.subjects.includes(uiState.subject)) {
            uiState.subject = null;
        }
        logActivity(u, "Updated subjects");
        save();
        d.close();
        uiState.profileUserId = null;
        renderApp();
    };
}
