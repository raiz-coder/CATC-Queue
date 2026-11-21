/**
 * pages/auth.js
 * Pre-dashboard pages: sign up / log in, role choice, first-time setup.
 */

const SOCIAL = {
    google: {
        name: "Google",
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>'
    },
    facebook: {
        name: "Facebook",
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#1877F2" d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.52c-1.49 0-1.96.93-1.96 1.88V12h3.33l-.53 3.47h-2.8v8.38A12 12 0 0 0 24 12z"/><path fill="#fff" d="M16.67 15.47L17.2 12h-3.33V9.75c0-.95.47-1.88 1.96-1.88h1.52V4.93s-1.38-.24-2.69-.24c-2.74 0-4.53 1.66-4.53 4.67V12H7.08v3.47h3.05v8.38a12.1 12.1 0 0 0 3.74 0v-8.38h2.8z"/></svg>'
    }
};

const SOCIAL_HTML = `<div class="or">or</div>${Object.entries(SOCIAL).map(([k, p]) => `<button type="button" class="social" data-social="${k}">${p.icon}Continue with ${p.name}</button>`).join("")}`;

/**
 * Demo social sign-in. It asks for a name and email and creates or opens the matching account.
 * Real Google and Facebook sign-in needs a server and app keys from each provider.
 */
function openSocialDialog(key) {
    const p = SOCIAL[key];
    const d = $("#dlg");
    d.innerHTML = `<h2 style="margin-top:0">Continue with ${p.name}</h2>
  <p class="mute small">Demo mode: no real ${p.name} account is used. Enter the name and email to continue with.</p>
  <label for="soc-n" style="margin-top:0">Full name</label><input id="soc-n" autocomplete="name">
  <label for="soc-e">Email</label><input id="soc-e" type="email" autocomplete="email">
  <div class="err" role="alert" id="soc-m"></div>
  <div class="row" style="margin-top:16px"><button class="primary" id="soc-go">Continue</button><button id="soc-no">Cancel</button></div>`;
    d.showModal();
    $("#soc-no").onclick = () => d.close();
    $("#soc-go").onclick = () => {
        const e = $("#soc-e").value.trim().toLowerCase();
        const n = $("#soc-n").value.trim();
        if (!/^\S+@\S+\.\S+$/.test(e)) {
            $("#soc-m").textContent = "Enter a valid email address.";
            return;
        }
        if (!DB.users.some(x => x.email === e) && !n) {
            $("#soc-m").textContent = "Enter your name.";
            return;
        }
        socialSignIn(key, n, e, "");
    };
}

/** Creates or opens the account for a social identity, then opens the dashboard. */
function socialSignIn(key, name, email, photo) {
    let u = DB.users.find(x => x.email === email);
    if (u) {
        logActivity(u, "Logged in with " + SOCIAL[key].name);
        if (!u.photo && photo) {
            u.photo = photo;
        }
    }
    else {
        u = { id: "u" + Date.now(), name, email, pw: null, provider: key, role: null, done: false, subjects: [], photo: photo || "" };
        DB.users.push(u);
        logActivity(u, "Created account with " + SOCIAL[key].name);
    }
    DB.session = u.id;
    uiState.err = "";
    uiState.page = "home";
    save();
    const d = $("#dlg");
    if (d.open) {
        d.close();
    }
    renderApp();
}

const authError = msg => {
    uiState.err = msg;
    renderAuthPage();
};

let googleClient = null;

/** Opens Google's own account chooser. Google verifies the person; we only receive a verified email. */
function startGoogleSignIn() {
    if (!GOOGLE_CLIENT_ID) {
        return openSocialDialog("google");
    }
    if (!(window.google && google.accounts && google.accounts.oauth2)) {
        return authError("Google sign-in is still loading. Try again in a moment.");
    }
    googleClient = googleClient || google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        callback: onGoogleToken,
        error_callback: err => {
            if (err.type !== "popup_closed") {
                authError("Google sign-in did not finish. Try again.");
            }
        }
    });
    googleClient.requestAccessToken({ prompt: "select_account" });
}

async function onGoogleToken(resp) {
    try {
        if (!resp.access_token) {
            throw new Error("no token");
        }
        const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: "Bearer " + resp.access_token } });
        const g = await r.json();
        if (!g.email || g.email_verified === false) {
            throw new Error("unverified");
        }
        socialSignIn("google", g.name || g.email.split("@")[0], g.email.toLowerCase(), g.picture || "");
    }
    catch (err) {
        authError("Google could not verify this account. Try again.");
    }
}

