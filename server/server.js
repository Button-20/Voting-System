require('./config/config');
require('./models/db');
require('./config/passportconfig');

const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');
const passport = require('passport');
const PORT = process.env.PORT || 8000;
const rtsIndex = require('./routes/index.router');

var app = express();
// var allowedDomains = ['http://localhost:4200', 'https://alias-egroups.web.app'];

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cors({
//     origin: function (origin, callback) {
//       // bypass the requests with no origin (like curl requests, mobile apps, etc )
//       if (!origin) return callback(null, true);
   
//       if (allowedDomains.indexOf(origin) === -1) {
//         var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     }
//   }));
app.use(passport.initialize());
app.use('/api', rtsIndex);

// error handler
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        var valErrors = [];
        Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
        res.status(422).send(valErrors)
    }
    else{
        console.log(err);
    }
});

// start server
app.listen(PORT, () => console.log(`Server started at port : ${PORT}`));