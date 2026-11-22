/**
 * js/components/notifications.js
 * Bell icon in the upper left corner with a red dot, plus the notification panel.
 * Professors are told when a booking is Requested or Cancelled.
 * Students are told when a booking is Accepted, Declined (or a reschedule is offered, or a cancellation is approved).
 * Events live on each booking (r.events), so they are saved with it. u.notifSeen is when the user last opened the panel.
 */
const NOTIF = { requested: ["Requested", "pending"], cancel_requested: ["Cancel request", "cancelled"], cancelled: ["Cancelled", "cancelled"], accepted: ["Accepted", "confirmed"], declined: ["Declined", "declined"], rescheduled: ["Reschedule", "declined"] };

const bellBtn = $("#bell"), notifPanel = $("#notif");

// noinspection JSUnusedGlobalSymbols (called from pages/home.js, components/catc-helpers.js)
/** Adds a notification for the other side of a booking. to = "student" or "professor". */
function addEvent(r, type, to, msg) {
    (r.events = r.events || []).push({ t: type, to, at: Date.now(), msg });
}

function myNotifications() {
    const u = currentUser();
    if (!u || u.role === "admin") {
        return [];
    }
    return DB.requests.filter(r => (u.role === "professor" ? r.professorId : r.studentId) === u.id)
        .flatMap(r => (r.events || []).filter(e => e.to === u.role))
        .sort((a, b) => b.at - a.at);
}

const unseenCount = () => myNotifications().filter(n => n.at > (currentUser().notifSeen || 0)).length;

/** Called from renderNav(): shows or hides the bell. */
function renderBell() {
    const u = currentUser(), b = bellBtn, show = !!(u && u.done && u.role !== "admin");
    b.style.display = show ? "" : "none";
    if (show) {
        updateBell();
    } else {
        closeNotif();
    }
}

/** Red dot on when something is new. */
function updateBell() {
    const b = bellBtn, n = unseenCount();
    b.classList.toggle("has", n > 0);
    b.setAttribute("aria-label", n ? `Notifications, ${n} new` : "Notifications");
}

function openNotif() {
    const p = notifPanel, u = currentUser(), list = myNotifications(), seen = u.notifSeen || 0;
    const groups = u.role === "professor" ? [["Requested", ["requested"]], ["Cancelled", ["cancelled", "cancel_requested"]]] : [["Accepted", ["accepted"]], ["Declined", ["declined", "rescheduled"]], ["Cancelled", ["cancelled"]]];
    const tiles = `<div class="notif-stats">${groups.map(([l, ts]) => `<div class="card notif-stat"><b>${list.filter(n => ts.includes(n.t)).length}</b><span class="mute small">${l}</span></div>`).join("")}</div>`;
    p.innerHTML = `<div class="notif-head"><b>Notifications</b><button class="link" id="nclose" aria-label="Close notifications">✕</button></div>` + tiles
        + (list.length ? list.slice(0, 30).map(n => `<div class="notif-item ${n.at > seen ? "new" : ""}"><span class="badge ${(NOTIF[n.t] || [n.t, ""])[1]}">${(NOTIF[n.t] || [n.t])[0]}</span><div>${escapeHtml(n.msg)}</div><time>${new Date(n.at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</time></div>`).join("") : '<div class="notif-empty mute">No notifications yet.</div>');
    p.hidden = false;
    bellBtn.setAttribute("aria-expanded", "true");
    $("#nclose").onclick = closeNotif;
    if (list.length && list[0].at > seen) {
        u.notifSeen = Date.now();
        save();
        updateBell();
    }
}

function closeNotif() {
    notifPanel.hidden = true;
    bellBtn.setAttribute("aria-expanded", "false");
}

bellBtn.onclick = () => (notifPanel.hidden ? openNotif() : closeNotif());
document.addEventListener("click", e => { if (!notifPanel.hidden && !e.target.closest("#notif, #bell")) { closeNotif(); } });
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeNotif(); } });
// With the backend, check for new notifications every 20 seconds without redrawing the page.
setInterval(() => { if (API_MODE && AUTH && !syncing) { pull().then(updateBell).catch(() => {}); } }, 20000);

// Draw the bell every time the navigation is drawn. This keeps the bell working even if navbar.js does not call renderBell().
const renderNavWithoutBell = renderNav;
renderNav = function () {
    renderNavWithoutBell();
    renderBell();
};
