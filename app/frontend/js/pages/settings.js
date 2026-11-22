/**
 * pages/settings.js
 * Settings: profile settings, theme and design, security and privacy, history and activity, account.
 */

const SETTINGS_TABS = [["profile", "Profile settings"], ["theme", "Theme and design"], ["security", "Security and privacy"], ["history", "History and activity"], ["account", "Account"]];

/** Preview colours for each theme: background, line, text, accent. */
const THEME_PREVIEW = { default: ["#0a1a3f", "#2f5fb3", "#eaf1ff", "#4da3ff"], light: ["#ffffff", "#1f6feb", "#0a2a66", "#1f6feb"], dark: ["#000000", "#2c2c2c", "#ffffff", "#00e5ff"] };

/** Adds a line to the person's activity history (call save() afterwards). */
function logActivity(u, text) {
    u.log = u.log || [];
    u.log.unshift({ at: Date.now(), text });
    u.log.length = Math.min(u.log.length, 40);
}

/** The admin only gets Theme and design, and Security and privacy. */
function settingsTabs() {
    const u = currentUser();
    return u && u.role === "admin" ? SETTINGS_TABS.filter(t => ["theme", "security"].includes(t[0])) : SETTINGS_TABS;
}

/** Settings page: section list on the left, one section at a time on the right. */
function renderSettingsPage() {
    const u = currentUser();
    const tab = settingsTabs().some(t => t[0] === uiState.settingsTab) ? uiState.settingsTab : settingsTabs()[0][0];
    app.innerHTML = `<h1>Settings</h1><div id="panel"></div>`;
    ({ profile: profilePanel, theme: themePanel, security: securityPanel, history: historyPanel, account: accountPanel })[tab](u);
}

/** Sidebar index shown on the Settings page. */
function renderSettingsIndex(side) {
    const tab = settingsTabs().some(t => t[0] === uiState.settingsTab) ? uiState.settingsTab : settingsTabs()[0][0];
    side.innerHTML = `<div class="side-head"><b>Settings</b></div>
  <nav aria-label="Settings sections">${settingsTabs().map(([k, l]) => `<button class="sub" data-tab="${k}" ${k === tab ? 'aria-current="true"' : ""}><span class="grow">${l}</span></button>`).join("")}</nav>
  <div class="side-foot"><button id="sout" style="width:100%">Log out</button></div>`;
    side.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => {
        uiState.settingsTab = b.dataset.tab;
        closeDrawer();
        renderApp();
        scrollTo(0, 0);
    });
    $("#sout").onclick = logout;
}

function profilePanel(u) {
    const t = u.role === "professor";
    $("#panel").innerHTML = `<div class="card sec"><h2>Profile settings</h2>
  <div class="grid2"><div><label for="sn" style="margin-top:0">Full name</label><input id="sn" value="${escapeHtml(u.name)}" autocomplete="name"></div>
  <div><label for="se" style="margin-top:0">Account email</label><input id="se" type="email" value="${escapeHtml(u.email)}" autocomplete="email"></div></div>
  <p class="mute small">Account type: ${t ? "Professor" : "Student"}. Your photo, ${t ? "subjects, availability and department" : "interests and study hours"} are on the Profile page.</p>
  <div class="row"><button class="primary" id="spf">Save changes</button><button id="gp">Open Profile page</button><span id="m1" role="status"></span></div></div>`;
    $("#gp").onclick = () => goTo("profile");
    $("#spf").onclick = () => {
        const n = $("#sn").value.trim();
        const e = $("#se").value.trim().toLowerCase();
        if (!n || !e) {
            return showMessage("m1", "Name and email are required.", 1);
        }
        if (DB.users.some(x => x.id !== u.id && x.email === e)) {
            return showMessage("m1", "That email belongs to another account.", 1);
        }
        u.name = n;
        u.email = e;
        logActivity(u, "Changed name or email");
        save();
        renderNav();
        showMessage("m1", "Saved.");
    };
}

function themePanel() {
    const cur = currentTheme().id;
    $("#panel").innerHTML = `<div class="card sec"><h2>Theme</h2><p class="mute">Choose how CATC-Queue looks on this device.</p>
  <div class="themes">${THEMES.map(t => {
        const p = THEME_PREVIEW[t.id];
        return `<button class="theme-opt" data-th="${t.id}" aria-pressed="${t.id === cur}"><div class="swatch" style="--sbg:${p[0]};--sline:${p[1]};--sink:${p[2]};--sac:${p[3]}"><i></i><i></i></div>${t.label}</button>`;
    }).join("")}</div></div>
  <div class="card sec"><h2>Text size</h2><div class="seg" role="group" aria-label="Text size">${TEXT_SIZES.map(([k, l]) => `<button data-sz="${k}" aria-pressed="${k === DB.textSize}">${l}</button>`).join("")}</div></div>`;
    $("#panel").querySelectorAll("[data-th]").forEach(b => b.onclick = () => {
        DB.themeMode = b.dataset.th;
        save();
        applyTheme();
        themePanel();
        $(`[data-th="${b.dataset.th}"]`).focus();
    });
    $("#panel").querySelectorAll("[data-sz]").forEach(b => b.onclick = () => {
        DB.textSize = b.dataset.sz;
        save();
        applyTheme();
        themePanel();
        $(`[data-sz="${b.dataset.sz}"]`).focus();
    });
}

