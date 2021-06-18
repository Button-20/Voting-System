const mongoose = require('mongoose');
var  { Member } = require('../models/category.model');
var ObjectId = require('mongoose').Types.ObjectId;
var xlsxtojson = require('xlsx-to-json');
global.__basedir = __dirname;

// Registering a Member
module.exports.register = (req, res, next) => {
    var mem = new Member({
    classname: req.body.classname,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    othername: req.body.othername,
    gender: req.body.gender,
    email: req.body.email,
    digitaladdress: req.body.digitaladdress,
    phonenumber: req.body.phonenumber,
    dateofbirth: req.body.dateofbirth
    });
    if (req.body.firstname == null || req.body.firstname == "" || req.body.lastname == null || req.body.lastname == "" || req.body.gender == null || req.body.gender == "" || req.body.email == null || req.body.email == "" || req.body.digitaladdress == null || req.body.digitaladdress == "" || req.body.phonenumber == null || req.body.phonenumber == "" || req.body.dateofbirth == null || req.body.dateofbirth == ""){
        res.status(422).send(['Ensure all fields were provided.']);
    }else{
            mem.save((err, doc) => {
                if (!err)
                    res.send(doc);
                else {
                    if (err.code == 11000)
                        res.status(422).send(['Duplicate Member found.']);
                    else
                        return next(err);
                }

            });
    }
}


// Insert Many Members From Excel To MongoDB
module.exports.create = async(req, res) => {
    console.info('started');
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send({ message: 'No files were uploaded.' });
    }

    if (!req.params.type) {
        return res.status(400).send({ message: 'Image Type must be Provided.' });
    }
    console.log(req.files.file);
    // The name of the input field (i.e. "gallery") is used to retrieve the uploaded file
    const file = req.files.file;
    const fname = new Date().getTime() + file.name.replace(/ /g, "_");
    const name = appRoot + '/../public/' + req.params.type + '/' + fname;
    console.log(name)
        // Use the mv() method to place the file somewhere on your server
    file.mv(name, function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        console.log(result);
        // Create a Gallery
        var mem = new Member({
            classname: req.body.classname,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            othername: req.body.othername,
            gender: req.body.gender,
            email: req.body.email,
            digitaladdress: req.body.digitaladdress,
            phonenumber: req.body.phonenumber,
            dateofbirth: req.body.dateofbirth
            });        

        // Save a Gallery in the MongoDB
        mem.save()
            .then(data => {
                res.send(data);
            }).catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });
        res.send('File uploaded!');
    });
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Getting all members array
module.exports.get = (req, res) => {
    Member.find((err, docs) => {
        if (!err) { res.send(docs); }
        else { console.log('Error in retrieving Members :' + JSON.stringify(err, undefined, 2))}
    });
}

// Getting all members array with specific classnmae
module.exports.getCount = (req, res) => {
    Member.countDocuments({classname: req.params.classname}, (err, docs) => {
        if (!err) { res.json(docs); }
        else { console.log('Error in retrieving Members Count :' + JSON.stringify(err, undefined, 2))}
    });
}

// Getting all members array
module.exports.getAllCount = (req, res) => {
    Member.countDocuments({}, (err, docs) => {
        if (!err) { res.json(docs); }
        else { console.log('Error in retrieving Members Count :' + JSON.stringify(err, undefined, 2))}
    });
}

// Getting all members array
module.exports.getAllMaleCount = (req, res) => {
    Member.countDocuments({gender: "Male"}, (err, doc) => {
        if (!err) { res.json(doc); }
        else { console.log('Error in Retrieving Member Male :' + JSON.stringify(err, undefined, 2))};
    });
}

// Getting all members array
module.exports.getAllFemaleCount = (req, res) => {
    Member.countDocuments({gender: "Female"}, (err, doc) => {
        if (!err) { res.json(doc); }
        else { console.log('Error in Retrieving Member Male :' + JSON.stringify(err, undefined, 2))};
    });
}


// Finding a member with ID
module.exports.getID = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No member found with given id : ${req.params.id}`);

        Member.findById(req.params.id, (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in Retrieving Member :' + JSON.stringify(err, undefined, 2))};
        });
}

// Finding a member with Classname
module.exports.getClassname = (req, res) => {
        Member.find({classname: req.params.classname}, (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in Retrieving Member :' + JSON.stringify(err, undefined, 2))};
        });
}

// Finding a member with Male Gender
module.exports.getMale = (req, res) => {
        Member.countDocuments({classname: req.params.classname, gender: "Male"}, (err, doc) => {
            if (!err) { res.json(doc); }
            else { console.log('Error in Retrieving Member Male :' + JSON.stringify(err, undefined, 2))};
        });
}

// Finding a member with Female Gender
module.exports.getFemale = (req, res) => {
        Member.countDocuments({classname: req.params.classname, gender: "Female"}, (err, doc) => {
            if (!err) { res.json(doc); }
            else { console.log('Error in Retrieving Member Female :' + JSON.stringify(err, undefined, 2))};
        });
}

// Updating a member with ID
module.exports.put = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No member found with given id : ${req.params.id}`);
        
        var mem = {
            classname: req.body.classname,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            othername: req.body.othername,
            gender: req.body.gender,
            email: req.body.email,
            digitaladdress: req.body.digitaladdress,
            phonenumber: req.body.phonenumber,
            dateofbirth: req.body.dateofbirth,
        };
        
        Member.findByIdAndUpdate(req.params.id, {$set: mem}, {new: true}, (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in Member Update :' + JSON.stringify(err, undefined, 2))}; 
        });
}


// Deleting a member with ID
module.exports.delete = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No member found with given id : ${req.params.id}`);
        
       Member.findByIdAndRemove(req.params.id, (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in Retrieving Member :' + JSON.stringify(err, undefined, 2))};
        });
}