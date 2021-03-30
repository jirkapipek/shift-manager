const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobPositionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    default_salary: {
        type: String,
        required: true
    },
    employees: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }]
});

module.exports = JobPosition = mongoose.model('job_position', JobPositionSchema);