function securityPanel(u) {
    const t = u.role === "professor";
    const p = u.priv = u.priv || { showPhoto: true, shareContact: true, listed: true, showResume: true };
    const ck = (k, l) => `<label class="check"><input type="checkbox" data-k="${k}" ${p[k] !== false ? "checked" : ""}><span>${l}</span></label>`;
    $("#panel").innerHTML = `<div class="card sec"><h2>Privacy</h2>
  ${ck("shareContact", t ? "Share my phone and email with students after I confirm a booking" : "Share my contact number with professors after they confirm a booking")}
  ${t ? ck("showPhoto", "Show my profile picture to students") + ck("listed", "List my profile in professor search") + ck("showResume", "Show my resume to students") : ""}
  <span id="m2" role="status"></span></div>
  <div class="card sec"><h2>Password</h2>
  <label for="cp" style="margin-top:0">Current password</label><input id="cp" type="password" autocomplete="current-password">
  <div class="grid2"><div><label for="np">New password</label><input id="np" type="password" autocomplete="new-password"></div>
  <div><label for="kp">Confirm new password</label><input id="kp" type="password" autocomplete="new-password"></div></div>
  <div class="row" style="margin-top:14px"><button class="primary" id="spw">Update password</button><span id="m3" role="status"></span></div></div>`;
    $("#panel").querySelectorAll("[data-k]").forEach(c => c.onchange = () => {
        p[c.dataset.k] = c.checked;
        logActivity(u, "Changed privacy settings");
        save();
        showMessage("m2", "Privacy settings saved.");
    });
    $("#spw").onclick = () => {
        const c = $("#cp").value;
        const n = $("#np").value;
        const k = $("#kp").value;
        if (u.pw && hashPassword(c) !== u.pw) {
            return showMessage("m3", "Current password is incorrect.", 1);
        }
        if (n.length < 6) {
            return showMessage("m3", "Use at least 6 characters.", 1);
        }
        if (n !== k) {
            return showMessage("m3", "New passwords do not match.", 1);
        }
        u.pw = hashPassword(n);
        logActivity(u, "Changed password");
        save();
        ["cp", "np", "kp"].forEach(i => $("#" + i).value = "");
        showMessage("m3", "Password updated.");
    };
}

function historyPanel(u) {
    const professor = u.role === "professor";
    const fromRequests = DB.requests.filter(r => (professor ? r.professorId : r.studentId) === u.id).map(r => ({
        at: r.at,
        text: professor ? `${r.student} asked for ${r.subject}, ${r.day} at ${formatTime(r.time)} (${r.status})` : `Asked ${r.professor} for ${r.subject}, ${r.day} at ${formatTime(r.time)} (${r.status})`
    }));
    const items = [...(u.log || []), ...fromRequests].sort((a, b) => b.at - a.at).slice(0, 30);
    $("#panel").innerHTML = `<div class="card sec"><h2>History and activity</h2><p class="mute">Recent sign-ins, profile changes and session requests.</p>
  ${items.length ? `<ul class="log">${items.map(i => `<li><span>${escapeHtml(i.text)}</span><time>${new Date(i.at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</time></li>`).join("")}</ul>` : '<p class="mute">No activity yet.</p>'}
  ${(u.log || []).length ? '<p><button id="clh">Clear activity log</button></p>' : ""}</div>`;
    if ($("#clh")) {
        $("#clh").onclick = () => {
            u.log = [];
            save();
            historyPanel(u);
        };
    }
}

function accountPanel(u) {
    $("#panel").innerHTML = `<div class="card sec"><h2>Account</h2><p class="mute">${escapeHtml(u.email)} · ${u.role === "professor" ? "Professor" : "Student"} account</p><button id="lo">Log out</button></div>
  <div class="card sec"><h2>Delete account</h2><p class="mute">Removes your account and your sessions from this browser. This cannot be undone.</p>
  <button id="del" style="border-color:var(--err);color:var(--err)">Delete my account</button></div>`;
    $("#lo").onclick = logout;
    $("#del").onclick = () => {
        const d = $("#dlg");
        d.innerHTML = `<h2 style="margin-top:0">Delete your account?</h2><p>This cannot be undone.</p><div class="row"><button id="yes" style="border-color:var(--err);color:var(--err)">Yes, delete</button><button id="no">Keep my account</button></div>`;
        d.showModal();
        $("#no").onclick = () => d.close();
        $("#yes").onclick = () => {
            DB.requests = DB.requests.filter(r => r.studentId !== u.id && r.professorId !== u.id);
            if (API_MODE) { api("DELETE", "/api/users/me").catch(() => {}); AUTH = null; }
            DB.users = DB.users.filter(x => x.id !== u.id);
            DB.session = null;
            uiState.page = "home";
            save();
            d.close();
            renderApp();
        };
    };
}
