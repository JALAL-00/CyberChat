# MERN Real-time Chat Application

A full-stack real-time private messaging application built to fulfill the MERN Developer task requirements.

## 🚀 Live Demo

- **Frontend:** [Your Vercel/Netlify URL]
- **Backend/API:** [Your Render URL]

## 🛠️ Technical Stack

- **Backend:** Node.js, Express, MongoDB (via Mongoose), Socket.IO
- **Frontend:** React, Redux Toolkit + Redux Thunk, Socket.IO Client, Vite, Tailwind CSS / Shadcn UI
- **Database:** MongoDB Atlas

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account (for connection URI)

### 2. Backend Setup
1. Clone the repository: `git clone <repo-url>`
2. Navigate to the backend directory: `cd mern-chat-app/backend`
3. Install dependencies: `npm install`
4. Create a `.env` file and populate it with your configuration:
    ```env
    MONGO_URI="mongodb+srv://user:pass@cluster0.xyz.mongodb.net/chat_app" 
    JWT_SECRET="a_secure_random_string"
    JWT_EXPIRE="10d"
    CLIENT_URL="http://localhost:5173"  # Use the port your frontend is running on
    PORT=5001
    ```
5. Start the server: `npm run dev` (Runs on http://localhost:5001)

### 3. Frontend Setup
1. Navigate to the frontend directory: `cd ../frontend`
2. Install dependencies: `npm install`
3. Create a `.env.local` file:
    ```env
    VITE_BACKEND_URL=http://localhost:5001
    ```
4. Start the client: `npm run dev` (Runs on http://localhost:5173)

## 📡 Socket Events Documentation (REQUIRED)

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| **`message-sent`** | ⬆️ Client -> Server | `{ conversationId, content, type, mediaUrl }` | Sent by the user when they submit a message. |
| **`message-received`** | ⬇️ Server -> Client | `{ _id, sender, content, ... }` (Full Message Object) | Broadcast to all participants in a conversation room when a new message is saved. |
| **`user-online`** | ⬇️ Server -> Client | `userId` (String) | Broadcast to all connected users when a new user connects and authenticates. |
| **`user-offline`** | ⬇️ Server -> Client | `userId` (String) | Broadcast to all connected users when a user disconnects. |
| **`join-conversation`**| ⬆️ Client -> Server | `conversationId` (String) | Sent when a user clicks a contact to open a chat window. Tells the server to join the Socket.IO room. |
| **`typing-start`** | ⬆️ Client -> Server | `{ conversationId }` | Sent when a user starts typing in a conversation. |
| **`typing-stopped`** | ⬇️ Server -> Client | `{ userId, conversationId }` | Broadcast to the conversation room when a user stops typing. |

### 6.3 Demo Video (Screen Recording)

Record a short video (under 2 minutes) demonstrating the following, ideally side-by-side in two browser windows:
1.  **Login** (User 1 and User 2).
2.  **Online Status** (Show the other user appear in the contact list).
3.  **Start Conversation** (Click a contact).
4.  **Real-time Messaging** (Send a message from User 1 to User 2).
5.  **Typing Indicator** (Show User 2 typing, and User 1 seeing the "Typing..." text).

### 6.4 Deployment

1.  **Backend (Node/Express):** Deploy to **Render**.
    *   Update `CLIENT_URL` in the Render environment variables to your Vercel/Netlify domain.
2.  **Frontend (React/Vite):** Deploy to **Vercel** or **Netlify**.
    *   Update `VITE_BACKEND_URL` in the Vercel/Netlify environment variables to your Render API URL.

**Once you complete the two-user test, you are ready for the submission steps above! Congratulations!**