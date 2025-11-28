// backend/src/server.js (FINAL BACKEND SETUP)

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); // Import Socket.IO Server
const connectDB = require('./db');

// --- NEW IMPORTS ---
const authRoutes = require('./routes/authRoutes'); 
const chatRoutes = require('./routes/chatRoutes');
const { socketAuthMiddleware, onlineUsers, chatSocketLogic } = require('./socket/chatSocket');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app); 

// --- 1. SETUP SOCKET.IO ---
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// --- 2. SOCKET AUTHENTICATION & LOGIC ---
io.use(socketAuthMiddleware); // Middleware to authenticate token from handshake
chatSocketLogic(io); // Main function to handle all socket events

// Middleware
app.use(express.json()); 
app.use(cors({
    origin: process.env.CLIENT_URL, 
    credentials: true,
}));

// Route for static uploads (for media files) - optional for now
// app.use('/uploads', express.static('uploads')); 

// --- ROUTE USAGE ---
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);


const PORT = process.env.PORT || 5001; // Updated to 5001

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});