/** Sign-up / log-in with a separate student portal and professor portal. */
function renderAuthPage() {
    const su = uiState.tab === "signup", pr = uiState.portal === "professor";
    const f = (id, l, ph = "") => `<label for="${id}">${l}</label><input id="${id}" placeholder="${ph}" autocomplete="off">`;
    app.innerHTML = `<div class="narrow"><h1>Missed an exam? Book a make-up schedule.</h1>
  <p class="lead">Students book make-up exams with their professors. Professors post availability and manage requests.</p>
  <div class="card"><div class="tabs" role="group" aria-label="Portal"><button data-pt="student" class="${pr ? "" : "on"}">Student portal</button><button data-pt="professor" class="${pr ? "on" : ""}">Professor portal</button></div>
  <div class="tabs"><button data-t="signup" class="${su ? "on" : ""}">Sign up</button><button data-t="login" class="${su ? "" : "on"}">Log in</button></div>
  ${su ? f("n", "Full name") + (pr ? f("emp", "Employee ID") + `<label for="dp">Department</label><select id="dp">${DEPTS.map(d => `<option>${d}</option>`).join("")}</select>` : f("sid", "Student ID") + f("crs", "Course and year", "BSIT-3")) : ""}
  <label for="e">${su ? "Email" : pr ? "Email or Employee ID" : "Email or Student ID"}</label><input id="e" type="${su ? "email" : "text"}" autocomplete="username">
  <label for="p">Password</label><input id="p" type="password" autocomplete="${su ? "new-password" : "current-password"}">
  <div class="err" role="alert">${escapeHtml(uiState.err)}</div>
  <p><button class="primary" id="go" style="width:100%">${su ? "Create " + (pr ? "professor" : "student") + " account" : "Log in"}</button></p>
  <p class="mute small">Demo: student@catc.edu or 2024-0001 / student123 · prof@catc.edu or E-001 / prof123 · admin@catc.edu / admin123</p></div></div>`;
    app.querySelectorAll("[data-pt]").forEach(b => b.onclick = () => { uiState.portal = b.dataset.pt; uiState.err = ""; renderAuthPage(); });
    app.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { uiState.tab = b.dataset.t; uiState.err = ""; renderAuthPage(); });
    $("#go").onclick = () => authSubmit(su, pr);
    app.querySelectorAll("input, select").forEach(i => i.oninput = () => i.classList.remove("bad"));
}

/** Show an error without re-rendering: only the wrong fields get a red outline. */
function authFail(m, ...bad) {
    app.querySelectorAll("input, select").forEach(i => i.classList.remove("bad"));
    bad.forEach(id => $("#" + id).classList.add("bad"));
    app.querySelector(".err").textContent = m;
    if (bad[0]) { $("#" + bad[0]).focus(); }
}

async function authSubmit(su, pr) {
    const g = id => ($("#" + id) ? $("#" + id).value.trim() : ""), role = pr ? "professor" : "student";
    const e = g("e").toLowerCase(), p = $("#p").value, fail = authFail;
    if (!e || !p) { return fail("Fill in every field.", ...(!e ? ["e"] : []), ...(!p ? ["p"] : [])); }
    if (su) {
        const n = g("n"), sid = g("sid"), crs = g("crs"), emp = g("emp");
        const need = pr ? { n, emp } : { n, sid, crs }, missing = Object.keys(need).filter(k => !need[k]);
        if (missing.length) { return fail("Fill in every field.", ...missing); }
        if (p.length < 6) { return fail("Use a password with at least 6 characters.", "p"); }
        const rec = pr ? { name: n, email: e, empId: emp, dept: $("#dp").value, status: "GREEN" } : { name: n, email: e, sid, course: crs };
        if (API_MODE) {
            try { await api("POST", "/api/auth/register", { ...rec, role, password: p }); } catch (x) { return fail(x.message, "e", pr ? "emp" : "sid"); }
            return apiLogin(e, p, role);
        }
        if (DB.users.some(x => x.email === e || (sid && (x.sid || "").toLowerCase() === sid.toLowerCase()) || (emp && (x.empId || "").toLowerCase() === emp.toLowerCase()))) { return fail("That email or ID already has an account. Log in instead.", "e", pr ? "emp" : "sid"); }
        const nu = { ...rec, role, id: "u" + Date.now(), pw: hashPassword(p), done: false, subjects: [] };
        DB.users.push(nu); DB.session = nu.id; logActivity(nu, "Created account");
    } else {
        if (API_MODE) { return apiLogin(e, p, role); }
        const ex = DB.users.find(x => (x.role === role || x.role === "admin") && (x.email === e || (x.sid || "").toLowerCase() === e || (x.empId || "").toLowerCase() === e));
        if (!ex) { return fail("No account found with that email or ID in this portal.", "e"); }
        if (ex.pw !== hashPassword(p)) { return fail("Wrong password.", "p"); }
        DB.session = ex.id; logActivity(ex, "Logged in");
    }
    uiState.err = ""; uiState.page = "home"; save(); renderApp();
}

