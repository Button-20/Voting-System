const mongoose = require('mongoose');

var Contestant = mongoose.model('Contestant', {
    name: {
        type: String,
        required: 'Name can\'t be empty',
    },
    created:{
        type: Date,
        default: Date.now()
    }

});

module.exports = { Attendance };