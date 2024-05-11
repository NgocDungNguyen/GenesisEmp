const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DocumentSchema = new Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    category: { type: String, required: true }
});

module.exports = mongoose.model('Document', DocumentSchema);
