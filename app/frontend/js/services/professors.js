/**
 * js/services/professors.js
 * Professor data access: listing (with privacy rules) and ratings.
 */

const sharesContact = x => !(x.priv && x.priv.shareContact === false);

/** Public (privacy-filtered) view of a real professor account. */
function toPublicProfessor(x) {
    const p = x.priv || {};
    return {
        id: x.id, name: x.name, subjects: x.subjects, dept: x.dept, status: x.status || "GREEN", empId: x.empId, bio: x.bio, exp: x.exp,
        photo: p.showPhoto === false ? "" : x.photo,
        avail: x.avail,
        phone: sharesContact(x) ? x.phone : "",
        email: sharesContact(x) ? x.cemail : "",
        country: x.country || "",
        age: x.age || null,
        resume: p.showResume === false ? null : (x.resume || null),
        real: 1
    };
}

/** Seed professors plus listed real professors, honouring privacy settings. */
function getAllProfessors() {
    const real = DB.users
        .filter(x => x.role === "professor" && x.done && !(x.priv && x.priv.listed === false))
        .map(toPublicProfessor);
    return [...real, ...(API_MODE ? [] : SEED)];
}

/** Finds one professor (real or sample) by id, even if unlisted. Returns null when missing. */
function findProfessor(id) {
    const x = DB.users.find(u => u.id === id && u.role === "professor" && u.done);
    return x ? toPublicProfessor(x) : SEED.find(t => t.id === id) || null;
}

/** Average rating and count for a professor. */
function getRating(t) {
    const b = t.real ? { r: 0, c: 0 } : { r: t.rating, c: t.count };
    const rs = DB.requests.filter(x => x.professorId === t.id && x.rating);
    const c = b.c + rs.length;
    return c ? { avg: (b.r * b.c + rs.reduce((a, x) => a + x.rating, 0)) / c, count: c } : { avg: 0, count: 0 };
}
