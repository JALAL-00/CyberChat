// backend/src/routes/chatRoutes.js

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    getUsersForChat,
    findOrCreateConversation,
    getMessages,
} = require('../controllers/chatController');

const router = express.Router();

// All routes after this middleware will require a valid JWT
router.use(protect); 

// @route GET /api/chat/users
router.get('/users', getUsersForChat);

// @route POST /api/chat/conversations
router.post('/conversations', findOrCreateConversation);

// @route GET /api/chat/conversations/:id/messages
router.get('/conversations/:id/messages', getMessages);

module.exports = router;