const mongoose = require('mongoose');
var  { Contestant } = require('../models/contestant.model');
var ObjectId = require('mongoose').Types.ObjectId;

// Registering Contestant
module.exports.register = (req, res, next) => {
    var contestant = new Contestant({
    name: req.body.name,
    });
    if (req.body.name == null || req.body.name == ""){
        res.status(422).send(['Ensure all fields were provided.']);
    }else{
        contestant.save((err, doc) => {
                if (!err)
                    res.send(doc);
                else {
                    if (err.code == 11000)
                        res.status(422).send(['Duplicate Name found.']);
                    else
                        return next(err);
                }

            });
    }
}

// Getting all contestants array
module.exports.get = (req, res) => {
    Contestant.find((err, docs) => {
        if (!err) { res.send(docs); }
        else { console.log('Error in retrieving Contestants :' + JSON.stringify(err, undefined, 2))}
    });
}

// Getting all Contestants count
module.exports.getAllCount = (req, res) => {
    Contestant.countDocuments({}, (err, docs) => {
        if (!err) { res.json(docs); }
        else { console.log('Error in retrieving Contestants Count :' + JSON.stringify(err, undefined, 2))}
    });
}

// Finding an attendance with ID
module.exports.getID = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No Contestant found with given id : ${req.params.id}`);

        Contestant.findById(req.params.id, (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in Retrieving Contestant :' + JSON.stringify(err, undefined, 2))};
        });
}

// Updating a attendance with ID
module.exports.put = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No Contestant found with given id : ${req.params.id}`);
        
        var contestant = {
            name: req.body.name,
        };
        
        Contestant.findByIdAndUpdate(req.params.id, {$set: contestant}, {new: true}, (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in Contestant Update :' + JSON.stringify(err, undefined, 2))}; 
        });
}


// Deleting a attendance with ID
module.exports.delete = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No Contestant found with given id : ${req.params.id}`);
        
        Contestant.findByIdAndRemove(req.params.id, (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in Retrieving Contestant :' + JSON.stringify(err, undefined, 2))};
        });
}