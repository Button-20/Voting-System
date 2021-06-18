const UssdMenu = require('ussd-menu-builder');
const unirest = require('unirest');
var generator = require('generate-serial-number');
let menu = new UssdMenu();
let sessions = {};
const appKey = '062262554'; const appId = '052683438';
const apiUrl = "https://api.alias-solutions.net:8446/api/services/app/Channels";

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


menu.on('error', (err) => {
    // handle errors
    console.log('Error', err);
});



///////////////--------------MENU STARTS--------------////////////////

menu.startState({
    run: async() => {
        await fetchAccount(menu.args.phoneNumber, (data)=> {
            // console.log(data);
            if (data.body.success == true && data.body.result.isPinCreated == false){
                    menu.con('Welcome to Peoples Pensions Trust' + 
                    '\n1. Pay' +
                    '\n2. iCare (Pay for Someone)' +
                    '\n3. Check Balance' +
                    '\n4. Withdrawal' +
                    '\n5. Tier 2' +
                    '\n6. Trimester Save' +
                    '\n7. Contact us'
                    )
            }else if(data.body.success == true && data.body.result.isPinCreated == false){
                menu.con('Enter your 4 digit pin'); 
            }else{
                menu.end('Please you have not been registered.')
            }
        })
    },
    next: {
        '1': 'pay',
        '2': 'icare',
        '3': 'checkbalance',
        '4': 'withdrawal',
        '5': 'tier2',
        '6': 'trimestersave',
        '7': 'contactus',
        '*[0-9]+': 'pin'
    }
})

menu.state('mainmenu', {
    run: async() => {
        await fetchAccount(menu.args.phoneNumber, (data)=> {
            console.log(data);
            if (data.body.success == true && data.body.result.isPinCreated == true){
                    menu.con('Welcome to Peoples Pensions Trust' + 
                    '\n1. Pay' +
                    '\n2. iCare (Pay for Someone)' +
                    '\n3. Check Balance' +
                    '\n4. Withdrawal' +
                    '\n5. Tier 2' +
                    '\n6. Trimester Save' +
                    '\n7. Contact us'
                    )
            }else if(data.body.success == true && data.body.result.isPinCreated == false){
                menu.con('Enter your 4 digit pin'); 
            }else{
                menu.end('Please you have not been registered.')
            }
        })
    },
    next: {
        '1': 'pay',
        '2': 'icare',
        '3': 'checkbalance',
        '4': 'withdrawal',
        '5': 'tier2',
        '6': 'trimestersave',
        '7': 'contactus',
        '*[0-9]+': 'pin'
    }
})

menu.state('pin',{
    run: async () => {
        var pin = menu.val;
        menu.session.set('pin', pin);
        await createPin();
    }
})



///////////////--------------PAY ROUTE STARTS--------------////////////////
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

///////////////--------------ICARE ROUTE STARTS--------------////////////////

menu.state('icare', {
    run: () => {
        menu.con('Choose Preferred Option:' +
        '\n1. Register for Someone' +
        '\n2. Pay for Someone')
    },
    next: {
        '1': 'icare.register',
        '2': 'icare.phonenumber',
    }
})

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


///////////////--------------CHECK BALANCE ROUTE STARTS--------------////////////////

menu.state('checkbalance', {
    run: () => {
        menu.con('Please enter you 4 digit pin')
    },
    next: {
        '*\\d+': 'checkbalance.pin'
    }

})

menu.state('checkbalance.pin', {
    run: async() => {
        let pin = menu.val;
        menu.session.set('pin', pin);
        await checkbalance()
    }
})

///////////////--------------WITHDRAWAL ROUTE STARTS--------------////////////////

menu.state('withdrawal', {
    run: () => {
        menu.con('Your balance details: ' + '\n1. Retirement Balance - [Amount]' + '\n2. Savings Balance - [Amount]' + '\nHow much would like to withdraw from Savings Balance?')
    },
    next: {
        '*\\d+': 'withdrawal.amount'
    }
})

menu.state('withdrawal.amount', {
    run: () => {
        menu.end('Request submitted successfully. You will receive a receipt shortly')
    }
})

///////////////--------------TIER 2 ROUTE STARTS--------------////////////////

menu.state('tier2', {
    run: () => {
        menu.con('Enter Company Name')
    },
    next: {
        '*[a-zA-z]+': 'company.name'
    }
})

menu.state('company.name', {
    run: () => {
        let company = menu.val;
        menu.session.set('companyname', company)
        menu.con('How much would you like to pay?')
    },
    next: {
        '*\\d+': 'tier2.confirm'
    }
})

menu.state('tier2.confirm', {
    run: async() => {
        let tier2amount = menu.val;
        menu.session.set('tier2amount', tier2amount);
        var tier2AR = await menu.session.get('tier2amount');
        var companyname = await menu.session.get('companyname');
        menu.con('Please confirm the details below to continue payment:' +
        '\nCompany Name - ' + companyname +
        '\nAmount - GHS '+ tier2AR + 
        '\n\n0. Make Changes' +
        '\n1. Confirm')
    },
    next: {
        '0': 'tier2',
        '1': 'tier2.end'
    }
})

