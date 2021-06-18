const UssdMenu = require('ussd-menu-builder');
const unirest = require('unirest');
const generator = require('generate-serial-number')
let menu = new UssdMenu();
let sessions = {};
const appKey = '180547238'; const appId = '75318691';
const apiUrl = "https://api.paynowafrica.com";


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
                menu.con(`Welcome to GPRTU Collections, Dear ${name} your total contribution for this month is GHC ${amount}, 
                Enter the amount you wish to pay today`)        
            // }
        });
    },
    next: {
        '^[0-9]*$': 'payment'
    }
})


///////////////--------------DEPOSIT STARTS--------------////////////////

menu.state('deposit.amount',{
    run: () => {
        let amount = menu.val;
        menu.session.set('amount', amount);

        let agent = await menu.session.get('agentaccountinfo');
        let member = await menu.session.get('memberaccountinfo');
        menu.con(`Dear ${agent}, you are making a deposit of GHS  ${amount}  into ${member}'s account` +
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
        let data = {
            code: "303",
            type: "Contribution",
            amount: await menu.session.get('amount'),
            mobile: menu.args.phoneNumber,
            network: "string",
            token: "string",
            service: "GPRTU USSD",
            reference: "string",
            order_id: generator.generate(7)
        }
    
        await payment(data, (data) => {
            if(data.body.status_message == 'success')
                menu.end('You will receive a prompt to complete the payment process.')
            else
                menu.end('Server Error............')
        })
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

async function payment (data, callback) {

    var request = unirest('POST', `${apiUrl}/PayNow/Merchant`)
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
