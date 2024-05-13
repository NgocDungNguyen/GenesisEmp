const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Document = require('../models/document.model');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const safeFilename = file.originalname.replace(/[^\w.]+/g, '_');
        cb(null, Date.now() + '-' + safeFilename);
    }
});
const upload = multer({ storage: storage });

// Route to upload documents
router.post('/documents', upload.single('file'), async (req, res) => {
    try {
        const { category } = req.body;
        const filePath = `/uploads/${req.file.filename}`;
        
        const newDocument = new Document({
            name: req.file.originalname,
            url: filePath,
            category: category
        });

        await newDocument.save();
        res.status(201).json({ message: 'Tài liệu đã được tải lên thành công' });
    } catch (error) {
        console.error('Lỗi khi tải lên tài liệu:', error);
        res.status(500).json({ message: 'Lỗi khi tải lên tài liệu', error: error.message });
    }
});

// Route to get documents by category
router.get('/documents/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const documents = await Document.find({ category: category });
        res.status(200).json(documents);
    } catch (error) {
        console.error('Lỗi khi lấy tài liệu:', error);
        res.status(500).json({ message: 'Lỗi khi lấy tài liệu', error: error.message });
    }
});

// Route to delete a document
router.delete('/documents/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const document = await Document.findByIdAndDelete(id);
        if (document) {
            res.status(200).json({ message: 'Tài liệu đã được xóa thành công' });
        } else {
            res.status(404).json({ message: 'Tài liệu không tồn tại' });
        }
    } catch (error) {
        console.error('Lỗi khi xóa tài liệu:', error);
        res.status(500).json({ message: 'Lỗi khi xóa tài liệu', error: error.message });
    }
});

// Serve files statically
router.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

module.exports = router;
