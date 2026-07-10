# PLMS Frontend

This directory contains the React frontend for the Personalized Learning Management System.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Recharts

## Development

1. Install dependencies in `client/`.
2. Set `VITE_API_URL` if the frontend needs to point to a deployed backend.
3. Run `npm run dev` from `client/`.

## Production Build

- `npm run build`
- `npm run preview`

## Notes

- The frontend expects the backend to support cookie-based authentication.
- Keep environment-specific values out of source control.
