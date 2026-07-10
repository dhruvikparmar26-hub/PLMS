# Personalized Learning Management System

Personalized LMS is a MERN stack learning platform with authentication, course and lesson management, quizzes, notes, bookmarks, certificates, notifications, analytics, and adaptive learning features.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, React Router, Recharts
- Backend: Node.js, Express, Socket.io, JWT, bcrypt
- Database: MongoDB, Mongoose

## Project Structure

- `frontend/` - React frontend
- `backend/` - Express API and MongoDB models
- `DEPLOYMENT.md` - deployment notes
- `personalized-lms-mern-blueprint.md` - implementation blueprint

## Setup

1. Install dependencies for the root, frontend, and backend packages.
2. Create the required `.env` file for the backend.
3. Start the frontend and backend in development mode.

Useful commands:

- `npm run dev` - run the root concurrent dev command
- `npm run dev --prefix backend` - start the backend only
- `npm run dev --prefix frontend` - start the frontend only
- `npm start --prefix backend` - start the backend in production mode
- `npm run build --prefix frontend` - build the frontend for production

## Environment Variables

Server:

- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PORT`
- `CLIENT_URL`

Client:

- `VITE_API_URL`

## Run Locally

1. Install dependencies.
2. Add the server environment variables.
3. Run `npm run dev` from the repository root.
4. Open the frontend at the Vite development URL and use the API served by the backend.

## Notes

- The app uses cookie-based authentication for session management.
- Socket.io is enabled on the backend for real-time features.
- Keep secrets out of version control and store them only in environment files.