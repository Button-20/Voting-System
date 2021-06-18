const UssdMenu = require('ussd-menu-builder');
let menu = new UssdMenu();
let sessions = {};

menu.sessionConfig({
    start: (sessionId, callback) => {
        // initialize current session if it doesn't exist
        // this is called by menu.run()
        if (!(sessionId in sessions)) sessions[sessionId] = {};
        callback();
    },
    end: (sessionId, callback) => {
        // clear current session
        // this is called by menu.end()
        delete sessions[sessionId];
        callback();
    },
    set: (sessionId, key, value, callback) => {
        // store key-value pair in current session
        sessions[sessionId][key] = value;
        callback();
    },
    get: (sessionId, key, callback) => {
        // retrieve value by key in current session
        let value = sessions[sessionId][key];
        callback(null, value);
    }
});


///////////////--------------USSD CODE STARTS--------------////////////////

menu.startState({
    run: () => {
        menu.con('Welcome to Ahantaman Rural Bank. Please create a PIN before continuing' + '\nEnter 4 digits.')
    },
    next: {
        '*\\d+': 'user.pin'
    }
})

menu.state('user.pin',{
    run: () => {
        menu.con('Re-enter the 4 digits')
    },
    next: {
        '*\\d+': 'user.verifypin'
    }
})

menu.state('user.verifypin',{
    run: () => {
        menu.con('Thank you for successfully creating a PIN. Enter zero(0) to continue')
    },
    next: {
        '0': 'mainmenu'
    }
})

// ///////////////--------------MENU STARTS--------------////////////////

// menu.startState({
//     run: () => {
//         menu.con('Welcome to Ahantaman Rural Bank.' + '\nSelect an Option.' + 
//         '\n1. Deposit' +
//         '\n2. Withdrawal' +
//         '\n3. Check Balance' +
//         '\n4. Other',
//         )
//     },
//     next: {
//         '1': 'deposit',
//         '2': 'withdrawal',
//         '3': 'checkBalance',
//         '4': 'other',
//     }
// })

menu.state('mainmenu',{
    run: () => {
        menu.con('Welcome to Ahantaman Rural Bank.' + '\nSelect an Option.' + 
        '\n1. Deposit' +
        '\n2. Withdrawal' +
        '\n3. Check Balance' +
        '\n4. Other',
        )
    },
    next: {
        '1': 'deposit',
        '2': 'withdrawal',
        '3': 'checkBalance',
        '4': 'other',
    }
})

///////////////--------------DEPOSIT STARTS--------------////////////////

menu.state('deposit',{
    run: () => {
        menu.con('Please Select an Account' +
        '\n1. Current A/C' +
        '\n2. Savings A/C' +
        '\n3. Susu A/C'
        )
    },
    next: {
        '0': 'mainmenu',
        '1': 'currentac',
        '2': 'currentac',
        '3': 'currentac'
    }
})

menu.state('currentac',{
    run: () => {
        menu.con('How much would you like to pay?')
    },
    next: {
        '*\\d+': 'deposit.amount',
    }
})

menu.state('deposit.amount',{
    run: () => {
        // use menu.val to access user input value
        var amount = Number(menu.val);
        menu.session.set('amount', amount);
        // save user input in session
        // menu.session.set('amount', amount);
        
        menu.con('[Username], you are making a deposit of GHS ' + amount +' into your [Account Type]account' +
        '\n1. Confirm' +
        '\n2. Cancel'
        )
    },
    next: {
        '1': 'confirm',
        '2': 'deposit',
    }
})

menu.state('confirm',{
    run: () => {
        menu.con('Enter Mobile Money PIN')
    },
    next: {
        '*\\d+': 'momo.pin'
    }
})

menu.state('momo.pin',{
    run: () => {
        menu.end('Your transaction was successful. \n\nThank you.')
    }
})


///////////////--------------WITHDRAWAL STARTS--------------////////////////

menu.state('withdrawal',{
    run: () => {
        menu.con('Enter your PIN to make a Withdrawal')
    },
    next: {
        '*\\d+': 'withdrawal.pin'
    }
})

