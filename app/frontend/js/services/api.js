/**
 * js/services/api.js
 * Talks to the Spring Boot backend when API_BASE is set. Without it the app runs in the browser only.
 */
let AUTH = null, SNAP = { me: "", reqs: {} }, syncing = false, dirty = false;
async function api(method, path, body) {
    const r = await fetch(API_BASE + path, { method, headers: { "Content-Type": "application/json", ...(AUTH ? { Authorization: AUTH } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const t = await r.text(), d = t ? JSON.parse(t) : null;
    if (!r.ok) { throw new Error((d && d.message) || (r.status === 401 ? "Incorrect ID, email or password." : "Request failed (" + r.status + ")")); }
    return d;
}
function takeSnapshot() {
    SNAP.me = JSON.stringify(currentUser() || {});
    SNAP.reqs = Object.fromEntries(DB.requests.map(r => [r.id, JSON.stringify(r)]));
}
async function pull() {
    const d = await api("GET", "/api/data");
    DB.users = d.users; DB.requests = d.requests; DB.session = d.me;
    takeSnapshot();
}
async function apiLogin(ident, pw, portal) {
    AUTH = "Basic " + btoa(ident + ":" + pw);
    try { await pull(); } catch (x) { AUTH = null; return authFail(x.message, "e", "p"); }
    const u = currentUser();
    if (u.role !== portal && u.role !== "admin") { AUTH = null; DB.session = null; return authFail("This account belongs to the other portal.", "e"); }
    uiState.err = ""; uiState.page = "home"; renderApp();
}
async function pushChanges() {
    const u = currentUser();
    if (!u || !AUTH) { return; }
    if (JSON.stringify(u) !== SNAP.me) { await api("PUT", "/api/users/me", u); }
    for (const r of DB.requests) { if (SNAP.reqs[r.id] !== JSON.stringify(r)) { await api("PUT", "/api/requests/" + r.id, r); } }
    for (const id of Object.keys(SNAP.reqs)) { if (!DB.requests.some(r => r.id === id)) { await api("DELETE", "/api/requests/" + id); } }
    takeSnapshot();
}
async function syncUp() {
    if (syncing) { dirty = true; return; }
    syncing = true;
    try { do { dirty = false; await pushChanges(); } while (dirty); }
    catch (x) { alert("Could not save: " + x.message); pull().then(renderApp).catch(() => {}); }
    finally { syncing = false; }
}
setInterval(() => { if (API_MODE && AUTH && !syncing && uiState.page === "home" && !$("#dlg").open) { pull().then(renderApp).catch(() => {}); } }, 30000);