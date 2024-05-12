const express = require('express');
const router = express.Router();
const Backup = require('../models/backup.model');

// Thêm đồ vào kho
router.post('/', async (req, res) => {
    try {
        const { room, itemName, quantity, week, day, note } = req.body;
        const backup = new Backup({ room, itemName, quantity, week, day, note, history: [`Added ${quantity} on ${day}`] });
        await backup.save();
        res.status(201).json(backup);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi thêm đồ vào kho', error });
    }
});

// Lấy dữ liệu kho cho tuần, phòng và ngày cụ thể
router.get('/:week/:room/:day', async (req, res) => {
    try {
        const { week, room, day } = req.params;
        const backups = await Backup.find({ week, room, day });
        res.json(backups);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu kho', error });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { note, quantity } = req.body;
        const item = await Backup.findById(id);
        if (item) {
            const history = item.history || [];
            const updatedItem = await Backup.findByIdAndUpdate(id, { note, quantity, history }, { new: true });
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Không tìm thấy mục' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi cập nhật trạng thái', error });
    }
});

router.post('/sync/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const item = await Backup.findById(id);
        if (item) {
            const updateQuery = { itemName: item.itemName, room: item.room };
            await Backup.updateMany(updateQuery, { quantity });
            res.json({ message: 'Đồng bộ dữ liệu thành công' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy mục' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi đồng bộ dữ liệu', error });
    }
});

router.post('/take/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, note } = req.body;
        const item = await Backup.findById(id);
        if (item && amount > 0) {
            const newQuantity = item.quantity - amount;
            const historyEntry = `${new Date().toLocaleString()}: Rút ${amount} - ${note}`;
            const updateQuery = { itemName: item.itemName, room: item.room };

            await Backup.updateMany(updateQuery, {
                quantity: newQuantity,
                $push: { history: historyEntry }
            });

            res.json({ message: 'Rút đồ thành công', newQuantity });
        } else {
            res.status(404).json({ message: 'Không tìm thấy mục hoặc số lượng không hợp lệ' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi rút đồ', error });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Backup.findByIdAndDelete(id);
        res.json({ message: 'Đã xóa thành công' });
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi xóa mục', error });
    }
});

// Rút đồ khỏi kho
router.post('/take/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, note } = req.body;

        const backup = await Backup.findById(id);
        if (!backup) {
            return res.status(404).json({ message: 'Không tìm thấy mục này' });
        }

        backup.quantity -= amount;
        backup.history.push(`Took ${amount} on ${backup.day}: ${note}`);
        await backup.save();

        // Đồng bộ hóa số lượng cho tất cả các ngày và tuần
        await Backup.updateMany(
            { room: backup.room, itemName: backup.itemName },
            { quantity: backup.quantity, $push: { history: `Took ${amount} on ${backup.day}: ${note}` } }
        );

        res.json(backup);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi rút đồ', error });
    }
});

module.exports = router;
