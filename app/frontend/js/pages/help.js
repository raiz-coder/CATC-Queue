/**
 * pages/help.js
 * Help page with role-specific FAQ.
 */

/** Help / FAQ page. */
function renderHelpPage() {
    const t = currentUser().role === "professor";
    const faq = t ? [
        ["How do students find me", "Make sure your profile is listed in Settings > Security and privacy, and that you picked your subjects and available days on the Profile page."],
        ["How do I accept a booking", "Open Home. Pending requests appear there with Accept and Decline buttons. Accepted sessions appear in the sidebar schedule and under Schedules."],
        ["How do ratings work", "Students can rate you from 1 to 5 stars after you confirm a session. Your average shows on your Profile page."],
        ["Can I change my hours", "Yes. Update your days and time range on the Profile page. Existing confirmed sessions are not removed."]
    ] : [
        ["How do I book a professor", "On Home, pick a subject, choose a professor and press Book a session. Select a day and an open time, then send the request."],
        ["Where do I see my sessions", "Your upcoming sessions are listed in the sidebar. Open Schedules for each professor, their domain and the request status."],
        ["How do I rate a professor", "After a professor confirms a session, rating buttons from 1 to 5 stars appear on that session in Schedules."],
        ["Who can see my contact number", "Only professors with a confirmed booking with you, and only if Share contact is on in Settings > Security and privacy."]
    ];
    faq.push(["What is the booking reference number", "Every booking gets a unique number like CQ-261121-AB7K2. It shows under Schedules. Give it to your professor; they must type it exactly to accept."], ["What is the subjects panel", "The sidebar lists your subjects, " + (t ? "your department and open hours, " : "filters for department, status and time, ") + "and your upcoming sessions. Select a subject to filter Home, or press Edit to change the list."], ["How do I change the theme", "Open Settings > Theme and design and pick Default, Light or Dark. You can also change the text size there."], ["How do I change my password", "Go to Settings > Security and privacy. You need your current password."], ["Is my data safe", "This demo keeps data only in your own browser. A live version would store it on a secure server."]);
    app.innerHTML = `<h1>Help</h1><p class="lead">Quick answers for ${t ? "professors" : "students"} using CATC-Queue.</p>
  ${faq.map(([q, a]) => `<details class="card sec"><summary>${q}</summary><p class="mute" style="margin:10px 0 0">${a}</p></details>`).join("")}`;
}
