/**
 * pages/profile.js
 * Profile page for students and professors.
 */

/** Profile form (student or professor fields). */
function renderProfilePage() {
    const u = currentUser();
    const t = u.role === "professor";
    if (uiState.profileUserId !== u.id) {
        uiState.profileUserId = u.id;
        uiState.sel = [...u.subjects];
        uiState.days = [...(u.avail ? u.avail.days : [])];
        uiState.photo = u.photo || "";
        uiState.resume = u.resume || null;
    }
    const a = u.avail || { from: "16:00", to: "20:00" };
    const rt = getRating({ id: u.id, real: 1 });
    const extraFields = `<div class="grid2"><div><label for="country">Country</label><input id="country" list="countries" value="${escapeHtml(u.country)}" autocomplete="country-name"><datalist id="countries">${COUNTRIES.map(c => `<option value="${c}">`).join("")}</datalist></div>
  <div><label for="age">Age</label><input id="age" type="number" min="10" max="100" value="${escapeHtml(u.age)}"></div></div>
  ${t ? `<label for="rs">Resume (PDF or Word, up to 1.5 MB)</label><input id="rs" type="file" accept=".pdf,.doc,.docx,application/pdf"><div class="small" style="margin-top:6px"><span id="rsn">${uiState.resume ? escapeHtml(uiState.resume.name) : "No resume uploaded"}</span> <button type="button" class="link" id="rsx" ${uiState.resume ? "" : "hidden"}>Remove</button></div>` : ""}`;
    app.innerHTML = `<h1>My profile</h1><div class="card"><p class="mute small">Login ID: ${escapeHtml((t ? u.empId : u.sid) || u.email)} (you can also log in with your email)</p>
  <div class="row"><span id="pv">${avatar(uiState.photo, u.name, "big")}</span><div><label for="ph" style="margin-top:0">Profile picture</label><input id="ph" type="file" accept="image/*"></div></div>
  <label>${t ? "Subjects you teach" : "Interests"}</label>${subjectChips(uiState.sel)}
  ${t ? `<label>Time availability</label><div class="chips" role="group">${DAYS.map(d => `<button type="button" class="chip" aria-pressed="${uiState.days.includes(d)}" data-d="${d}">${d}</button>`).join("")}</div>
  <div class="grid2"><div><label for="from">From</label><input id="from" type="time" value="${a.from}"></div><div><label for="to">To</label><input id="to" type="time" value="${a.to}"></div></div>
  <label>Student ratings</label><div>${ratingLabel({ id: u.id, real: 1 })}</div>
  <div class="grid2"><div><label for="phone">Contact number</label><input id="phone" type="tel" value="${escapeHtml(u.phone)}"></div>
  <div><label for="cem">Contact email</label><input id="cem" type="email" value="${escapeHtml(u.cemail || u.email)}"></div></div>
  <div class="grid2"><div><label for="dept">Department</label><select id="dept">${DEPTS.map(d => `<option ${(u.dept || "IT") === d ? "selected" : ""}>${d}</option>`).join("")}</select></div>
  <div><label for="exp">Experience</label><input id="exp" value="${escapeHtml(u.exp)}"></div></div>
  <label for="bio">About you</label><textarea id="bio" rows="3">${escapeHtml(u.bio)}</textarea>`
        : `<div class="grid2"><div><label for="phone">Contact number</label><input id="phone" type="tel" value="${escapeHtml(u.phone)}"></div>
  <div><label for="hrs">Study hours per week</label><input id="hrs" type="number" min="1" max="80" value="${u.hours || 5}"></div></div>
  <div class="grid2"><div><label for="sid">Student ID</label><input id="sid" value="${escapeHtml(u.sid || "")}"></div><div><label for="crs">Course and year</label><input id="crs" value="${escapeHtml(u.course || "")}" placeholder="BSIT-3"></div></div>`}
  ${extraFields}
  <div class="err" role="alert" id="pe"></div>
  <p><button class="primary" id="sv">Save profile</button> <span class="ok" id="ok">${uiState.saved ? "Saved." : ""}</span></p></div>`;
    bindChipToggles(uiState.sel);
    if (t) {
        bindChipToggles(uiState.days, "d");
    }
    $("#ph").onchange = e => {
        const f = e.target.files[0];
        if (!f) {
            return;
        }
        const im = new Image();
        im.onload = () => {
            const c = document.createElement("canvas");
            c.width = c.height = 160;
            const s = Math.min(im.width, im.height);
            c.getContext("2d").drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 160, 160);
            uiState.photo = c.toDataURL("image/jpeg", .8);
            $("#pv").innerHTML = avatar(uiState.photo, u.name, "big");
        };
        im.src = URL.createObjectURL(f);
    };
    if (t) {
        $("#rs").onchange = e => {
            const f = e.target.files[0];
            if (!f) {
                return;
            }
            if (!/\.(pdf|docx?)$/i.test(f.name)) {
                e.target.value = "";
                return $("#pe").textContent = "Resume must be a PDF or Word file.";
            }
            if (f.size > RESUME_MAX_BYTES) {
                e.target.value = "";
                return $("#pe").textContent = "Resume is too large. Maximum size is 1.5 MB.";
            }
            const reader = new FileReader();
            reader.onload = () => {
                uiState.resume = { name: f.name, data: reader.result };
                $("#rsn").textContent = f.name;
                $("#rsx").hidden = false;
                $("#pe").textContent = "";
            };
            reader.readAsDataURL(f);
        };
        $("#rsx").onclick = () => {
            uiState.resume = null;
            $("#rs").value = "";
            $("#rsn").textContent = "No resume uploaded";
            $("#rsx").hidden = true;
        };
    }
    $("#sv").onclick = () => {
        if (!uiState.sel.length) {
            return $("#pe").textContent = "Choose at least one subject.";
        }
        if (t && $("#from").value >= $("#to").value) {
            return $("#pe").textContent = "Availability end time must be after the start time.";
        }
        const age = $("#age").value ? +$("#age").value : null;
        if (age !== null && (age < 10 || age > 100)) {
            return $("#pe").textContent = "Enter an age between 10 and 100.";
        }
        u.subjects = [...uiState.sel];
        u.photo = uiState.photo;
        u.phone = $("#phone").value.trim();
        u.country = $("#country").value.trim();
        u.age = age;
        if (t) {
            u.avail = { days: DAYS.filter(d => uiState.days.includes(d)), from: $("#from").value, to: $("#to").value };
            u.cemail = $("#cem").value.trim();
            u.dept = $("#dept").value;
            u.exp = $("#exp").value.trim() || "New";
            u.bio = $("#bio").value.trim();
            u.resume = uiState.resume;
        }
        else {
            u.hours = +$("#hrs").value || 5;
            const sid = $("#sid").value.trim();
            if (sid && DB.users.some(x => x.id !== u.id && x.sid === sid)) { return $("#pe").textContent = "That Student ID belongs to another account."; }
            u.sid = sid; u.course = $("#crs").value.trim();
        }
        logActivity(u, "Updated profile");
        save();
        uiState.saved = true;
        renderNav();
        $("#ok").textContent = "Saved.";
    };
}
