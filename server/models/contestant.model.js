const mongoose = require('mongoose');

var Contestant = mongoose.model('Contestant', {
    name: {
        type: String,
        required: 'Name can\'t be empty',
        unique: true
    },
}, { timestamp: true });

module.exports = { Contestant };