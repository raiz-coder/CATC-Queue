# CATC-Queue

backend/   Spring Boot 3 + Spring Security + JPA (H2 by default, MySQL notes in application.properties)
frontend/  index.html + css/ + js/ (plain HTML, CSS and JavaScript, no build step)

## Run
1. Backend:  cd backend && mvn spring-boot:run          -> http://localhost:8080
2. Frontend: set  const API_BASE = "http://localhost:8080";  in frontend/js/config/constants.js
             cd frontend && python3 -m http.server 5500  -> http://localhost:5500
   (Leave API_BASE empty to run the frontend alone in the browser with localStorage.)

## Two portals
Sign up and log in are separate for Students (Student ID, course and year, reference request) and
Professors (Employee ID, department). Login works with email or Student ID / Employee ID.
Demo accounts: student@catc.edu or 2024-0001 / student123, prof@catc.edu or E-001 / prof123, admin@catc.edu / admin123

## API (HTTP Basic auth)
POST /api/auth/register   GET /api/data   PUT /api/users/me   DELETE /api/users/me
PUT /api/requests/{id}    DELETE /api/requests/{id}   DELETE /api/users/{id} (admin)
