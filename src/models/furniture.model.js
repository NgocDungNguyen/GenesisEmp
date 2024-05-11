const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FurnitureSchema = new Schema({
    room: { type: String, required: true },
    furnitureName: { type: String, required: true },
    week: { type: Number, required: true },
    day: { type: String, required: true },
    status: { type: String, default: 'Tốt' },
    note: { type: String, default: '' },
    completed: { type: Boolean, default: false }
});

FurnitureSchema.index({ room: 1, furnitureName: 1, week: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('Furniture', FurnitureSchema);
