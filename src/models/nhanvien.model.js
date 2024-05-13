const mongoose = require('mongoose');

const nhanvienSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    desk: {
        type: Boolean,
        default: false
    },
    roles: {
        gone: { type: Array, default: [] },
        gum: { type: Array, default: [] },
        hns: { type: Array, default: [] },
        am: { type: Array, default: [] },
        ngai1: { type: Array, default: [] },
        ngai2: { type: Array, default: [] },
        chd: { type: Array, default: [] },
        rrlm: { type: Array, default: [] }
    },
    registration: {
        type: String,
        enum: ['Đã đki làm', 'Chưa đki làm'],
        default: 'Chưa đki làm'
    }
});

module.exports = mongoose.model('Nhanvien', nhanvienSchema);
