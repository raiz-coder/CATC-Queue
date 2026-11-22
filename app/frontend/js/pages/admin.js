/**
 * js/pages/admin.js
 * Admin dashboard.
 *   Home        accounts catalog with a side index: All, Employee, Student. Online users come first.
 *   Transaction bookings with a side index: Requested, Cancelled, Accepted, Declined.
 *   Settings    Theme and design, Security and privacy (see pages/settings.js).
 */
const ONLINE_MS = 90000;
const isOnline = u => Date.now() - (u.lastSeen || 0) < ONLINE_MS;
const userById = id => DB.users.find(x => x.id === id) || {};

const ADMIN_HOME = [["", "All"], ["professor", "Employee"], ["student", "Student"]];
const ADMIN_TX = [["requested", "Requested"], ["cancelled", "Cancelled"], ["accepted", "Accepted"], ["declined", "Declined"]];
const TX_STATUS = { requested: ["pending"], cancelled: ["cancelled", "cancel_requested"], accepted: ["confirmed"], declined: ["declined", "rescheduled"] };

const accountsOf = k => DB.users.filter(u => u.role !== "admin" && (!k || u.role === k));
const txOf = k => DB.requests.filter(r => TX_STATUS[k].includes(r.status)).sort((a, b) => b.at - a.at);

/** Top navigation for the admin: Home, Transaction, Settings. */
function adminNav() {
    return NAV_PAGES.filter(p => ["home", "progress", "settings"].includes(p[0])).map(p => p[0] === "progress" ? [p[0], "Transaction", p[2]] : p);
}

/** Left side index: account types on Home, booking status on Transaction. */
function renderAdminIndex(side) {
    const home = uiState.page !== "progress", cur = home ? (uiState.af || "") : (uiState.tf || "requested");
    const opts = home ? ADMIN_HOME : ADMIN_TX, key = home ? "data-af" : "data-tf";
    side.innerHTML = `<div class="side-head"><b>${home ? "Accounts" : "Transactions"}</b></div>
  <nav aria-label="Options">${opts.map(([k, l]) => `<button class="sub" ${key}="${k}" ${k === cur ? 'aria-current="true"' : ""}><span class="grow">${l}</span><span class="cnt">${(home ? accountsOf(k) : txOf(k)).length || ""}</span></button>`).join("")}</nav>
  <div class="side-foot"><button id="sout" style="width:100%">Log out</button></div>`;
    side.querySelectorAll(`[${key}]`).forEach(b => b.onclick = () => {
        if (home) { uiState.af = b.getAttribute(key); } else { uiState.tf = b.getAttribute(key); }
        closeDrawer();
        renderApp();
        scrollTo(0, 0);
    });
    $("#sout").onclick = logout;
}

/** Home: the accounts catalog. */
function renderAdminHome() {
    const k = uiState.af || "";
    const list = accountsOf(k).sort((a, b) => isOnline(b) - isOnline(a) || (a.name || "").localeCompare(b.name || ""));
    const title = (ADMIN_HOME.find(x => x[0] === k) || ADMIN_HOME[0])[1];
    app.innerHTML = `<h1>Accounts</h1><p class="lead">${title}: ${list.length}. Online users are listed first.</p>
  ${list.length ? list.map(accountCard).join("") : '<div class="card mute">No accounts here yet.</div>'}`;
    app.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => editAccount(b.dataset.edit));
    app.querySelectorAll("[data-del]").forEach(b => b.onclick = () => deleteAccount(b.dataset.del));
}

function accountCard(u) {
    const pro = u.role === "professor", on = isOnline(u);
    return `<div class="card acct"><div class="row" style="justify-content:space-between"><div><b>${escapeHtml(u.name || "")}</b> <span class="mute small">${pro ? "Employee" : "Student"}</span></div><span class="online ${on ? "on" : ""}">${on ? "Online" : "Offline"}</span></div>
  <div class="mute small">${pro ? "Employee ID" : "Student ID"}: <b>${escapeHtml((pro ? u.empId : u.sid) || "—")}</b> · ${pro ? "Department" : "Course and year"}: <b>${escapeHtml((pro ? u.dept : u.course) || "—")}</b></div>
  <div class="mute small">Email: ${escapeHtml(u.email || "")}</div>
  <div class="row" style="margin-top:8px"><button data-edit="${u.id}">Edit</button><button data-del="${u.id}">Delete</button></div></div>`;
}

