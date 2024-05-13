const express = require('express');
const router = express.Router();
const Nhanvien = require('../models/nhanvien.model');

// Lấy dữ liệu nhân viên
router.get('/', async (req, res) => {
    try {
        const nhanviens = await Nhanvien.find();
        res.json(nhanviens);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Thêm hoặc cập nhật nhân viên
router.post('/', async (req, res) => {
    const nhanvienData = req.body.nhanviens; // Extract array from request body

    try {
        const bulkOps = nhanvienData.map(nv => ({
            updateOne: {
                filter: { name: nv.name }, // Use unique identifier
                update: nv,
                upsert: true // Create new if not exist
            }
        }));

        const result = await Nhanvien.bulkWrite(bulkOps);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Xóa nhân viên
router.delete('/:id', async (req, res) => {
    try {
        const nhanvien = await Nhanvien.findById(req.params.id);
        if (!nhanvien) return res.status(404).json({ message: 'Cannot find nhanvien' });

        await nhanvien.remove();
        res.json({ message: 'Deleted nhanvien' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