menu.state('withdrawal.pin',{
    run: () => {
        menu.con('Please Select an Account' +
        '\n1. Current A/C' +
        '\n2. Savings A/C' +
        '\n3. Susu A/C',
        )
    },
    next: {
        '0': 'mainmenu',
        '1': 'currentAC',
        '2': 'currentAC',
        '3': 'currentAC'
    }
})


menu.state('currentAC',{
    run: () => {
        menu.con('How much would you like to withdraw?')
    },
    next: {
        '*\\d+': 'withdrawal.amount',
    }
})

menu.state('withdrawal.amount',{
    run: () => {
        // use menu.val to access user input value
        var amount = Number(menu.val);
        // save user input in session
        menu.session.set('amount', amount);

        menu.con('[Username], you are making a deposit of GHS '+ amount + ' into your [Account Type]account' +
        '\n1. Confirm' +
        '\n2. Cancel'
        )
    },
    next: {
        '1': 'confirmwithdrawal',
        '2': 'deposit',
    }
})

menu.state('confirmwithdrawal',{
    run: () => {
        menu.end('Your withdrawal has been submitted. \n\n Thank you.')
    }
})

///////////////--------------CHECK BALANCE STARTS--------------////////////////

menu.state('checkBalance',{
    run: () => {
        menu.con('Enter your PIN to check balance')
    },
    next: {
        '*\\d+': 'checkbalance.pin'
    }
})

menu.state('checkbalance.pin',{
    run: () => {
        menu.con('Please Select an Account' +
        '\n1. Current A/C'+
        '\n2. Savings A/C'+
        '\n3. Susu A/C'
        )
    },
    next: {
        '1': 'currentA/C',
        '2': 'currentA/C',
        '3': 'currentA/C'
    }
})

menu.state('currentA/C',{
    run: () => {
        menu.con('Your [Account Type] balance is GHS [Amount]' + '\n0. Return to Main Menu')
    },
    next: {
        '0': 'mainmenu',
    }
})




///////////////--------------OTHER TRANSACTIONS STARTS--------------////////////////

menu.state('other',{
    run: () => {
        menu.con('1. Change Pin' + '\n2. Open Account' + '\n3. Mini Satement')
    },
    next: {
        '1': 'changepin',
        '2': 'openaccount',
        '3': 'ministatement',
    }
})

///////////////--------------OTHER > CHANGE PIN STARTS--------------////////////////


menu.state('changepin',{
    run: () => {
        menu.con('Enter your current PIN')
    },
    next: {
        '*\\d+': 'currentpin'
    }
})

menu.state('currentpin',{
    run: () => {
        menu.con('Enter a new 4 digits PIN')
    },
    next: {
        '*\\d+': 'newpin'
    }
})

menu.state('newpin',{
    run: () => {
        menu.con('Re-enter new 4 digits PIN')
    },
    next: {
        '*\\d+': 'verify.pin'
    }
})

menu.state('verify.pin',{
    run: () => {
        menu.end('You have successfully changed your PIN number.')
    }
})

///////////////--------------OTHER > OPEN ACCOUNT STARTS--------------////////////////


menu.state('openaccount',{
    run: () => {
        menu.con('Please contact Ahantaman Rural Bank on <telephone_num> for assistance with account opening. Thank you' +	
        '\n\n0.	Return to Main Menu')
    },
    next: {
        '0': 'mainmenu'
    }
})

///////////////--------------OTHER > MINI STATEMENT STARTS--------------////////////////

menu.state('ministatement',{
    run: () => {
        menu.con('Enter your PIN to check your Mini Statement')
    },
    next: {
        '*\\d+': 'ministatement.pin'
    }
})

menu.state('ministatement.pin',{
    run: () => {
        menu.con('Your last 3 maximum transactions were: ' + 
        '\n1. [Transaction 1]' +
        '\n2. [Transaction 2]' +
        '\n3. [Transaction 3]' +
        '\n\n0. Return to Main Menu'
        )
    },
    next: {
        '0': 'mainmenu'
    }
})

//////////-------------START SESSION FUNCTION--------------//////////////
module.exports.startSession = (req, res) => {
    menu.run(req.body, ussdResult => {
        res.send(ussdResult);
    });
}

