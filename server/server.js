const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

connectDB();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',   // Added for 127.0.0.1 support
    'http://localhost:3000',
    'http://127.0.0.1:3000'    // Added for 127.0.0.1 support
].filter(Boolean);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
    },
});

// Register socketio in app for global access in controllers
app.set('socketio', io);

// Middleware
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/fridge', require('./routes/fridgeRoutes'));
app.use('/api/threshold', require('./routes/thresholdRoutes'));
app.use('/api/apk', require('./routes/apkRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/team', require('./routes/teamRoutes'));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Socket.io
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
