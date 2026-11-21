/**
 * js/components/clockCalendar.js
 * Right-hand panel with a live clock (exact date and time) and a month calendar.
 * Shown on every dashboard page for signed-in users on wide screens.
 */
let clockTimer = null;
let calView = null; // first day of the month the calendar is showing

/** Shows or hides the right panel. Called from renderNav() on every render. */
function renderRail() {
    const rail = $("#rail"), u = currentUser(), shell = $(".shell");
    const show = !!(u && u.role && u.done);
    rail.hidden = !show;
    shell.dataset.rail = show ? "on" : "off";
    if (!show) {
        clearInterval(clockTimer);
        rail.innerHTML = "";
        return;
    }
    if (rail.firstChild) {
        return; // already built, so the clock keeps ticking and the month stays put
    }
    const now = new Date();
    calView = new Date(now.getFullYear(), now.getMonth(), 1);
    rail.innerHTML = `<div class="clock-card" id="clk" role="timer" aria-label="Current date and time"><div class="clock-time" id="clk-t"></div><div class="clock-date" id="clk-d"></div></div>
  <div class="cal" id="cal"></div>`;
    drawCalendar();
    tickClock();
    clockTimer = setInterval(tickClock, 1000);
}

/** Updates the clock every second and redraws the calendar when the day changes. */
function tickClock() {
    const t = $("#clk-t");
    if (!t) {
        clearInterval(clockTimer);
        return;
    }
    const now = new Date();
    t.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    $("#clk-d").textContent = now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    if ($("#cal").dataset.today !== now.toDateString()) {
        drawCalendar();
    }
}

/** Month grid with today highlighted and previous/next month buttons. */
function drawCalendar() {
    const cal = $("#cal"), now = new Date(), y = calView.getFullYear(), m = calView.getMonth();
    const lead = (new Date(y, m, 1).getDay() + 6) % 7, total = new Date(y, m + 1, 0).getDate();
    const cells = Array(lead).fill("<span></span>");
    for (let d = 1; d <= total; d++) {
        const today = d === now.getDate() && m === now.getMonth() && y === now.getFullYear();
        cells.push(`<span class="${today ? "today" : ""}" ${today ? 'aria-current="date"' : ""}>${d}</span>`);
    }
    cal.dataset.today = now.toDateString();
    cal.innerHTML = `<div class="cal-head"><button id="cprev" aria-label="Previous month">‹</button><b>${calView.toLocaleDateString([], { month: "long", year: "numeric" })}</b><button id="cnext" aria-label="Next month">›</button></div>
  <div class="cal-grid">${DAYS.map(d => `<i>${d.slice(0, 2)}</i>`).join("")}${cells.join("")}</div>
  <button class="link" id="ctoday">Today</button>`;
    $("#cprev").onclick = () => { calView = new Date(y, m - 1, 1); drawCalendar(); };
    $("#cnext").onclick = () => { calView = new Date(y, m + 1, 1); drawCalendar(); };
    $("#ctoday").onclick = () => { calView = new Date(now.getFullYear(), now.getMonth(), 1); drawCalendar(); };
}