menu.state('tier2.end', {
    run: async() => {
        await tier2payment();
    }
})


///////////////--------------TRIMESTER ROUTE STARTS--------------////////////////
menu.state('trimestersave', {
    run: () => {
        menu.con('Choose Option' +
        '\n1. Pay')
    },
    next: {
        '1': 'trimester.pay'
    }
})

menu.state('trimester.pay', {
    run: () => {
        menu.con('Enter Customer\'s Mobile Number')
    },
    next: {
        '*\\d+': 'customernumber'
    }
})

menu.state('customernumber', {
    run: () => {
       //  Receive input from menu and verify from API
       var phonenumber = menu.val;
       if(phonenumber){
        menu.con('Dear (Customer Name), You are already registered. How much would you like to pay?')
       }else{
        menu.con('Dear (Customer Name), Your registration is successful. How much would you like to pay?')
       }
    },
    next: {
        '*\\d+': 'customernumber.pay'
    }
})
menu.state('customernumber', {
    run: () => {
       //  Receive input from menu and verify from API
       var phonenumber = menu.val;
       if(phonenumber){
        menu.con('Dear (Customer Name), You are already registered. How much would you like to pay?')
       }else{
        menu.con('Dear (Customer Name), Your registration is successful. How much would you like to pay?')
       }
    },
    next: {
        '*\\d+': 'customernumber.pay'
    }
})

menu.state('customernumber.pay', {
    run: () => {
        let amount = menu.val;
        menu.session.set('trimesteramount', amount)

        menu.con('Please select Preferred Scheme Number:' +
        '\n1. XXX' +
        '\n2. XXX'+
        '\n3. XXX'
        )
    },
    next: {
        '1': 'policy.customernumber.proceed',
        '2': 'policy.customernumber.proceed',
        '3': 'policy.customernumber.proceed',
    }
})

menu.state('policy.customernumber.proceed', {
    run: async() => {
        var amount = await menu.session.get('trimesteramount')
        menu.con(`Make sure you have enough wallet balance to proceed with transaction of GHS ${amount}` +
        '\n1. Proceed' +
        '\n0. Exit'
        )
    },
    next: {
        '0': 'policy.exit',
        '1': 'policy.customernumber.accepted',
    }
})

menu.state('policy.customernumber.accepted', {
    run: () => {
        menu.end('Request submitted successfully. You will receive a payment prompt shortly');
    }
})

/////////////////------------------CONTACT US STARTS------------------/////////////////////
menu.state('contactus', {
    run: () => {
        menu.con('1. Name' +
        '\n2. Email' +
        '\n3. Mobile' +
        '\n4. Website');
    },
    next: {
        '1': 'Contact.name',
        '2': 'Contact.email',
        '3': 'Contact.mobile',
        '4': 'Contact.website'
    }
})

menu.state('Contact.name', {
    run: () => {
        // Cancel Savings request
        menu.end('People Pension Trust.');
    }
});

menu.state('Contact.email', {
    run: () => {
        // Cancel Savings request
        menu.end('info@peoplespensiontrust.com.');
    }
});

menu.state('Contact.mobile', {
    run: () => {
        // Cancel Savings request
        menu.end('0302738242');
    }
});

menu.state('Contact.website', {
    run: () => {
        // Cancel Savings request
        menu.end('http://www.peoplespensiontrust.com');
    }
});

/////////////////------------------USSD SESSION STARTS------------------/////////////////////
module.exports.startUssd = (req, res) => {
menu.run(req.body, ussdResult => {
        res.send(ussdResult);
        // fetchAccount(req.body.phoneNumber);
    })
}


//////////////////-----FUNCTIONS BEGIN----------------/////////////////////
async function payment(){
    var scheme = await menu.session.get('schemenumber');

    var data = {
        appId: appId,
        appKey: appKey,
        schemeNumber: scheme.schemeNumber,
        amount: await menu.session.get('amount'),
        type: "CONTRIBUTION",
        payerMobile: menu.args.phoneNumber,
        payeeMobile: menu.args.phoneNumber,
        payerNetwork: "mtn",
        payeeNetwork: "mtn",
        name: await menu.session.get('name'),
        currency: "GHS",
        orderId: generator.generate(7),
        orderDesc: "CONTRIBUTION",
        transRefNo: "212121",
        channel: "USSD",
        menuItem: "Register"
    }

    var request = unirest('POST', `${apiUrl}/payment`)
    .headers({
        'Content-Type': ['application/json', 'application/json']
    })
    .send(JSON.stringify(data))
    .then((res) => {
        console.log(res.body);
        menu.end('Request submitted successfully. You will receive a payment prompt shortly');
    })

}

