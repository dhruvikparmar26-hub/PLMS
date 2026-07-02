# Personalized Learning Management System — MERN Stack Build Blueprint

A phase-by-phase plan with ready-to-use prompts for building your LMS from authentication through advanced personalization. Each phase covers what to build, the pitfalls that usually break signup/login flows, and a prompt block you can hand to an AI coding assistant (me, Claude Code, Cursor, etc.) to generate that part.

## How to use this
- Work through phases in order — each builds on the last.
- Copy the prompt block under a phase and paste it to your AI assistant.
- Test after each phase before moving on. **Phase 2 (auth) is the foundation everything else depends on — get it rock solid first**, since that's what you flagged as the core issue.

---

## Tech Stack
- **Frontend:** React (Vite) + React Router + Axios + Context API + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt, httpOnly cookies
- **Media:** Multer + Cloudinary (course videos/images)
- **Optional later:** Socket.io (notifications), OpenAI API (smarter recommendations)

---

## Phase 0 — Project Setup & Architecture

**Build:**
- Monorepo with `/client` (React) and `/server` (Express)
- `.env` for secrets: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `CLIENT_URL`
- Server folders: `models/`, `routes/`, `controllers/`, `middleware/`, `config/`
- `concurrently` to run client + server with one dev command

**Prompt:**
```
Set up a MERN project skeleton for a Learning Management System.
- /server: Express app with folders models, routes, controllers, middleware, config
- Connect to MongoDB via Mongoose using MONGO_URI from .env
- /client: React app (Vite) with React Router, Axios, Tailwind CSS configured
- Add a root package.json with a "dev" script that runs client and server concurrently
- Add .env.example listing MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, PORT, CLIENT_URL
- Add basic CORS config on server allowing requests from CLIENT_URL with credentials
```

---

## Phase 1 — Database Schema Design

**Models:**
- **User** — name, email (unique, lowercase, trim), password (hashed, `select:false`), role (student/instructor/admin, default student), learningPreferences (array), enrolledCourses (refs), createdAt
- **Course** — title, description, instructor (ref User), category, difficulty, modules, thumbnail
- **Lesson** — title, content, videoUrl, resources, order, course (ref)
- **Enrollment** — user (ref), course (ref), completedLessons (array), progressPercent, lastAccessed
- **Quiz** — course (ref), questions, passingScore
- **QuizAttempt** — user (ref), quiz (ref), score, answers, attemptedAt
- **ActivityLog** — user (ref), action, metadata, timestamp — feeds the recommendation engine in Phase 6

**Prompt:**
```
Create Mongoose schemas for a Learning Management System with these models:
User, Course, Lesson, Enrollment, Quiz, QuizAttempt, ActivityLog.

Requirements:
- User.email: unique, lowercase, trim, required, validated as email format
- User.password: required, select: false (never returned by default in queries)
- User.role: enum ['student','instructor','admin'], default 'student'
- Add timestamps: true to every schema
- Add appropriate ref relationships (ObjectId + ref) between models as described
- Add indexes on User.email and a compound unique index on Enrollment (user+course)
  so a user can't enroll twice in the same course
- Export each as a Mongoose model
```

---

## Phase 2 — Authentication: Signup, Login, Storage (your core ask)

This is the part you flagged: new user signs up → gets stored → logs in with the same credentials → gets access to the dashboard. Here's exactly how that should work, plus the bugs that usually cause it to silently fail.

**Build:**

1. **`POST /api/auth/signup`**
   - Validate body (name, email, password) → 400 with field errors if invalid
   - Normalize email: `.toLowerCase().trim()`
   - Check if email already exists → 409 Conflict if so
   - Hash password: `bcrypt.hash(password, 12)` — never store plaintext
   - Create the User document
   - Respond 201 with user info (no password field)

2. **`POST /api/auth/login`**
   - Normalize email the same way as signup
   - Find user by email, explicitly `.select('+password')` since it's excluded by default
   - No user found → 401 generic "Invalid email or password"
   - `bcrypt.compare(plainPassword, user.password)` → same generic 401 if false
   - On match: sign JWT `{ userId, role }` with `JWT_SECRET`, expiry from `JWT_EXPIRES_IN`
   - Set as an httpOnly, secure (in prod), sameSite cookie
   - Respond 200 with user info + token

