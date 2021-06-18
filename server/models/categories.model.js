const mongoose = require('mongoose');
const {Vote} = require('../models/vote.model')

var Categories = mongoose.model('Categories', {
    bestdancer: [Vote],
    bestvocalist: [Vote],
    bestmaleactor: [Vote],    
    bestfemaleactress:[Vote],
    mostpopularsong:[Vote]
});

module.exports = { Categories };