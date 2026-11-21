# CATC-Queue
CATC-Queue is a platform for students who are constantly missing their schedule in term exams. This Web app can help them to book a schedule for their professor. Students can see the schedule they booked, the time, and day. Professors will have a separated account where they can post their availability and the schedule of examination.

# Flowchart

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


# Sequence Diagram
```mermaid
sequenceDiagram
    autonumber
    actor S as Student
    participant UI_S as Student UI (Frontend)
    participant API as Spring Boot API
    participant SEC as Spring Security
    participant SVC as Booking Service
    participant REPO as JPA Repository
    participant DB as MySQL / H2
    actor P as Professor
    participant UI_P as Professor UI

    Note over S,DB: PHASE 1 — STUDENT BOOKS A SCHEDULE
    S->>UI_S: Login (email + password)
    UI_S->>API: POST /auth/login
    API->>SEC: Authenticate credentials
    SEC-->>API: JWT Token (role=STUDENT)
    API-->>UI_S: 200 OK + Token

    S->>UI_S: Search & filter professors
    UI_S->>API: GET /professors?department=&subject=
    API->>REPO: findAll(filter)
    REPO->>DB: SELECT professors
    DB-->>REPO: Result set
    REPO-->>API: List<ProfessorDTO>
    API-->>UI_S: Professors + availability status

    S->>UI_S: View professor profile
    UI_S->>API: GET /professors/{id}
    API-->>UI_S: Profile, schedule, status (GREEN/YELLOW/RED)

    S->>UI_S: Book schedule (date, time, subject, message)
    UI_S->>API: POST /bookings
    API->>SVC: createBooking(dto)
    SVC->>REPO: save(Booking{status=PENDING})
    REPO->>DB: INSERT booking
    DB-->>REPO: Booking ID
    SVC-->>API: BookingDTO
    API-->>UI_S: 201 Created (referenceReq generated)
    UI_S-->>S: Show "Pending" in schedules

    Note over S,DB: PHASE 2 — PROFESSOR REVIEWS REQUEST
    P->>UI_P: Login
    UI_P->>API: POST /auth/login
    API->>SEC: Authenticate
    SEC-->>API: JWT Token (role=PROFESSOR)
    API-->>UI_P: 200 OK + Token

    P->>UI_P: Open Pending bookings
    UI_P->>API: GET /bookings?status=PENDING
    API->>REPO: findByProfessorAndStatus
    REPO->>DB: SELECT bookings
    DB-->>REPO: Pending list
    API-->>UI_P: List<BookingDTO>

    P->>UI_P: View student profile
    UI_P->>API: GET /students/{id}
    API-->>UI_P: Student info

    alt Accept
        P->>UI_P: Accept booking (verify reference/subject/date/time/name/ID)
        UI_P->>API: PATCH /bookings/{id}/accept
        API->>SVC: verifyAndAccept(id)
        SVC->>REPO: update status=ACCEPTED
        REPO->>DB: UPDATE booking
        API-->>UI_P: 200 OK
    else Decline
        P->>UI_P: Decline booking
        UI_P-->>P: Confirmation dialog "Reschedule?"
        alt Yes
            P->>UI_P: Confirm reschedule
            UI_P->>API: PATCH /bookings/{id}/decline?reschedule=true
            API->>REPO: update status=DECLINED
            API-->>UI_P: 200 OK
        else Quit
            P->>UI_P: Cancel
            UI_P-->>P: Return to list
        end
    end

    Note over S,DB: PHASE 3 — STUDENT SEES RESULT
    S->>UI_S: Open SCHEDULES
    UI_S->>API: GET /bookings/my
    API->>REPO: findByStudentId
    REPO->>DB: SELECT bookings
    DB-->>REPO: List
    API-->>UI_S: Bookings with status
    UI_S-->>S: Show ACCEPTED / DECLINED / PENDING
```

# Sequence Diagram Description
The sequence diagram captures the end-to-end booking lifecycle across three phases, showing exactly which component handles each call in the layered Spring Boot architecture (Controller → Service → Repository → DB).

## Phase 1 — Student Books
The student logs in through the frontend, which calls POST /auth/login. Spring Security authenticates and returns a JWT with role=STUDENT. The student searches professors (GET /professors with filter params), and the API queries the JPA repository, which hits the database. The student views a professor's profile, then submits a booking (POST /bookings). The Booking Service creates the record with status=PENDING and generates the referenceReq. The database returns the booking ID and the student sees it listed as pending.

## Phase 2 — Professor Reviews
The professor logs in and receives a JWT with role=PROFESSOR. They fetch pending bookings (GET /bookings?status=PENDING) and may view the student's profile (GET /students/{id}) before deciding. The diagram uses an alt block to model the decision:

Accept: PATCH /bookings/{id}/accept → service verifies the reference, subject, date, time, name, and student ID are identical → status becomes ACCEPTED.

Decline: the UI shows a confirmation dialog. A nested alt handles Yes (sends PATCH .../decline?reschedule=true → status DECLINED) or Quit (returns to list without change).

## Phase 3 — Student Sees Result
The student refreshes SCHEDULES (GET /bookings/my), the repository queries by studentId, and the UI displays the final status (ACCEPTED / DECLINED / PENDING).

### Why this design matters
The sequence diagram confirms the constructor-injected, layered architecture: the Controller never touches the repository directly — every request passes through the Service layer, which enforces the business rule that the professor must verify the reference before acceptance. Spring Security sits in front of authentication, and the JWT carries the role that gates each endpoint. This separation keeps the booking rule (reference must match exactly) in the service, making it testable and reusable.
