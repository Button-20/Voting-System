const UssdMenu = require('ussd-menu-builder');
const unirest = require('unirest');
let menu = new UssdMenu();
let sessions = {};
const appKey = '062262554'; const appId = '052683438';
const apiUrl = "https://api.alias-solutions.net:8446/api/services/app/Channels";

menu.sessionConfig({
    start: (sessionId, callback) => {
        // initialize current session if it doesn't exist
        // this is called by menu.run()
        if(!(sessionId in sessions)) sessions[sessionId] = {};
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
    run: () => {
        
        fetchAccount(menu.args.phoneNumber)
    },
    next: {
        '1': 'register',
        '2': 'contactus'
    }
})

menu.state('mainmenu', {
    run: () => {
        menu.con('Welcome to Peoples Pensions Trust' + 
        '\n1. Register' +
        '\n2. Contact us'
        )
    },
    next: {
        '1': 'register',
        '2': 'contactus'
    }
})

///////////////--------------REGISTER ROUTE STARTS--------------////////////////
menu.state('register', {
    run: () => {
        menu.con('Please enter your first name')
    },
    next: {
        '*[a-zA-Z]+': 'register.firstname'
    }
})

menu.state('register.firstname', {
    run: () => {
        let firstname = menu.val;
        menu.session.set('firstname', firstname);
        menu.con('Please enter your last name')
    },
    next: {
        '*[a-zA-Z]+': 'register.lastname'
    }
})

menu.state('register.lastname', {
    run: async() => {
        let lastname = menu.val;
        menu.session.set('lastname', lastname);  
        
        let name = await menu.session.get('firstname') + ' ' + await menu.session.get('lastname');
        menu.session.set('name', name);  

        await register();  
    },
    next: {
        '0': 'exit',
        '1': 'register.pay',
    }
})

menu.state('exit', {
    run: () => {
        menu.end('')
    }
})



///////////////--------------PAY ROUTE STARTS--------------////////////////
menu.state('register.pay', {
    run: async() => {
        var name = await menu.session.get('name');
        menu.con(`Dear ${name}, How much would you like to pay?`)
    },
    next: {
        '*\\d+': 'pay.amount'
    }
})

menu.state('pay.amount', {
    run: () => {
        let amount = menu.val;
        menu.session.set('Amount', amount);
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
        menu.con('Please select Preferred Scheme Number:' +
        '\n1. XXX' +
        '\n2. XXX'+
        '\n3. XXX'
        )
    },
    next: {
        '1': 'policy.proceed',
        '2': 'policy.proceed',
        '3': 'policy.proceed',
    }
})

menu.state('policy.proceed', {
    run: async() => {
        let amount = await menu.session.get('Amount');
        menu.con(`Make sure you have enough wallet balance to proceed with transaction of GHS ${amount}` +
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
        payment();
    }
})

menu.state('srp', {
    run: () => {
        menu.end('You have successfully cancelled your Repeat Payments')
    }
})


/////////////////------------------USSD SESSION STARTS------------------/////////////////////
module.exports.startUssd = async(req, res) => {
    let args = req.body;
    if (args.Type == 'initiation') {
        args.Type = req.body.Type.replace(/\b[a-z]/g, (x) => x.toUpperCase());
    }
    menu.run(args, ussdResult => {
        menu.session.set('network', args.networkCode);
        res.send(ussdResult);
        // console.log(args);
    });
}

////////////////--------------------FUNCTIONS BEGIN---------------------////////////////////
// module.exports.register = (req) => {
//     var data = {
//         appId: "052683438",
//         appKey: "062262554",
//         payerMobile: req.body.phoneNumber,
//         payeeMobile: req.body.phoneNumber,
//         payerNetwork: "string",
//         payeeNetwork: "string",
//         name: "string",
//         channel: "USSD",
//         menuItem: "Register",
//         id: 0
//     }


// }

function fetchAccount (val){
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
        .then((response) => {
            console.log(response.body)
            if (response.body.success == true){
                menu.end('Please you have already been registered')
            }else{
                menu.con('Welcome to Peoples Pensions Trust' + 
                '\n1. Register' +
                '\n2. Contact us'
                )        
            }
        })
}


function register(){
    let args = {
        appId: appId,
        appKey: appKey,
        payerMobile: menu.args.phoneNumber,
        payeeMobile: menu.args.phoneNumber,
        payerNetwork: "mtn",
        payeeNetwork: "mtn",
        name: menu.session.get('name'),
        channel: "USSD",
        menuItem: "Register",
    }

    var request = unirest('POST', `${apiUrl}/Register`)
        .headers({
            'Content-Type': ['application/json', 'application/json']
        })
        .send(JSON.stringify(args))
        .then((response) => {
            // console.log(response.body.error.message);
            menu.con('Dear '+ args.name + ', you have successfully register for the Peoples Pension Trust' + 
        '\nWould you like to continue with payment?' +
        '\n0. Exit' +
        '\n1. Pay')
          })
};

async function payment(){
    var data = {
        appId: appId,
        appKey: appKey,
        schemeNumber: "8810TUS000024",
        amount: await menu.session.get('Amount'),
        type: "CONTRIBUTION",
        payerMobile: menu.args.phoneNumber,
        payeeMobile: menu.args.phoneNumber,
        payerNetwork: "mtn",
        payeeNetwork: "mtn",
        name: await menu.session.get('name'),
        currency: "GHS",
        orderId: "1212122",
        orderDesc: "CONTRIBUTION",
        transRefNo: "212121",
        channel: "USSD",
        menuItem: "Register"
    }

    var request = unirest('POST', 'https://api.alias-solutions.net:8446/api/services/app/Channels/payment')
    .headers({
        'Content-Type': ['application/json', 'application/json']
    })
    .send(JSON.stringify(data))
    .then((res) => {
        console.log(res.body.error.message);
        menu.end('Request submitted successfully. You will receive a payment prompt shortly');
    })

}
