const express = require('express');
const path = require('path');
const { upload } = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    const relativePath = path.basename(req.file.path);
    res.json({ 
        filePath: `uploads/${relativePath}`,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
    });
});

module.exports = router;
