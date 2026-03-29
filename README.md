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

- **Frontend**: Recommended to deploy on [Vercel](https://vercel.com).
- **Backend**: Recommended to deploy on [Render](https://render.com) or [Railway](https://railway.app).

## 📄 License

This project is licensed under the MIT License.
