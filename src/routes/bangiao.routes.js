const express = require('express');
const router = express.Router();
const Furniture = require('../models/furniture.model');

// Add furniture
router.post('/rooms', async (req, res) => {
    try {
        const { room, furnitureName, week, day } = req.body;
        const newFurniture = new Furniture({ room, furnitureName, week, day });
        await newFurniture.save();
        res.status(201).json({ message: 'Thêm đồ đạc thành công cho tất cả các ngày trong tuần' });
    } catch (error) {
        console.error('Lỗi khi thêm đồ đạc:', error);
        res.status(500).json({ message: 'Lỗi khi thêm đồ đạc', error: error.message });
    }
});

// Get furniture by room, week and day
router.get('/rooms/:week/:room/:day', async (req, res) => {
    try {
        const { week, room, day } = req.params;
        const furnitures = await Furniture.find({ week: week, room: room, day: day }).sort({ priority: -1 });
        res.status(200).json(furnitures);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu phòng:', error);
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu phòng', error: error.message });
    }
});

// Update furniture status
router.put('/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note, completed, day } = req.body;
        const updatedFurniture = await Furniture.findByIdAndUpdate(
            id,
            { status, note, completed, day },
            { new: true }
        );
        res.status(200).json({ message: 'Cập nhật trạng thái thành công', updatedFurniture });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái', error: error.message });
    }
});

// Delete furniture
router.delete('/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Furniture.findByIdAndDelete(id);
        res.status(200).json({ message: 'Đã xóa thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa mục:', error);
        res.status(500).json({ message: 'Lỗi khi xóa mục', error: error.message });
    }
});

// Toggle priority
router.patch('/rooms/:id/priority', async (req, res) => {
    try {
        const { id } = req.params;
        const furniture = await Furniture.findById(id);
        if (furniture) {
            furniture.priority = !furniture.priority;
            await furniture.save();
            res.status(200).json({ message: 'Đã thay đổi ưu tiên thành công', furniture });
        } else {
            res.status(404).json({ message: 'Không tìm thấy đồ đạc' });
        }
    } catch (error) {
        console.error('Lỗi khi thay đổi ưu tiên:', error);
        res.status(500).json({ message: 'Lỗi khi thay đổi ưu tiên', error: error.message });
    }
});

module.exports = router;
