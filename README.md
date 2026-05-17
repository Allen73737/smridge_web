# Smridge - Smart Refrigerator Ecosystem

**Smridge** is an innovative, full-stack Smart Refrigerator project encompassing hardware integration, a cross-platform mobile application, and a responsive web dashboard. It is designed to track inventory, provide personalized AI-driven meal suggestions, and manage your refrigerator's status in real-time.

---

## 🌟 Key Features

- **Real-Time Synchronization**: Instant updates across devices using WebSockets (`socket.io`).
- **Cross-Platform App**: Flutter-based mobile application for on-the-go management.
- **Web Dashboard**: A premium, glassmorphism-styled React web interface for detailed overviews.
- **Hardware Integration**: ESP-based devices for automatic status tracking with simplified Wi-Fi provisioning.
- **Smart AI Integration**: Built-in AI assistants for dynamic content and inventory insights.
- **Robust Storage**: Server-side disk storage to robustly manage APK files and other large uploads.

---

## 🏗️ Architecture

The project consists of three main components:
1. **Hardware (ESP)**: Collects sensory data from the refrigerator and connects via Wi-Fi.
2. **Mobile App (Flutter)**: Allows remote monitoring, inventory updates, and AI assistance.
3. **Web Dashboard (React + Express)**: Provides a comprehensive admin/user panel with real-time syncing.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS / Vanilla CSS (Glassmorphism UI)
- **Backend**: Node.js, Express, Socket.io
- **Mobile**: Flutter, Dart
- **Hardware**: ESP Microcontrollers
- **Database**: MongoDB
- **Authentication**: JWT & OAuth

---

## 🚀 Getting Started (Web Dashboard)

### Prerequisites
- Node.js (v16+)
- MongoDB connection string

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   ```

2. **Setup the Backend:**
   Navigate to the `server` directory, install dependencies, and start the server:
   ```bash
   cd server
   npm install
   npm start
   ```
   *(Ensure you have an `.env` file with `MONGO_URI`, `JWT_SECRET`, etc. configured)*

3. **Setup the Frontend:**
   Navigate to the `smridge_Web` directory, install dependencies, and start the dev server:
   ```bash
   cd smridge_Web
   npm install
   npm run dev
   ```
   *(Ensure you have an `.env` file with `VITE_API_URL` and `VITE_SOCKET_URL` configured)*

For deployment instructions to Render and Vercel, please see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 🔒 Security & Performance

- Comprehensive rate limiting and error handling for robust APIs.
- AI request resilience via exponential backoff.
- Protected routes using JWT-based authentication.
- Efficient cleanup of server-side stored files.
