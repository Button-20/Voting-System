const mongoose = require('mongoose');
var  { Categories } = require('../models/categories.model');
var ObjectId = mongoose.Types.ObjectId;
global.__basedir = __dirname;


// Updating Vote
module.exports.put = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No vote found with given id : ${req.params.id}`);
        
        var categories = {
            bestdancer: req.body.classname,
            bestvocalist: req.body.firstname,
            bestmaleactor: req.body.lastname,
            bestfemaleactress: req.body.othername,
            mostpopularsong: req.body.gender,
        };
        
        Categories.updateOne(req.params.id, {$set: categories}, {new: true}, (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in Member Update :' + JSON.stringify(err, undefined, 2))}; 
        });
}
