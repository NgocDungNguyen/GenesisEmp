const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    shift: {
        type: String,
        required: true
    },
    note: {
        type: String
    },
    status: {
        type: String,
        default: 'Pending'
    }
});

module.exports = mongoose.model('Trade', tradeSchema);
