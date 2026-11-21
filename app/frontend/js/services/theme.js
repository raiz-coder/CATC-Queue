/**
 * js/services/theme.js
 * Three themes: Default (original dark green), Light (white, blue outlines) and Dark (black, cyan highlights).
 */

const THEMES = [
    { id: "default", label: "Default (navy blue)", icon: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>' },
    { id: "light", label: "Light (white)", icon: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>' },
    { id: "dark", label: "Dark (black)", icon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>' }
];

/** The theme saved in DB (falls back to Default). */
const currentTheme = () => THEMES.find(t => t.id === DB.themeMode) || THEMES[0];

/** The theme after the current one: Default, Light, Dark, then back to Default. */
const nextTheme = () => THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];

/** Applies the saved theme to the page. */
const TEXT_SIZES = [["s", "Small", 15], ["m", "Default", 16], ["l", "Large", 18]];

function applyTheme() {
    document.documentElement.dataset.theme = currentTheme().id;
    const size = TEXT_SIZES.find(x => x[0] === DB.textSize) || TEXT_SIZES[1];
    document.documentElement.style.fontSize = size[2] + "px";
}
