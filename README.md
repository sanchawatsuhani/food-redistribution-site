# Smart Food Redistribution System

A full-stack application designed to bridge the gap between food donors (restaurants, events, individuals) and NGOs to reduce food waste and help those in need.

## 🚀 Features

- **User Authentication**: Secure login and registration for Donors and NGOs.
- **Real-time Notifications**: Instant alerts for new food listings and donation claims using Socket.io.
- **Dashboard**: Role-based dashboards for managing food listings and donations.
- **Image Uploads**: Support for uploading food item images.
- **Dynamic Filtering**: Filter available food items by location, expiry, and quantity.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Axios, Socket.io-client, React Router
- **Backend**: Node.js, Express, Socket.io, SQLite (Sequelize)
- **Styling**: Vanilla CSS with modern aesthetics

## 📦 Project Structure

```
smart-food-redistribution/
├── frontend/          # React frontend application
└── backend/           # Express backend server
```

## ⚙️ Setup and Installation

### Prerequisites

- Node.js (v18+)
- npm

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment

This project is structured for easy deployment on **Vercel** (Frontend) and **Render** (Backend).

### 1. Backend Deployment (Render)

1. **New Web Service**: Connect your GitHub repository.
2. **Settings**:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. **Environment Variables**:
   - `JWT_SECRET`: A long random string.
   - `FRONTEND_URL`: Your Vercel app URL (e.g., `https://your-app.vercel.app`).
   - `PORT`: `3001` (Render usually sets this automatically).

### 2. Frontend Deployment (Vercel)

1. **New Project**: Connect your GitHub repository.
2. **Settings**:
   - **Root Directory**: `frontend` (Or keep root and set **Framework Preset** to Vite).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   - `VITE_API_URL`: Your Render backend URL + `/api` (e.g., `https://backend.onrender.com/api`).
   - `VITE_SOCKET_URL`: Your Render backend URL (e.g., `https://backend.onrender.com`).

> [!TIP]
> **Real-time Notifications**: Ensure the `VITE_SOCKET_URL` does NOT include the `/api` suffix.

## 📄 License

This project is licensed under the MIT License.
