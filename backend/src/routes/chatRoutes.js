const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    getUsersForChat,
    findOrCreateConversation,
    getMessages,
} = require('../controllers/chatController');

const router = express.Router();

router.use(protect);

router.get('/users', getUsersForChat);

router.post('/conversations', findOrCreateConversation);

router.get('/conversations/:id/messages', getMessages);

module.exports = router;
