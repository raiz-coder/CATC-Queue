/**
 * js/state/store.js
 * App state: persisted data (DB), UI state (uiState) and the signed-in user.
 */

// Demo storage: browser localStorage only. A real app needs a server + database.
let DB = { users: [], requests: [], session: null };
try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s && !API_MODE) {
        DB = JSON.parse(s);
    }
}
catch (e) {
    // Storage unavailable (e.g. private mode): continue in memory.
}

const save = () => {
    if (API_MODE) {
        void syncUp(); // errors are handled inside syncUp, so the promise is not awaited
        return;
    }
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DB));
    }
    catch (e) {
        // Storage unavailable: keep working in memory.
    }
};
DB.themeMode = DB.themeMode || "default";
DB.textSize = DB.textSize || "m";

const currentUser = () => DB.users.find(u => u.id === DB.session);

const uiState = {
    tab: "signup", err: "", page: "home", subject: null, sel: [], days: [], photo: "", profileUserId: null, maxRate: "", saved: false, viewId: null, viewBack: "home", resume: null, settingsTab: "profile", q: "", fDays: [], fTime: ""
};
