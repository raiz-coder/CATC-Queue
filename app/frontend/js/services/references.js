/**
 * js/services/references.js
 * Reference numbers for bookings.
 *   Request    R3q-<date and time booked>-<request number>       student gives it to the professor
 *   Cancelled  C1n-<date and time booked>-<request number>
 *   Accepted   A33p-<date and time of the schedule>-<number>     sent to the student as authentication
 *   Declined   D53l-<date and time of the schedule>-<number>
 * The date and time part is yyyymmddhhmm. The number is the booking's request number.
 */
const pad2 = n => String(n).padStart(2, "0");
const stamp = d => `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}${pad2(d.getHours())}${pad2(d.getMinutes())}`;
const scheduleStamp = r => r.day.replace(/-/g, "") + r.time.replace(":", "");
const seqOf = ref => (String(ref || "").match(/-(\d+)$/) || [0, "0"])[1];

/** New unique request reference, for example R3q-202611220930-0007. */
function newBookingRef() {
    const base = "R3q-" + stamp(new Date()) + "-";
    let n = DB.requests.reduce((m, r) => Math.max(m, +seqOf(r.ref) || 0), 0) + 1, ref;
    do { ref = base + String(n++).padStart(4, "0"); } while (DB.requests.some(r => r.ref === ref));
    return ref;
}
const cancelRef = r => "C1n" + String(r.ref || "").slice(3);
const answerRef = (r, prefix) => `${prefix}-${scheduleStamp(r)}-${seqOf(r.ref).padStart(4, "0")}`;

/** Reference numbers, room and reply lines shown on booking cards. */
function txInfo(r, withRequest) {
    const L = (k, v) => v ? `<div class="mute small">${k}: <b>${escapeHtml(v)}</b></div>` : "";
    return (withRequest ? L("Request no.", r.ref) : "") + L("Cancellation no.", r.cancelRef) + L("Authentication no.", r.acceptRef) + L("Decline no.", r.declineRef)
        + (r.room || r.campus ? `<div class="mute small">Room and campus: <b>${escapeHtml([r.room, r.campus].filter(Boolean).join(", "))}</b></div>` : "") + L("Reply", r.reply);
}
