const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WorkingTimeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    hours: {
        type: String,
        required: true
    },
    holiday_hours: {
        type: String,
        required: true
    },
    employees: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }]
});

module.exports = WorkingTime = mongoose.model('working_time', WorkingTimeSchema);