const UssdMenu = require('ussd-menu-builder');
let menu = new UssdMenu;

//////////-------------START SESSION FUNCTION--------------//////////////
module.exports.startSession = (req, res) => {
    menu.run(req.body, ussdResult => {
        res.send(ussdResult);
    });
}

// Define menu states
menu.startState({
    run: () => {
        // use menu.con() to send response without terminating session      
        menu.con('Enter Group Member Number');
    },
    // next object links to next state based on user input
    next: {
        '*\\d+': 'member.number'
    }
});

menu.state('member.number', {
    run: () => {
        menu.con('Welcome [Name]. You are making payment on behalf of [MemberName].' +
        '\nSelect Desired Option' +
        '\n1. Pension'+
        '\n2. Exit'
        );
    },
    next: {
        '1': 'pension',
        '2': 'exit'
    }
});

menu.state('pension', {
    run: () => {
        menu.con('Enter Amount');
    },
    next: {
        '*\\d+': 'pension.amount'
    }
});

menu.state('pension.amount', {
    run: () => {
        var amount = menu.val;
        menu.session.set('amount', amount)
        menu.con('Authorize payment of GH' + amount +' to [account number]' + '\nEnter MM PIN to confirm');
    },
    next: {
        '*\\d+': 'pension.pin'
    }
});

menu.state('pension.pin', {
    run: () => {
        menu.session.get('amount')
        .then( amount => {
            menu.end('You have successfully paid GH'+ amount + ' to [account]');
        })
    }
});


