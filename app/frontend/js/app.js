/**
 * js/app.js
 * Router and bootstrap. Loaded last: maps (role, page) to a page function and starts the app.
 */

const PAGES = {
    student: { home: renderStudentHome, progress: renderStudentProgress },
    professor: { home: renderProfessorHome, progress: renderProfessorSchedule },
    admin: { home: renderAdminHome, progress: renderAdminTransactions },
    shared: { profile: renderProfilePage, settings: renderSettingsPage, help: renderHelpPage, view: renderViewProfilePage }
};

/** Draws the page that matches the current user and uiState.page. */
function renderApp() {
    renderNav();
    const user = currentUser();
    if (!user) {
        return renderAuthPage();
    }
    if (!user.done) {
        return renderOnboardingPage();
    }
    const page = PAGES[user.role][uiState.page] || PAGES.shared[uiState.page] || PAGES[user.role].home;
    page();
}

applyTheme();
renderApp();