async function tier2payment(){
    var scheme = await menu.session.get('schemenumber');

    var data = {
        appId: appId,
        appKey: appKey,
        schemeNumber: scheme.schemeNumber,
        amount: await menu.session.get('tier2amount'),
        type: "CONTRIBUTION",
        payerMobile: menu.args.phoneNumber,
        payeeMobile: menu.args.phoneNumber,
        payerNetwork: "mtn",
        payeeNetwork: "mtn",
        name: await menu.session.get('companyname'),
        currency: "GHS",
        orderId: generator.generate(7),
        orderDesc: "CONTRIBUTION",
        transRefNo: "212121",
        channel: "USSD",
        menuItem: "Tier 2"
    }

    var request = unirest('POST', `${apiUrl}/payment`)
    .headers({
        'Content-Type': ['application/json', 'application/json']
    })
    .send(JSON.stringify(data))
    .then((res) => {
        console.log(res.body);
        menu.end('Request submitted successfully. You will receive a payment prompt shortly');
    })

}

async function trimesterpayment(){
    var scheme = await menu.session.get('schemenumber');

    var data = {
        appId: appId,
        appKey: appKey,
        schemeNumber: scheme.schemeNumber,
        amount: await menu.session.get('tier2amount'),
        type: "CONTRIBUTION",
        payerMobile: menu.args.phoneNumber,
        payeeMobile: menu.args.phoneNumber,
        payerNetwork: "mtn",
        payeeNetwork: "mtn",
        name: await menu.session.get('companyname'),
        currency: "GHS",
        orderId: generator.generate(7),
        orderDesc: "CONTRIBUTION",
        transRefNo: "212121",
        channel: "USSD",
        menuItem: "Tier 2"
    }

    var request = unirest('POST', `${apiUrl}/payment`)
    .headers({
        'Content-Type': ['application/json', 'application/json']
    })
    .send(JSON.stringify(data))
    .then((res) => {
        console.log(res.body);
        menu.end('Request submitted successfully. You will receive a payment prompt shortly');
    })

}

async function fetchAccount (val, callback){
    let data = {
        appId: appId,
        appKey: appKey,
        mobile: val
    }

    var request = unirest('POST', `${apiUrl}/memberInfo`)
        .headers({
            'Content-Type': ['application/json', 'application/json']
        })
        .send(JSON.stringify(data))
        .then(async (response) => {
            // console.log(response.body.result.memberName)
            if (response.body.success == true){
                menu.session.set('name', response.body.result.memberName);
                menu.session.set('schemes', response.body.result.schemes);
                menu.session.set('mobile', response.body.result.mobile);
                
            }
            await callback(response);
        })

        
}

async function register(){
    let args = {
        appId: appId,
        appKey: appKey,
        payerMobile: menu.args.phoneNumber,
        payeeMobile: await menu.session.get('icaremobile'),
        payerNetwork: "mtn",
        payeeNetwork: "mtn",
        name: await menu.session.get('icarename'),
        channel: "USSD",
        menuItem: "Register",
    }

    var request = unirest('POST', `${apiUrl}/Register`)
        .headers({
            'Content-Type': ['application/json', 'application/json']
        })
        .send(JSON.stringify(args))
        .then((response) => {
            console.log(response.body);
            // menu.session.set('icarename', response.body.result.memberName);
            // menu.session.set('schemenumber', response.body.result.schemes[0].schemeNumber);  
            // menu.session.set('schemetype', response.body.result.schemes[0].schemeType);
            // menu.session.set('icaremobile', response.body.result.mobile);

            menu.con(`Dear ${args.name}, you have successfully register for the Peoples Pension Trust` + 
            '\nWould you like to continue with payment?' +
            '\n0. Exit' +
            '\n1. Pay')
    
          })
};


async function checkbalance(){
    fetchAccount(menu.args.phoneNumber);
    var scheme = await menu.session.get('schemenumber');

    let args = {
        appId: appId,
        appKey: appKey,
        schemeNumber: scheme.schemeNumber,
        pin: await menu.session.get('pin')
    }
    console.log(args)

    var request = unirest('POST', `${apiUrl}/checkbalance`)
        .headers({
            'Content-Type': ['application/json', 'application/json']
        })
        .send(JSON.stringify(args))
        .then((response) => {
            console.log(response);
            menu.end('Your balance details: ' + `\n1. Retirement Balance - [Amount]` + `\n2. Savings Balance - [Amount]`)
    
          })

}

async function createPin(){
    let args = {
        appId: appId,
        appKey: appKey,
        mobile: menu.args.phoneNumber,
        pin: await menu.session.get('pin'),
    }

    var request = unirest('POST', `${apiUrl}/createPin`)
        .headers({
            'Content-Type': ['application/json', 'application/json']
        })
        .send(JSON.stringify(args))
        .then((response) => {
            console.log(response);
            if(response.body.success == false){
                menu.end(`${response.body.error.message}`);
            }else{
                menu.end('Your Pin has been created successfully')
        }
        })
}

