module.exports = (app) => {
    var votingussd = require('../controllers/votingussd.controller');

    app.post('/', votingussd.startSession);
}