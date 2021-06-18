const mongoose = require('mongoose');

var Dues = mongoose.model('Dues', {
    classname: { type: String, ref: 'User' },
    userid: {
        type: String,
        ref: 'User',
        required: 'User ID can\'t be empty'
    },
    membername: {
        type: String,
        ref: 'Member',
        required: 'Member Name can\'t be empty'
    },
    amount: {
        type: Number,
        required: 'Amount can\'t be empty'
    },    
    dateofpayment:{
        type: Date
    },
    description:{
        type: String
    },
    created:{
        type: Date,
        default: Date.now()
    }

});

module.exports = { Dues };