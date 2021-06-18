const UssdMenu = require('ussd-menu-builder');
const unirest = require('unirest');
const generator = require('generate-serial-number')
let menu = new UssdMenu();
let sessions = {};
const appKey = '180547238'; const appId = '75318691';
const apiUrl = "http://api.alias-solutions.net:8443/DemoApi/api/lmc";


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

// menu.startState({
//     run: async() => {
//         await fetchaccount(menu.args.phoneNumber, (data)=> {
//             menu.con('Welcome to Ahantaman Rural Bank. Please create a PIN before continuing' + '\nEnter 4 digits.')
//         });
//     },
//     next: {
//         '*\\d+': 'user.pin'
//     }
// })

menu.state('user.pin',{
    run: () => {
        let pin = menu.val;
        menu.session.set('pin', pin);
        menu.con('Re-enter the 4 digits')
    },
    next: {
        '*\\d+': 'user.verifypin'
    }
})

menu.state('user.verifypin',{
    run: async() => {
        var vpin = Number(menu.val);
        var pin = await menu.session.get('pin');
        if(vpin == pin) {
            await createpin(menu.args.phoneNumber, (data) => {
                if (data.body.statusmessage == 'Success'){
                    menu.con('Thank you for successfully creating a PIN. Enter zero(0) to continue')
                }else{
                    menu.end('Something went wrong. Please contact Admin.')
                }

            })
        }else{
            menu.con('Enter zero(0) to create PIN again')
        }
    },
    next: {
        '0': 'mainmenu',
    }
})

///////////////--------------MENU STARTS--------------////////////////

menu.startState({
    run: async() => {
        await fetchaccount(menu.args.phoneNumber, (data)=> {
            // if(data.body[0].hpin == 'false'){
            //     menu.con('Welcome to Ahantaman Rural Bank. Please create a PIN before continuing' + '\n\nEnter 4 digits.')
            // }else{
                menu.con('Welcome to Ahantaman Rural Bank.' + '\nSelect an Option.' + 
                '\n1. Deposit' +
                '\n2. Withdrawal' +
                '\n3. Check Balance' +
                '\n4. Other',
                )        
            // }
        });
    },
    next: {
        '1': 'deposit',
        '2': 'withdrawal',
        '3': 'checkBalance',
        '4': 'other',
        '*\\d+': 'user.pin'
    }
})

menu.state('mainmenu',{
    run: async() => {
        await fetchaccount(menu.args.phoneNumber, (data)=> {
            if(data.body[0].hpin == 'false'){
                menu.con('Welcome to Ahantaman Rural Bank. Please create a PIN before continuing' + '\nEnter 4 digits.')
            }else{
                menu.con('Welcome to Ahantaman Rural Bank.' + '\nSelect an Option.' + 
                '\n1. Deposit' +
                '\n2. Withdrawal' +
                '\n3. Check Balance' +
                '\n4. Other',
                )        
            }
        });
    },
    next: {
        '1': 'deposit',
        '2': 'withdrawal',
        '3': 'checkBalance',
        '4': 'other',
        '^[0-9]*$': 'user.pin'
    }
})

///////////////--------------DEPOSIT STARTS--------------////////////////

menu.state('deposit',{
    run: async() => {
        var schemes = ''; var count = 1;
        var accounts = await menu.session.get('accountinfo');
        accounts.forEach(val => {
            schemes += '\n' + count + '. ' + val.accountType + ' A/C';
            count += 1;
        });
        menu.con('Please Select an Account' + schemes)
    },
    next: {
        '0': 'mainmenu',
        '*\\d+': 'currentac'
    }
})

menu.state('currentac', {
    run: () => {
        let userreq = Number(menu.val);
        menu.session.set('userreq', userreq);
        menu.con('How much would you like to pay?')
    },
    next: {
        '*\\d+': 'deposit.amount',
    }
})

