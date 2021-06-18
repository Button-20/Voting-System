const UssdMenu = require('ussd-menu-builder');
let menu = new UssdMenu();

///////////////---------------------USSD SESSION STARTS----------------------////////////////
module.exports.startUssd = (req, res) => {
    menu.run(req.body, ussdResult => {
        res.send(ussdResult);
    })
}

///////////////---------------------PROMO ROUTE STARTS----------------------////////////////
menu.startState({
    run: () => {
        menu.con('Enter Referral Code')
    },
    next: {
        '*\\d+': 'code'
    }
})

menu.state('code', {
    run: () => {
        menu.con('Dear (Customer Name), You are already registered. How much would you like to pay?')
    },
    next: {
        '*\\d+': 'pay'
    }
})

menu.state('pay', {
    run: () => {
        menu.con('Choose Option:' +
        '\n1. Daily' +
        '\n2. Weekly'+
        '\n3. Monthly' +
        '\n4. Only once' +
        '\n5. Stop Repeat Payments'
        )
    },
    next: {
        '1': 'policy',
        '2': 'policy',
        '3': 'policy',
        '4': 'policy',
        '5': 'srp'
    }
})

menu.state('policy', {
    run: () => {
        menu.con('Make sure you have enough wallet balance to proceed with transaction of GHS XXX' +
        '\n1. Proceed' +
        '\n0. Exit'
        )
    },
    next: {
        '0': 'policy.exit',
        '1': 'policy.accepted',
    }
})

menu.state('policy.accepted', {
    run: () => {
        menu.end('Request submitted successfully. You will receive a payment prompt shortly')
    }
})

menu.state('srp', {
    run: () => {
        menu.end('You have successfully cancelled your Repeat Payments')
    }
})
