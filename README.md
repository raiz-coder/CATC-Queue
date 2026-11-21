# CATC-Queue
CATC-Queue is a platform for students who are constantly missing their schedule in term exams. This Web app can help them to book a schedule for their professor. Students can see the schedule they booked, the time, and day. Professors will have a separated account where they can post their availability and the schedule of examination.

# Flow chart

```mermaid
flowchart TD
    A([Start]) --> B{User Visits App}
    B --> C[Login Page]
    C --> D{Valid Credentials?}
    D -- No --> C
    D -- Yes --> E{Role?}

    E -- Student --> F[Student Dashboard]
    E -- Professor --> G[Professor Dashboard]
    E -- Admin --> H[Admin Dashboard]

    %% ================= STUDENT FLOW =================
    F --> F1[Nav: HOME / SCHEDULES / PROFILE / SETTINGS / HELP]
    F1 --> F2[Home: Search & Filter Professors]
    F2 --> F3[View Professor Profile & Availability Status]
    F3 --> F4{Book Schedule?}
    F4 -- Yes --> F5[Select Date, Time, Subject + Send Message]
    F5 --> F6[Submit Booking Request → Status: PENDING]
    F4 -- No --> F7[View Schedule History]
    F6 --> F7
    F7 --> F8{Cancel Booking?}
    F8 -- Yes --> F9[Send Cancel Request → Professor Must Approve]
    F8 -- No --> F10[Edit Profile / Settings / Help]
    F9 --> F10

    %% ================= PROFESSOR FLOW =================
    G --> G1[Nav: HOME / SCHEDULES / PROFILE / SETTINGS / HELP]
    G1 --> G2[Home: Calendar of Activity]
    G2 --> G3[View Pending Bookings from Students]
    G3 --> G4{Accept or Decline?}
    G4 -- Accept --> G5[Verify Reference / Subject / Date / Time / Name / Student ID]
    G5 --> G6[Booking Confirmed → Status: ACCEPTED]
    G4 -- Decline --> G7[Show Confirmation: Reschedule?]
    G7 -- Yes --> G8[Prompt Student to Reschedule]
    G7 -- Quit --> G9[Booking Declined → Status: DECLINED]
    G6 --> G10[Set Availability Status: GREEN / YELLOW / RED]
    G8 --> G10
    G9 --> G10
    G10 --> G11[Manage Schedule / Edit Profile / View Student Info]

    %% ================= ADMIN FLOW =================
    H --> H1[Manage Users & Roles]
    H --> H2[Manage Booking Records]
    H --> H3[View All System Records]
    H --> H4[Delete Booking Records]

    F10 --> Z([End])
    G11 --> Z
    H1 --> Z
    H2 --> Z
    H3 --> Z
    H4 --> Z
```

# Flowchart Description

The flowchart models the complete user journey across all three roles from the moment the application opens.

## Entry & Authentication
The flow begins when a user visits the app and is routed to the login page. Spring Security validates credentials. If invalid, the user is returned to login. If valid, the system branches by role into Student, Professor, or Admin dashboards.

## Student Path
The student sees the navigation bar (HOME, SCHEDULES, PROFILE, SETTINGS, HELP). On HOME, they search and filter professors, view profiles, and check the three-circle availability indicator (green = available, yellow/orange = break, red = unavailable). If they choose to book, they select date, time, subject, and message, generating a booking with status PENDING and a unique referenceReq. They can view history and request cancellation, but cancellation requires professor approval. They can also edit profile, change theme (Navy / Light / Dark), and access help.

## Professor Path
The professor dashboard shows a calendar of activity and pending bookings. For each request, the professor can Accept (after verifying the reference matches exactly, plus subject, date, time, name, and student ID) or Decline. Declining triggers a confirmation dialog ("Do you want it rescheduled?") with Yes / Quit options. Accepted bookings become ACCEPTED; declined ones become DECLINED and may prompt the student to reschedule. The professor can also set their own status (RED/GREEN/YELLOW), manage schedules, edit subjects/department/contacts, and view student profiles.

## Admin Path
The admin manages user accounts and roles, booking reference records, views all system records, and deletes bookings when appropriate.

# Convergence
All role-specific flows terminate at the same end node, reflecting that each session ends after the user completes their tasks.
