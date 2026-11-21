/**
 * js/components/bookingDialog.js
 * Booking dialog: choose subject, day and an open time slot.
 */

/** Opens the booking dialog for a professor. */
function openBookingDialog(t) {
    const d = $("#dlg");
    const a = t.avail;
    if (!a || !a.days.length) {
        d.innerHTML = `<h2 style="margin-top:0">${escapeHtml(t.name)} has no open hours yet</h2><p>Check back later.</p><button id="x">Close</button>`;
        d.showModal();
        $("#x").onclick = () => d.close();
        return;
    }
    const subs = t.subjects.map(s => `<option ${s === uiState.subject ? "selected" : ""}>${escapeHtml(s)}</option>`).join("");
    d.innerHTML = `<h2 style="margin-top:0">Book ${escapeHtml(t.name.split(" ")[0])}</h2>
  <label for="bs">Subject</label><select id="bs">${subs}</select>
  <div class="grid2"><div><label for="day">Exam date</label><input id="day" type="date" min="${new Date().toISOString().slice(0, 10)}"></div>
  <div><label for="time">Time</label><select id="time"></select></div></div>
  <label for="msg">What do you need help with?</label><textarea id="msg" rows="3"></textarea>
  <div class="err" id="be" role="alert"></div><div class="row" style="margin-top:16px"><button class="primary" id="send">Send request</button><button id="x">Cancel</button></div>`;
    const fill = () => {
        const day = $("#day").value, wd = day ? DAYS[(new Date(day + "T00:00").getDay() + 6) % 7] : "";
        const free = wd && a.days.includes(wd) ? hourlySlots(a).filter(s => !DB.requests.some(r => r.professorId === t.id && !["declined", "cancelled", "rescheduled"].includes(r.status) && r.day === day && r.time === s)) : [];
        $("#time").innerHTML = free.length ? free.map(s => `<option value="${s}">${formatTime(s)}</option>`).join("") : `<option value="">${day ? "No open slot" : "Pick a date"}</option>`;
    };
    fill();
    $("#day").onchange = fill;
    d.showModal();
    $("#x").onclick = () => d.close();
    $("#send").onclick = () => {
        if (!$("#time").value) { $("#be").textContent = "Pick an exam date with an open time."; return; }
        const ref = newBookingRef();
        DB.requests.push({
            id: "r" + Date.now(), studentId: currentUser().id, student: currentUser().name, professorId: t.id, professor: t.name, subject: $("#bs").value, day: $("#day").value, time: $("#time").value, msg: $("#msg").value.trim(), status: "pending", ref, at: Date.now()
        });
        save();
        d.innerHTML = `<h2 style="margin-top:0">Request sent</h2><p>Your booking reference number is <b>${ref}</b>. Give it to ${escapeHtml(t.name)}, who must type it to confirm. Track it under Schedules.</p><button class="primary" id="ok">Done</button>`;
        $("#ok").onclick = () => d.close();
    };
}
