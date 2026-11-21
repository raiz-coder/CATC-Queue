/**
 * js/utils/format.js
 * Pure formatting helpers for time slots and availability text.
 */

const pad = n => String(n).padStart(2, "0");

const formatTime = t => {
    const h = +t.slice(0, 2);
    return (h % 12 || 12) + ":" + t.slice(3) + (h < 12 ? " AM" : " PM");
};

const hourlySlots = a => {
    const r = [];
    for (let h = +a.from.slice(0, 2); h < +a.to.slice(0, 2); h++) {
        r.push(pad(h) + ":00");
    }
    return r;
};

const formatAvailability = a => a && a.days.length ? `${a.days.join(", ")} · ${formatTime(a.from)}–${formatTime(a.to)}` : "Not set";
