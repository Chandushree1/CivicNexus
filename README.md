# CivicConnect — Citizen Grievance Portal

A full clone of the CivicConnect Lovable prototype, rebuilt as a real full-stack app:

- **Frontend:** React (Vite) + React Router + Tailwind CSS
- **Backend:** Node.js + Express + MongoDB (Mongoose) + JWT auth
- **Image storage:** Cloudinary (complaint photos, resolution photos, avatars)

Covers all screens from the design: public marketing pages (Home, How It Works, Issues, About),
Login/Register, Citizen dashboard (Dashboard, Report Issue 4-step wizard, My Complaints, Notifications,
Profile), and Officer dashboard (Dashboard, Assigned Complaints, Nearby Issues, Map View, Notifications,
Profile), including the "mock map" visual used in the original design.

## Folder structure

```
civicconnect/
  backend/     Node.js + Express API
  frontend/    React + Vite + Tailwind app
```

## 1. Prerequisites

- Node.js 18+ and npm
- A MongoDB database — easiest is a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- A free [Cloudinary](https://cloudinary.com) account (for photo uploads)

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:

- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — any long random string
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — from your Cloudinary dashboard
  ("Dashboard" tab shows all three)

Then seed some demo data (matches the original mockup — same complaint IDs, names, etc.):

```bash
npm run seed
```

This creates three demo logins:

| Role    | Email                              | Password    |
|---------|-------------------------------------|-------------|
| Citizen | ananya.sharma@gmail.com            | password123 |
| Officer | ramesh.iyer@civicconnect.gov.in    | password123 |
| Admin   | admin@civicconnect.gov.in          | password123 |

Start the API:

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default (health check at `/api/health`).

## 3. Frontend setup

```bash
cd frontend
npm install
```

By default the frontend calls `http://localhost:5000/api`. If your backend runs elsewhere, create a
`.env` file in `frontend/` with:

```
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

Visit `http://localhost:5173`.

## 4. Building for production

```bash
cd frontend && npm run build   # outputs to frontend/dist
cd backend && npm start        # run the API with node (no nodemon)
```

Deploy `backend/` to any Node host (Render, Railway, EC2, etc.) and `frontend/dist` to any static host
(Netlify, Vercel, S3 + CloudFront, etc.) — just point `VITE_API_URL` at your deployed API URL before
building.

## Notes on the "map" screens

The original design's Map View and Nearby Issues pages use a **mock map** (labelled "Map preview (mock)"
in the screenshots) rather than a real Google Maps embed — pins are plotted on a light grid background
based on each complaint's stored latitude/longitude. This project reproduces that exact mock-map look with
a lightweight custom component (`frontend/src/components/MockMap.jsx`), so there's no Google Maps API key
to configure. If you'd like a real interactive map instead, that component is the only place you'd need to
swap in `@react-google-maps/api` or Leaflet — the backend already returns real lat/lng on every complaint.

## Roles

- **Citizen** — registers via `/register`, reports issues, tracks their own complaints, rates resolutions.
- **Officer** — created via the seed script (or directly in MongoDB / a future admin panel), sees
  nearby/assigned complaints filtered to their department, accepts cases, updates status, resolves with a
  photo.
- **Admin** — same dashboards as Officer in this build (the login screen exposes the role for future
  expansion into a dedicated admin analytics view).
