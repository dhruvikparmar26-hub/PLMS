# LMS Deployment Guide

This guide describes how to configure, secure, and deploy the Personalized Learning Management System (LMS) to production.

---

## 1. MongoDB Atlas Setup

To use a cloud-hosted MongoDB instance in production:
1. Sign up/log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Database Cluster (the shared free tier is sufficient).
3. Under **Database Access**, create a database user and password. Note them down.
4. Under **Network Access**, whitelist the required IP addresses.
   > [!IMPORTANT]
   > Since services like Render/Railway rotate outbound IP addresses, you must whitelist `0.0.0.0/0` (allow access from anywhere) or set up a static IP proxy.
5. Click **Connect** on your cluster, select **Connect your application**, and copy the connection string. It will look like:
   `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`
   Replace `<username>` and `<password>` with your database user credentials.

---

## 2. Backend Deployment (Render or Railway)

Deploy the `server` directory of the application.

### Recommended Steps:
1. Push your code to GitHub.
2. In [Render](https://render.com) or [Railway](https://railway.app), create a new **Web Service** and link it to your GitHub repository.
3. Set the **Root Directory** to `server`.
4. Set the **Build Command** to `npm install`.
5. Set the **Start Command** to `npm start`.

### Required Environment Variables:

| Variable | Description | Recommended Value / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Production environment flag | `production` |
| `PORT` | Server listening port | `10000` (Render binds this dynamically, do not hardcode) |
| `MONGO_URI` | MongoDB connection string | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key used to sign JWTs | A secure random string (e.g., `openssl rand -hex 32` output) |
| `JWT_EXPIRES_IN` | Token duration | `7d` |
| `CLIENT_URL` | The URL where the frontend is hosted | `https://your-lms-frontend.vercel.app` |

---

## 3. Frontend Deployment (Vercel or Netlify)

Deploy the `client` directory of the application.

### Recommended Steps:
1. In [Vercel](https://vercel.com) or [Netlify](https://www.netlify.com), create a new project and import your repository.
2. Set the **Root Directory** to `client`.
3. Set the **Build Command** to `npm run build`.
4. Set the **Output Directory** to `dist`.

### Required Environment Variables:

| Variable | Description | Recommended Value / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL of the deployed Express backend | `https://your-lms-backend.onrender.com/api` |

---

## 4. Production Security Headers & Cookies

- **Helmet**: Helmet security headers are applied globally to prevent Clickjacking, MIME-sniffing, and XSS attacks.
- **Rate Limiting**: Requests to `/api/auth/signup` and `/api/auth/login` are limited to `10 requests per 15 minutes` to mitigate brute-force attempts.
- **Cookies**: In production (`NODE_ENV === 'production'`), auth session cookies are served with `{ secure: true, sameSite: 'none' }`. This ensures browsers permit cookies to be transmitted between different domains (e.g., frontend on Vercel accessing backend on Render).
