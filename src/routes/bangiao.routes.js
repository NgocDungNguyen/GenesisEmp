const express = require('express');
const router = express.Router();
const Furniture = require('../models/furniture.model');

// Add furniture for each day of the week
router.post('/rooms', async (req, res) => {
    try {
        const { room, furnitureName, week } = req.body;
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        for (const day of daysOfWeek) {
            const existingFurniture = await Furniture.findOne({ room, furnitureName, week, day });
            if (!existingFurniture) {
                const newFurniture = new Furniture({ room, furnitureName, week, day });
                await newFurniture.save();
            } else {
                console.log(`Furniture ${furnitureName} already exists in ${room} for ${day} of week ${week}`);
            }
        }

        res.status(201).json({ message: 'Thêm đồ đạc thành công cho tất cả các ngày trong tuần' });
    } catch (error) {
        console.error('Lỗi khi thêm đồ đạc:', error.message);
        res.status(500).json({ message: 'Lỗi khi thêm đồ đạc', error: error.message });
    }
});

// Get furniture by room, week, and day
router.get('/rooms/:week/:room/:day', async (req, res) => {
    try {
        const { week, room, day } = req.params;
        const furnitures = await Furniture.find({ week, room, day });
        res.status(200).json(furnitures);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu phòng:', error.message);
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu phòng', error: error.message });
    }
});

// Update furniture status
router.put('/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note, completed } = req.body;

        const updatedFurniture = await Furniture.findByIdAndUpdate(
            id,
            { status, note, completed },
            { new: true }
        );
        res.status(200).json({ message: 'Cập nhật trạng thái thành công', updatedFurniture });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error.message);
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái', error: error.message });
    }
});

module.exports = router;
