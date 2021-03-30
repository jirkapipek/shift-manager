const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    position: {
        type: Schema.Types.ObjectId,
        ref: 'job_position',
    },
    workingTime: {
        type: Schema.Types.ObjectId,
        ref: 'working_time',
    },
    shifts: [{
        type: Schema.Types.ObjectId,
        ref: 'shifts',
    }],
    role: {
        type: String,
        required: true
    }

});

module.exports = User = mongoose.model('users', UserSchema);