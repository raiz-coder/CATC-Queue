/**
 * js/utils/security.js
 * Password hashing. DEMO ONLY: use a server and bcrypt/argon2 in production.
 */

const hashPassword = s => {
    let h = 0;
    for (const c of s) {
        h = (h * 31 + c.charCodeAt(0)) | 0;
    }
    return String(h);
};
