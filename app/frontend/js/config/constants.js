/**
 * js/config/constants.js
 * Static configuration: subjects, weekdays and the storage key.
 */

const STORAGE_KEY = "catcqueue";

/** Backend URL, e.g. "http://localhost:8080". Leave empty to run in the browser only (demo mode). */
const API_BASE = "";
const API_MODE = !!API_BASE; // unchanged so previously saved accounts keep working

/**
 * Google sign-in. Paste your OAuth "Web application" Client ID between the quotes
 * (Google Cloud Console > APIs & Services > Credentials). While it is empty, the
 * Google button falls back to the demo dialog. The Client ID is public, so it is safe here.
 */
const GOOGLE_CLIENT_ID = "";

const SUBJECTS = [["Programming","Java, web, algorithms"],["Databases","SQL and design"],["Mathematics","Algebra, calculus"],["Physics","Mechanics and more"],["English","Writing and literature"],["Accounting","Basics to advanced"],["Networking","Cisco and security"],["Statistics","Data and probability"]];
const DEPTS = ["IT","Engineering","Business","Education","Arts & Sciences"];

/** Countries offered in the profile form (free text is also accepted). */
const COUNTRIES = ["Philippines", "United States", "Canada", "United Kingdom", "Australia", "New Zealand", "Singapore", "Malaysia", "Indonesia", "Thailand", "Vietnam", "Japan", "South Korea", "China", "Hong Kong", "Taiwan", "India", "Pakistan", "Bangladesh", "United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Spain", "France", "Germany", "Italy", "Netherlands", "Ireland", "Sweden", "Norway", "Switzerland", "Brazil", "Mexico", "Argentina", "Nigeria", "Kenya", "South Africa", "Egypt", "Other"];

/** Largest resume a professor can upload (kept small so browser storage does not fill up). */
const RESUME_MAX_BYTES = 1.5 * 1024 * 1024;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
