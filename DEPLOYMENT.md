# Deployment Guide for Smridge Web

This guide outlines how to deploy the **Express Backend** to Render and the **React Frontend** to Vercel.

## 1. Backend Deployment (Render)

We recommend **Render** for the backend because it provides a free tier that supports Node.js and allows for persistent connections (required for Socket.io).

### Steps:
1.  **Push your code to GitHub**: Ensure your project is in a GitHub repository.
2.  **Sign up/Login to [Render](https://render.com/)**.
3.  **Create a New Web Service**:
    -   Connect your GitHub repository.
    -   **Root Directory**: `server` (Important: Point this to your backend folder).
    -   **Build Command**: `npm install`
    -   **Start Command**: `node server.js`
4.  **Environment Variables**:
    -   Add the following variables in the Render dashboard:
        -   `MONGO_URI`: Your MongoDB connection string.
        -   `JWT_SECRET`: Your secret key for JWT.
        -   `PORT`: `5000` (optional, Render usually assigns one).
        -   Any other variables from your `.env` file.
5.  **Deploy**: Click "Create Web Service". Render will build and deploy your server.
6.  **Copy URL**: Once deployed, copy your backend URL (e.g., `https://smridge-api.onrender.com`).

## 2. Frontend Deployment (Vercel)

We recommend **Vercel** for the frontend as it is optimized for Vite/React apps.

### Steps:
1.  **Sign up/Login to [Vercel](https://vercel.com/)**.
2.  **Add New Project**:
    -   Import your GitHub repository.
3.  **Configure Project**:
    -   **Framework Preset**: Vite
    -   **Root Directory**: `smridge_Web` (Important: Point this to your frontend folder).
4.  **Environment Variables**:
    -   Add the following variables:
        -   `VITE_API_URL`: Your Render Backend URL + `/api` (e.g., `https://smridge-api.onrender.com/api`).
        -   `VITE_SOCKET_URL`: Your Render Backend URL (e.g., `https://smridge-api.onrender.com`).
5.  **Deploy**: Click "Deploy". Vercel will build and host your frontend.

## 3. Final Verification
-   Open your Vercel URL.
-   Login/Register to test authentication.
-   Check if real-time features (Socket.io) work.
