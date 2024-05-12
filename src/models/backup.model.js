const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
    room: { type: String, required: true },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    week: { type: Number, required: true },
    day: { type: String, required: true },
    note: { type: String, default: '' },
    history: { type: [String], default: [] }
});

const Backup = mongoose.model('Backup', backupSchema);

module.exports = Backup;