/** Edit name, ID, course/department and email. An optional new password helps with login problems. */
function editAccount(id) {
    const u = userById(id), pro = u.role === "professor", d = $("#dlg");
    const idKey = pro ? "empId" : "sid", infoKey = pro ? "dept" : "course";
    d.innerHTML = `<h2 style="margin-top:0">Edit ${pro ? "employee" : "student"}</h2>
  <label for="an">Name</label><input id="an" value="${escapeHtml(u.name || "")}">
  <label for="ai">${pro ? "Employee ID" : "Student ID"}</label><input id="ai" value="${escapeHtml(u[idKey] || "")}">
  <label for="ac">${pro ? "Department" : "Course and year"}</label>${pro ? `<select id="ac">${DEPTS.map(x => `<option ${u.dept === x ? "selected" : ""}>${x}</option>`).join("")}</select>` : `<input id="ac" value="${escapeHtml(u.course || "")}">`}
  <label for="ae">Email</label><input id="ae" type="email" value="${escapeHtml(u.email || "")}">
  <label for="ap">New password (optional)</label><input id="ap" type="password" autocomplete="new-password" placeholder="Leave empty to keep it">
  <div class="err" id="aerr" role="alert"></div>
  <div class="row" style="margin-top:14px"><button class="primary" id="asave">Save</button><button id="acancel">Cancel</button></div>`;
    d.showModal();
    $("#acancel").onclick = () => d.close();
    $("#asave").onclick = async () => {
        const f = { name: $("#an").value.trim(), email: $("#ae").value.trim().toLowerCase(), password: $("#ap").value, [idKey]: $("#ai").value.trim(), [infoKey]: $("#ac").value.trim() };
        const bad = m => { $("#aerr").textContent = m; };
        if (!f.name || !f.email || !f[idKey]) { return bad("Name, ID and email are required."); }
        if (f.password && f.password.length < 6) { return bad("Use at least 6 characters for the new password."); }
        try {
            if (API_MODE) {
                await api("PUT", "/api/admin/users/" + id, f);
                await pull();
            } else {
                if (DB.users.some(x => x.id !== id && (x.email === f.email || (x[idKey] && x[idKey].toLowerCase() === f[idKey].toLowerCase())))) { return bad("That email or ID already belongs to another account."); }
                Object.assign(u, { name: f.name, email: f.email, [idKey]: f[idKey], [infoKey]: f[infoKey] });
                if (f.password) { u.pw = hashPassword(f.password); }
                DB.requests.forEach(r => { if (r.studentId === id) { r.student = f.name; } if (r.professorId === id) { r.professor = f.name; } });
                save();
            }
            d.close();
            renderApp();
        } catch (x) {
            bad(x.message);
        }
    };
}

function deleteAccount(id) {
    const u = userById(id);
    if (!confirm(`Delete the account of ${u.name}? Their bookings are deleted too.`)) { return; }
    if (API_MODE) {
        return api("DELETE", "/api/users/" + id).then(pull).then(renderApp).catch(x => alert(x.message));
    }
    DB.users = DB.users.filter(x => x.id !== id);
    DB.requests = DB.requests.filter(r => r.studentId !== id && r.professorId !== id);
    save();
    renderApp();
}

/** Transaction: bookings for the status picked in the side index. */
function renderAdminTransactions() {
    const k = uiState.tf || "requested", list = txOf(k), title = ADMIN_TX.find(x => x[0] === k)[1];
    app.innerHTML = `<h1>Transaction</h1><p class="lead">${title}: ${list.length}</p>${list.length ? list.map(r => txCard(r, k)).join("") : '<div class="card mute">Nothing here yet.</div>'}`;
    app.querySelectorAll("[data-dtx]").forEach(b => b.onclick = () => {
        if (!confirm("Delete this booking record?")) { return; }
        if (API_MODE) {
            return api("DELETE", "/api/requests/" + b.dataset.dtx).then(pull).then(renderApp).catch(x => alert(x.message));
        }
        DB.requests = DB.requests.filter(r => r.id !== b.dataset.dtx);
        save();
        renderApp();
    });
}

function txCard(r, k) {
    const s = userById(r.studentId), p = userById(r.professorId), sched = `${r.day}, ${formatTime(r.time)}`;
    const L = (a, v) => `<div>${a}: <b>${escapeHtml(v || "—")}</b></div>`;
    let body;
    if (k === "requested" || k === "cancelled") {
        const ref = k === "requested" ? r.ref : (r.cancelRef || cancelRef(r));
        body = L("Student", s.name || r.student) + L("Student ID", s.sid) + L("Course and year", s.course) + L("Reference number", ref) + L("Schedule", sched);
    } else {
        const ref = k === "accepted" ? (r.acceptRef || answerRef(r, "A33p")) : (r.declineRef || answerRef(r, "D53l"));
        body = L("Student", s.name || r.student) + L("Student ID", s.sid) + L("Professor", p.name || r.professor) + L("Employee ID", p.empId) + L("Room and campus", [r.room, r.campus].filter(Boolean).join(", ")) + L("Schedule", sched) + L("Reference number", ref);
    }
    return `<div class="card tx">${body}<div class="mute small">Subject: ${escapeHtml(r.subject)} <span class="badge ${r.status}">${r.status}</span></div><button data-dtx="${r.id}" style="margin-top:8px">Delete record</button></div>`;
}
