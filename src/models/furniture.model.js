const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FurnitureSchema = new Schema({
    room: { type: String, required: true },
    furnitureName: { type: String, required: true },
    week: { type: Number, required: true },
    day: { type: String, required: true },
    status: { type: String, default: 'Tốt' },
    note: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    priority: { type: Boolean, default: false }
});

module.exports = mongoose.model('Furniture', FurnitureSchema);