/** Student or professor choice after sign-up. */
function renderRolePage() {
    app.innerHTML = `<h1>What brings you here?</h1><p class="lead">Pick one. You can create a separate account for the other role later.</p>
  <div class="roles"><button class="role card" data-r="student"><b>I want to learn</b><span>Find your professor and book a make-up exam.</span></button>
  <button class="role card" data-r="professor"><b>I am a professor</b><span>Post your availability and manage booking requests.</span></button></div>`;
    app.querySelectorAll("[data-r]").forEach(b => b.onclick = () => {
        const u = currentUser();
        u.role = b.dataset.r;
        u.done = false;
        uiState.sel = [];
        save();
        renderApp();
    });
}

/** First-time setup: subjects and basics. */
function renderOnboardingPage() {
    const u = currentUser();
    const t = u.role === "professor";
    if (!uiState.sel.length && u.subjects.length) {
        uiState.sel = [...u.subjects];
    }
    app.innerHTML = `<h1>${t ? "Set up your professor profile" : "Which subjects are you enrolled in?"}</h1>
  <p class="lead">${t ? "Choose the subjects you teach and tell students about yourself. You can add a photo and availability next." : "Choose your interests. We'll show these subjects first."}</p>
  <div class="card">${subjectChips(uiState.sel)}
  ${t ? `<label for="bio">About you</label><textarea id="bio" rows="3" placeholder="Your background and how you teach">${escapeHtml(u.bio || "")}</textarea>
  <div class="grid2"><div><label for="dept">Department</label><select id="dept">${DEPTS.map(d => `<option ${(u.dept || "IT") === d ? "selected" : ""}>${d}</option>`).join("")}</select></div>
  <div><label for="exp">Experience</label><input id="exp" value="${escapeHtml(u.exp || "")}" placeholder="e.g. 3 yrs"></div></div>` :
        `<div class="grid2"><div><label for="sid">Student ID</label><input id="sid" value="${escapeHtml(u.sid || "")}"></div><div><label for="crs">Course and year</label><input id="crs" value="${escapeHtml(u.course || "")}" placeholder="BSIT-3"></div></div>`}
  <div class="err" role="alert">${escapeHtml(uiState.err)}</div>
  <p><button class="primary" id="fin">Continue to dashboard</button> <button class="link" id="back">Change role</button></p></div>`;
    bindChipToggles(uiState.sel);
    $("#back").onclick = () => {
        u.role = null;
        save();
        renderApp();
    };
    $("#fin").onclick = () => {
        if (!uiState.sel.length) {
            uiState.err = "Choose at least one subject.";
            return renderOnboardingPage();
        }
        u.subjects = [...uiState.sel];
        u.phone = u.phone || "";
        if (t) {
            u.bio = $("#bio").value.trim() || "New professor on CATC-Queue.";
            u.dept = $("#dept").value; u.status = "GREEN"; u.empId = u.empId || "E-" + Date.now().toString().slice(-6);
            u.exp = $("#exp").value.trim() || "New";
            u.avail = u.avail || { days: ["Mon", "Tue", "Wed", "Thu", "Fri"], from: "16:00", to: "20:00" };
            u.cemail = u.cemail || u.email;
        }
        else {
            const sid = $("#sid").value.trim();
            if (!sid || !$("#crs").value.trim()) { uiState.err = "Fill in Student ID and Course and year."; return renderOnboardingPage(); }
            if (DB.users.some(x => x.id !== u.id && x.sid === sid)) { uiState.err = "That Student ID is already registered to another account."; return renderOnboardingPage(); }
            u.sid = sid; u.course = $("#crs").value.trim(); u.hours = u.hours || 5;
        }
        u.done = true;
        uiState.err = "";
        uiState.sel = [];
        uiState.page = "home";
        save();
        renderApp();
    };
}