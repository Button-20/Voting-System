const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Vote = mongoose.model('Vote', {
    name:{
        type: Schema.Types.ObjectId,
        ref: 'Contestant',
        require: true
    },
    numberofvotes:{
        type: Number,
        default: 0
    },
}, {timestamp: true});

module.exports = { Vote };