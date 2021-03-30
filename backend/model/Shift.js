const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShiftSchema = new Schema({
    date: {
        type: String,
        required: true
    },
    time_from: {
        type: String,
        required: true
    },
    time_to: {
        type: String,
        required: true
    },
    length: {
        type: String,
        required: true
    },
    request: {
        type: Boolean,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
});

module.exports = Shift = mongoose.model('shifts', ShiftSchema);