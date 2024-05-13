const express = require('express');
const router = express.Router();
const Trade = require('../models/trade.model');

// Lấy tất cả các yêu cầu trade
router.get('/', async (req, res) => {
    try {
        const trades = await Trade.find();
        res.json(trades);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Tạo yêu cầu trade mới
router.post('/', async (req, res) => {
    const trade = new Trade({
        type: req.body.type,
        name: req.body.name,
        shift: req.body.shift,
        note: req.body.note
    });
    try {
        const newTrade = await trade.save();
        res.status(201).json(newTrade);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Duyệt yêu cầu trade
router.put('/:id/approve', async (req, res) => {
    try {
        const trade = await Trade.findById(req.params.id);
        if (!trade) return res.status(404).json({ message: 'Trade request not found' });

        trade.status = 'Approved';
        await trade.save();

        res.json(trade);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Từ chối yêu cầu trade
router.delete('/:id', async (req, res) => {
    try {
        const trade = await Trade.findById(req.params.id);
        if (!trade) return res.status(404).json({ message: 'Trade request not found' });

        await trade.remove();
        res.json({ message: 'Trade request deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
