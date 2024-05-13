const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Bán Ca', 'Mua Ca']
    },
    name: {
        type: String,
        required: true
    },
    shift: {
        type: String,
        required: true,
        enum: ['Morning', 'Afternoon', 'Evening', 'Night']
    },
    note: {
        type: String
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Approved', 'Rejected']
    }
});

module.exports = mongoose.model('Trade', tradeSchema);
