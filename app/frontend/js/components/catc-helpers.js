/**
 * js/components/catc-helpers.js
 * Status dots, calendar, admin page, demo accounts.
 */
NAV_PAGES.splice(1, 0, NAV_PAGES.splice(2, 1)[0]);
document.addEventListener("change", e => { if (e.target.id === "ss") { uiState.status = e.target.value; renderApp(); const x = $("#ss"); if (x) { x.focus(); } } });
const statusLabel = s => ({ GREEN: "Available", YELLOW: "On break", RED: "Unavailable" }[s] || "Available");
const statusBar = s => ["GREEN", "YELLOW", "RED"].map(c => `<span class="dot st-${c}" style="opacity:${c === (s || "GREEN") ? 1 : .22}" title="${statusLabel(s)}"></span>`).join("");
const studentOf = r => DB.users.find(x => x.id === r.studentId) || {};
const studentLine = r => [studentOf(r).sid, studentOf(r).course].filter(Boolean).map(escapeHtml).join(" · ");
const studentMatch = (r, q) => !q || (r.student + " " + (studentOf(r).sid || "")).toLowerCase().includes(q.toLowerCase());
const sfMatch = (r, k) => !k || (k === "history" ? ["declined", "cancelled", "rescheduled"].includes(r.status) : k === "pending" ? ["pending", "cancel_requested"].includes(r.status) : r.status === k);
const sfOk = r => sfMatch(r, uiState.sf);
function calendarHtml(list) {
  const l = list.filter(r => ["confirmed", "pending"].includes(r.status)).sort((a, b) => a.day.localeCompare(b.day) || a.time.localeCompare(b.time));
  return l.length ? l.map(r => `<div class="req"><b>${r.day}</b> · ${formatTime(r.time)} — ${escapeHtml(r.student)} (${escapeHtml(r.subject)}) <span class="badge ${r.status}">${r.status}</span></div>`).join("") : '<span class="mute">Nothing scheduled.</span>';
}
app.addEventListener("click", e => {
  const c = e.target.closest("[data-cx]"), s = e.target.closest("[data-st]"), f = e.target.closest("[data-sf]");
  if (c) {
    const r = DB.requests.find(x => x.id === c.dataset.cx), direct = r.status === "pending";
    r.status = direct ? "cancelled" : "cancel_requested";
    r.cancelRef = cancelRef(r);
    addEvent(r, r.status, "professor", `${r.student} ${direct ? "cancelled" : "asked to cancel"} the booking for ${r.subject} on ${r.day} at ${formatTime(r.time)}.`);
    save();
    renderStudentProgress();
  }
  if (s) { currentUser().status = s.dataset.st; save(); renderProfessorHome(); }
  if (f) { uiState.sf = f.dataset.sf; renderStudentProgress(); }
});
if (!API_MODE && !DB.users.some(u => u.id === "admin")) {
  DB.users.push({ id: "admin", name: "Admin", email: "admin@catc.edu", pw: hashPassword("admin123"), role: "admin", done: true, subjects: [] },
    { id: "demo-s", name: "Juan Reyes", email: "student@catc.edu", pw: hashPassword("student123"), role: "student", done: true, subjects: ["Programming"], sid: "2024-0001", course: "BSIT-3", hours: 5 },
    { id: "demo-t", name: "Ana Dela Cruz", email: "prof@catc.edu", pw: hashPassword("prof123"), role: "professor", done: true, subjects: ["Programming", "Databases"], dept: "IT", status: "GREEN", empId: "E-001", bio: "Handles IT make-up exams.", exp: "5 yrs", avail: { days: ["Mon", "Tue", "Wed", "Thu", "Fri"], from: "09:00", to: "15:00" }, cemail: "prof@catc.edu", phone: "0917 111 2222" });
  save();
}