3. **`middleware/auth.js`** — verifies JWT on protected routes, attaches `req.user`, 401 if missing/invalid/expired

4. **`GET /api/auth/me`** — protected; returns the logged-in user's profile. Frontend calls this on app load to check "am I still logged in" after a refresh

5. **`POST /api/auth/logout`** — clears the cookie

**The 6 bugs that break this flow most often** — check these first if signup "succeeds" but login fails:
1. Comparing `password === user.password` directly instead of `bcrypt.compare()` — plaintext will never match a hash
2. Not normalizing email case — `User@x.com` at signup vs `user@x.com` at login won't match in a case-sensitive query
3. Schema has `password: { select: false }` but the login query forgets `.select('+password')` — `user.password` comes back `undefined`, compare always fails
4. `JWT_SECRET` not actually loaded (missing `require('dotenv').config()` at the entry point, or wrong `.env` path) — signing/verifying becomes inconsistent
5. CORS missing `credentials: true` on the server (and `withCredentials: true` on Axios) when using cookies — the cookie never gets set or sent back
6. Missing `unique: true`/index on `User.email` — duplicate accounts get created silently if a route-level uniqueness check is ever skipped

**Prompt:**
```
Implement authentication for a MERN LMS using the User model already defined.

Backend (Express):
- POST /api/auth/signup: validate name/email/password, normalize email to lowercase/trim,
  check for existing email (409 if found), hash password with bcrypt (12 salt rounds),
  create user, respond 201 with user data minus password.
- POST /api/auth/login: normalize email, find user with .select('+password'),
  compare password with bcrypt.compare, generic 401 "Invalid email or password" on any
  mismatch, sign a JWT { userId, role } with JWT_SECRET and JWT_EXPIRES_IN,
  set it as an httpOnly cookie (secure in production, sameSite: 'lax'),
  respond 200 with user data (no password).
- middleware/auth.js: read JWT from cookie, verify it, attach decoded user to req.user,
  call next(); respond 401 if missing or invalid.
- GET /api/auth/me: protected by the middleware, returns req.user's full profile from DB.
- POST /api/auth/logout: clear the auth cookie, respond 200.
- Use express-validator for input validation on signup/login bodies.
- Enable CORS with origin: CLIENT_URL and credentials: true.

Make sure email is normalized identically in both signup and login, and that the password
field is explicitly selected back in the login query since it's excluded by default.
```

---

## Phase 3 — Frontend Auth Flow

**Build:**
- `SignupPage` — form (name, email, password, confirm password), client-side validation, Axios POST, error display ("email already in use"), redirect to `/login` on success
- `LoginPage` — form (email, password), Axios POST with `withCredentials: true`, store user in context on success, redirect to `/dashboard`
- `AuthContext` — holds `{ user, isAuthenticated, loading }`, exposes `login()`, `logout()`, `signup()`; on app mount calls `GET /api/auth/me` to rehydrate the session after a page refresh
- `ProtectedRoute` — wraps `/dashboard` and other private pages, redirects to `/login` if not authenticated
- Axios instance with `withCredentials: true` globally; auto-logout + redirect on a 401

**Prompt:**
```
Build the React auth flow for the LMS (Vite + React Router + Axios + Tailwind):
- AuthContext.jsx: provides user, isAuthenticated, loading, login(), logout(), signup().
  On mount, call GET /api/auth/me (withCredentials: true) to check for an existing session;
  set loading: false once that resolves either way.
- SignupPage.jsx: form for name/email/password/confirm password, client-side validation
  (valid email, password min 8 chars, passwords match), calls signup(), shows server error
  messages inline, redirects to /login on success.
- LoginPage.jsx: form for email/password, calls login(), shows a generic error on failure,
  redirects to /dashboard on success.
- ProtectedRoute.jsx: wraps children, redirects to /login if !isAuthenticated and not loading,
  shows a spinner while loading.
- axios instance (api.js) with baseURL and withCredentials: true, response interceptor that
  redirects to /login on a 401.
- Wire up React Router: /signup, /login, /dashboard (protected).
```

---

## Phase 4 — Dashboard & Onboarding

**Build:**
- Post-signup onboarding: pick interests/category/skill level → saved to `user.learningPreferences`
- `DashboardPage` — sidebar nav, welcome header, enrolled courses with progress bars, recommended courses (v1: filtered by matching `learningPreferences` to `Course.category`)

