# MERN Real-time Chat Application

A full-stack real-time private messaging application built to fulfill the MERN Developer task requirements.

## Live Demo

- **Frontend:** [Your Vercel/Netlify URL]
- **Backend/API:** [Your Render URL]

## Technical Stack

- **Backend:** Node.js, Express, MongoDB (via Mongoose), Socket.IO
- **Frontend:** React, Redux Toolkit + Redux Thunk, Socket.IO Client, Vite, Tailwind CSS / Shadcn UI
- **Database:** MongoDB Atlas

## Setup Instructions

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

### 6.3 Demo Video (Screen Recording)


### 6.4 Deployment

1.  **Backend (Node/Express):** Deploy to **Render**.
    *   Update `CLIENT_URL` in the Render environment variables to your Vercel/Netlify domain.
2.  **Frontend (React/Vite):** Deploy to **Vercel** or **Netlify**.
    *   Update `VITE_BACKEND_URL` in the Vercel/Netlify environment variables to your Render API URL.

**Once you complete the two-user test, you are ready for the submission steps above! Congratulations!**