# CyberChat: MERN Real-time Messaging Application

**Submitted By:** Jalal (For CyberPeers MERN Developer Position)
**Project Status:** 100% Complete and Deployed

## Live Application Links

| Component | Platform | Live URL |
| :--- | :--- | :--- |
| **Frontend Web App** | Vercel | [`https://cyberpeers-chat.vercel.app`](https://cyberpeers-chat.vercel.app) |
| **Backend API Service** | Render | [https://cyberchat-api-jalal.onrender.com `https://cyberchat-api-jalal.onrender.com`] |

## Short Demo Video (Screen Recording)

**Link:** [Insert Link to your short demo video (e.g., Loom, YouTube, Vimeo)]

---

## Technical Overview

This is a full-stack MERN application built for real-time private messaging, adhering strictly to all task requirements.

| Layer | Technology | Data Models |
| :--- | :--- | :--- |
| **Frontend** | React, Redux Toolkit + Thunk, Vite, Tailwind CSS | Handled via Redux Slices: `auth`, `chat`, `socket` |
| **Backend** | Node.js, Express, Socket.IO | `User`, `Conversation`, `Message` (Mongoose Schemas) |
| **Authentication** | JWT (JSON Web Tokens) | Password validation includes min 8 chars, uppercase, lowercase, number, and special character. |
| **Features** | Socket.IO, Multer | Real-time chat, Online Status, Message Persistence, Image/Video/File Upload. |

---

## Setup and Installation Instructions (Local Development)

### 1. Backend Setup (`/backend`)

1.  Navigate to the backend folder: `cd backend`
2.  Install dependencies: `npm install`
3.  **Create a `.env` file** and populate it (replace values with your own):
    ```env
    MONGO_URI="mongodb+srv://user:pass@cluster0.xyz.mongodb.net/chat_app"
    JWT_SECRET="a_secure_random_string"
    JWT_EXPIRE="10d"
    CLIENT_URL="http://localhost:5173"
    PORT=5001
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```
    *(API runs on http://localhost:5001)*

### 2. Frontend Setup (`/frontend`)

1.  Navigate to the frontend folder: `cd ../frontend`
2.  Install dependencies: `npm install`
3.  **Create a `.env.local` file**:
    ```env
    VITE_BACKEND_URL=http://localhost:5001
    ```
4.  Start the client:
    ```bash
    npm run dev
    ```
    *(Client runs on http://localhost:5173)*

---

## Socket Events Documentation (Required)

The application uses an authenticated Socket.IO connection for all real-time communication.

| Event Name | Direction | Data Payload | Purpose / Action |
| :--- | :--- | :--- | :--- |
| **`join-conversation`** | ⬆️ Client -> Server | `conversationId` (String) | Subscribes the user's socket to the specific chat room. |
| **`message-sent`** | ⬆️ Client -> Server | `{ conversationId, content, type, mediaUrl }` | Sent after text input or media upload. Triggers server-side persistence. |
| **`typing-start`** | ⬆️ Client -> Server | `{ conversationId }` | Broadcast to the room when a user starts typing. |
| **`typing-stop`** | ⬆️ Client -> Server | `{ conversationId }` | Broadcast to the room when a user stops typing (after 3s delay). |
| **`message-received`** | ⬇️ Server -> Client | `{ _id, sender, content, ... }` (Full Message Object) | Broadcast to all users in the conversation room to append the new message to the UI. |
| **`user-online`** | ⬇️ Server -> Client | `userId` (String) | Broadcast to all users when a new user connects and authenticates (updates contact list indicator). |
| **`user-offline`** | ⬇️ Server -> Client | `userId` (String) | Broadcast to all users when a user disconnects/logs out. |

---

## Deployment Configuration

| Component | Platform | Configuration Detail |
| :--- | :--- | :--- |
| **Frontend** | **Vercel** | **Root Directory:** `frontend` <br> **Env Var:** `VITE_BACKEND_URL` = [Render URL] |
| **Backend** | **Render** | **Root Directory:** `backend` <br> **Start Command:** `node src/server.js` <br> **Env Var (CORS):** `CLIENT_URL` = [Vercel URL] |
| **Static Assets** | Render/Express | Handled by `app.use('/uploads', express.static(...))` for media files. |