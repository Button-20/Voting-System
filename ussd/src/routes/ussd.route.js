module.exports = (app) => {
    var ussd = require('../controllers/pptcustomer.controller');
    var vslaleads = require('../controllers/VSLAgroupleads.controller');
    var vslamember = require('../controllers/VSLAgroupmember.controller');
    var register = require('../controllers/pptcustomerregister.controller');
    var promo = require('../controllers/pptpromo.controller');
    var selfpayment = require('../controllers/selfpayment.controller');
    var onbehalf = require('../controllers/onbehalf.controller');
    var ahantamanussd = require('../controllers/ahantamanussd.controller');
    var ahantamanussdpension = require('../controllers/ahantamanussdpension.controller');
    var kotokoussd = require('../controllers/kotokoussd.controller');
    var gprtuussdagent = require('../controllers/gprtuussdagent.controller');
    var gprtuussdmember = require('../controllers/gprtuussdmember.controller');



    app.post('/', ussd.startUssd);
    app.post('/promo', promo.startUssd);
    app.post('/register', register.startUssd);
    app.post('/vslaleads', vslaleads.startUssd);
    app.post('/vslamember', vslamember.startUssd);
    app.post('/selfpayment', selfpayment.startSession);
    app.post('/onbehalf', onbehalf.startSession);
    app.post('/ahantamanussd', ahantamanussd.startSession);
    app.post('/ahantamanussdpension', ahantamanussdpension.startSession);
    app.post('/kotokoussd', kotokoussd.startSession);
    app.post('/gprtuussdagent', gprtuussdagent.startSession);
    app.post('/gprtuussdmember', gprtuussdmember.startSession);
}