**Prompt:**
```
Build an onboarding flow and dashboard for the LMS:
- OnboardingPage.jsx: shown once right after signup, lets the user pick interests/category
  tags and a skill level, saves to PATCH /api/users/me/preferences, then redirects to /dashboard.
- Backend: PATCH /api/users/me/preferences (protected route) updates User.learningPreferences.
- DashboardPage.jsx: welcome header with the user's name, a grid of enrolled courses with a
  progress bar each (pull from Enrollment), and a "Recommended for you" row of courses where
  Course.category is in user.learningPreferences and the user isn't already enrolled.
- Backend: GET /api/courses/recommended (protected) implements that filter.
```

---

## Phase 5 — Core Learning Activities

**Build:**
- Course catalog: browse/search/filter by category & difficulty
- Course detail page with Enroll button → creates `Enrollment`
- Lesson viewer (video/text) with "Mark complete" → updates `Enrollment.completedLessons` + recalculates `progressPercent`
- Quiz component → submit → scored server-side, saved to `QuizAttempt`

**Prompt:**
```
Build the core learning flow for the LMS:
- GET /api/courses with query params for search, category, difficulty (plus pagination).
- GET /api/courses/:id returns course detail with its lessons/modules ordered.
- POST /api/courses/:id/enroll (protected) creates an Enrollment if one doesn't already
  exist (use the compound unique index to prevent duplicates).
- POST /api/lessons/:id/complete (protected) adds the lesson to the user's
  Enrollment.completedLessons for that course (if not already there) and recalculates
  progressPercent = completedLessons.length / totalLessons * 100.
- POST /api/quizzes/:id/attempt (protected) accepts answers, scores them server-side
  (never trust a client-submitted score), saves a QuizAttempt, returns the score and
  whether it passed.
- Frontend: CourseCatalogPage (search/filter), CourseDetailPage (enroll + lesson list),
  LessonViewerPage (content + mark-complete + progress bar), QuizPage (renders questions,
  submits answers, shows result).
```

---

## Phase 6 — Personalization Engine & Analytics

**Build:**
- `ActivityLog` writes on key actions: lesson viewed, quiz attempted, time spent
- Recommendation v2: weight by recent activity, not just onboarding preferences
- Instructor/Admin dashboard: create/edit courses & lessons, view analytics across students

**Prompt:**
```
Extend the LMS with activity tracking and an instructor dashboard:
- Middleware or controller hook that writes an ActivityLog entry on: lesson view,
  lesson complete, quiz attempt (store user, action, metadata like courseId/lessonId/score,
  timestamp).
- GET /api/courses/recommended/v2 (protected): combine learningPreferences with recent
  ActivityLog data — e.g. boost courses/lessons related to quizzes the user scored below
  passingScore on, and deprioritize categories the user has ignored repeatedly.
- Role-gated middleware: checks req.user.role === 'instructor' or 'admin' before allowing
  course create/edit/delete.
- InstructorDashboardPage.jsx: list of the instructor's courses with enrollment counts and
  average quiz scores per course; a course editor (create/edit lessons and quizzes).
```

---

## Phase 7 — Security Hardening & Deployment

**Build:**
- `express-rate-limit` on `/api/auth/*` to block brute-force attempts
- `helmet` for security headers
- `express-validator` on every input-accepting route, not just auth
- Tests: Jest + Supertest (backend), React Testing Library (frontend)
- Deploy: MongoDB Atlas, backend on Render/Railway, frontend on Vercel/Netlify

**Prompt:**
```
Harden and prepare the LMS for deployment:
- Add helmet middleware and express-rate-limit (e.g. 10 requests / 15 min) specifically
  on /api/auth/signup and /api/auth/login.
- Audit every route that accepts a request body and confirm express-validator rules exist.
- Write Jest + Supertest tests for: signup success, signup with duplicate email,
  login success, login with wrong password, accessing a protected route without a token.
- Add a production check that sets cookie { secure: true, sameSite: 'none' } when
  NODE_ENV === 'production', and document the required environment variables for
  deployment on Render/Railway (backend) and Vercel/Netlify (frontend), plus MongoDB Atlas
  connection string setup.
```

---

## Recommended order
Phase 0 → 1 → 2 → 3 (get auth fully working end-to-end before anything else) → 4 → 5 → 6 → 7.