menu.state('deposit.amount',{
    run: async() => {
        var amount = Number(menu.val);
        menu.session.set('amount', amount);

        var index = await menu.session.get('userreq');

        var accountinfo = await menu.session.get('accountinfo');
        var account = accountinfo[index-1];
        menu.session.set('accountnumber', account.accountNumber)
        menu.con(`${accountinfo[0].fullName}, you are making a deposit of GHS  ${amount}  into your ${account.accountType} account` +
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
    run: async() => {
        await registerdeposit(menu.args.phoneNumber, (data) => {
            // console.log(data.body)
            if(data.body.statusMessage == 'Success')
            {
                menu.end('Your transaction was successful. \n\nThank you.');
            }
            else
            {
                menu.end('Server Error. Please contact the admin')
            }
        })
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
    run: async() => {
        var epin = Number(menu.val);
        var pin = await menu.session.get('pin');
        if(epin != pin) {
            menu.con('Incorrect Pin' +
                '\n*. Try Again' +
                '\n#. Main Menu');
        }else{
            var schemes = ''; var count = 1;
            var accounts = await menu.session.get('accountinfo');
            accounts.forEach(val => {
                schemes += '\n' + count + '. ' + val.accountType + ' A/C';
                count += 1;
            });    

            menu.con('Please Select an Account' + schemes)
        }
    },
    next: {
        '#': 'mainmenu',
        '*': 'withdrawal',
        '*\\d+': 'currentAC'
    }
})


menu.state('currentAC',{
    run: () => {
        let userreq = Number(menu.val);
        menu.session.set('userreq', userreq);
        menu.con('How much would you like to withdraw?')
    },
    next: {
        '*\\d+': 'withdrawal.amount',
    }
})

menu.state('withdrawal.amount',{
    run: async() => {
        var amount = Number(menu.val);
        menu.session.set('amount', amount);

        var index = await menu.session.get('userreq');

        var accountinfo = await menu.session.get('accountinfo');
        var account = accountinfo[index-1];
        menu.session.set('accountnumber', account.accountNumber)
        menu.con(`${accountinfo[0].fullName}, you are making a withdrawal of GHS  ${amount}  from your ${account.accountType} account` +
        '\n1. confirmwithdrawal' +
        '\n2. Cancel'
        )
    },
    next: {
        '1': 'confirmwithdrawal',
        '2': 'deposit',
    }
})

menu.state('confirmwithdrawal',{
    run: async() => {
        await registerwithdrawal(menu.args.phoneNumber, (data) => {
            console.log(data);
            menu.end('Your withdrawal has been submitted. \n\n Thank you.')
        })
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

///////////////--------------PENSION STARTS--------------////////////////

menu.state('pension',{
    run: () => {
        menu.con('1. Pay' + '\n2. Register for Someone' + '\n3. Pay for Someone')
    },
    next: {
        '1': 'pay',
        '2': 'icare.register',
        '3': 'icare.pay',
    }
})

///////////////--------------PENSION > PAY STARTS--------------////////////////
menu.state('pay', {
    run: async() => {
        let name = await menu.session.get('name');
        menu.con(`Dear ${name}, How much would you like to pay?`)
    },
    next: {
        '*\\d+': 'pay.amount'
    }
})

menu.state('pay.amount', {
    run: () => {
        let amount = menu.val;
        menu.session.set('amount', amount);

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
    run: async() => {
        var schemes = ''; var count = 1;
        var accounts = await menu.session.get('schemes');
        accounts.forEach(val => {
            schemes += '\n' + count + '. ' + val.schemeType + ' A/C';
            count += 1;
        });
        menu.con('Please select Preferred Scheme Number: ' + schemes)
    },
    next: {
        '1': 'policy.proceed',
        '2': 'policy.proceed',
        '3': 'policy.proceed',
    }
})

menu.state('policy.proceed', {
    run: async() => {
        var index = Number(menu.val);
        var accounts = await menu.session.get('schemes');
        // console.log(accounts);
        var account = accounts[index-1]
        menu.session.set('schemenumber', account);
        let amount = await menu.session.get('amount'); 
        menu.con(`Make sure you have enough wallet balance to proceed with transaction of GHS ${amount} ` +
        '\n1. Proceed' +
        '\n0. Exit'
        )
    },
    next: {
        '0': 'policy',
        '1': 'policy.accepted',
    }
})

menu.state('policy.accepted', {
    run: () => {
        payment();
    }
})



menu.state('srp', {
    run: () => {
        menu.end('You have successfully cancelled your Repeat Payments')
    }
})


///////////////--------------PENSION > REGISTER FOR SOMEONE STARTS--------------////////////////

menu.state('icare.register', {
    run: () => {
        menu.con('Please enter Person\'s first name')
    },
    next: {
        '*[a-zA-Z]+': 'register.firstname'
    }
})

menu.state('register.firstname', {
    run: () => {
        let firstname = menu.val;
        menu.session.set('icarefirstname', firstname);
        menu.con('Please enter Person\'s last name')
    },
    next: {
        '*[a-zA-Z]+': 'register.phonenumber'
    }
})

menu.state('register.phonenumber', {
    run: () => {
        let lastname = menu.val;
        menu.session.set('icarelastname', lastname);
        menu.con('Enter Mobile Number of Person')
    },
    next: {
        '*\\d+': 'register.confirm'
    }
})


menu.state('register.confirm', {
    run: async() => {
        let phonenumber = menu.val;
        menu.session.set('icaremobile', phonenumber);        
        var Firstname = await menu.session.get('icarefirstname');
        var Lastname = await menu.session.get('icarelastname');
        var Mobile = await menu.session.get('icaremobile');
        menu.con('Please confirm the registration details below to continue:' +
        '\nFirst Name - ' + Firstname +
        '\nLast Name - '+ Lastname + 
        '\nMobile Number - '+ Mobile + 
        '\n\n0. Make Changes' +
        '\n1. Confirm')
    },
    next: {
        '0': 'icare.register',
        '1': 'register.pay',
    }
})

menu.state('register.pay', {
    run: async() => {
        var name = await menu.session.get('icarefirstname') + ' ' + await menu.session.get('icarelastname');
        menu.session.set('icarename', name);

        await register();
    },
    next: {
        '0': 'exit',
        '1': 'icare.phonenumber',
    }
})

menu.state('exit', {
    run: () => {
        menu.end('')
    }
})

menu.state('icare.phonenumber', {
    run: () => {
        menu.con('Enter Mobile Number of Person')
    },
    next: {
        '*\\d+': 'icare.pay'
    }
})

menu.state('icare.pay', {
    run: async() => {
        let phonenumber = menu.val;
        menu.session.set('icaremobile', phonenumber);
        let name = await menu.session.get('icarename');
        menu.con(`Enter amount to pay for ${name}`)
    },
    next: {
        '*\\d+': 'pay.amount'
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

async function fetchaccount (val, callback) {
    if (val && val.startsWith('+233')) {
        // Remove Bearer from string
        val = val.replace('+233','233');
    }

    let data = {
        appId: appId,
        appKey: appKey,
        mobile: val
    }

    // console.log(data);

    var request = unirest('POST', `${apiUrl}/accountInfo`)
        .headers({
            'Content-Type': ['application/json', 'application/json']
        })
        .send(JSON.stringify(data))
        .then(async (response) => {
                menu.session.set('accountinfo', response.body);
                // console.log(response.body)
            await callback(response);
        })
}

async function createpin (val, callback) {
    if (val && val.startsWith('+233')) {
        // Remove Bearer from string
        val = val.replace('+233','233');
    }

    let data = {
        appId: appId,
        appKey: appKey,
        mobile: val,
        pin: await menu.session.get('pin')
    }

    // console.log(data);

    var request = unirest('POST', `${apiUrl}/createPin`)
        .headers({
            'Content-Type': ['application/json', 'application/json']
        })
        .send(JSON.stringify(data))
        .then(async (response) => {
                // menu.session.set('accountinfo', response);
                console.log(response.body)
            await callback(response);
        })
}

async function registerdeposit (val, callback) {
    if (val && val.startsWith('+233')) {
        // Remove Bearer from string
        val = val.replace('+233','233');
    }

    let data = {
        appId: appId,
        appKey: appKey,
        mobile: val,
        accountnumber: await menu.session.get('accountnumber'),
        amount: await menu.session.get('amount'),
        success: 1,
        transactionid: generator.generate(7),
        reference: 'Deposit'
    }

    // console.log(data);

    var request = unirest('POST', `${apiUrl}/registerDeposit`)
        .headers({
            'Content-Type': ['application/json', 'application/json']
        })
        .send(JSON.stringify(data))
        .then(async (response) => {
                // console.log(response.body)
            await callback(response);
        })
}

async function registerwithdrawal (val, callback) {
    if (val && val.startsWith('+233')) {
        // Remove Bearer from string
        val = val.replace('+233','233');
    }

    let data = {
        appId: appId,
        appKey: appKey,
        mobile: val,
        accountnumber: await menu.session.get('accountnumber'),
        amount: await menu.session.get('amount'),
        success: 1,
        transactionid: generator.generate(7),
        reference: 'Withdrawal',
        pin: await menu.session.get('amount')
    }

    // console.log(data);

    var request = unirest('POST', `${apiUrl}/registerWithdrawal`)
        .headers({
            'Content-Type': ['application/json', 'application/json']
        })
        .send(JSON.stringify(data))
        .then(async (response) => {
                // menu.session.set('accountinfo', response);
                console.log(response.body)
            await callback(response);
        })
}


