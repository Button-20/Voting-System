const UssdMenu = require('ussd-menu-builder');
const unirest = require('unirest');
const generator = require('generate-serial-number')
let menu = new UssdMenu();
let sessions = {};
// const appKey = '180547238'; const appId = '75318691';
// const apiUrl = "http://api.alias-solutions.net:8443/DemoApi/api/lmc";
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

///////////////--------------MENU STARTS--------------////////////////

menu.startState({
    run: async() => {
        await fetchaccount(menu.args.phoneNumber, (data)=> {
            if(data.body.status_message){
                menu.con('Welcome to Kumasi Ashanti Kotoko SC\n\n Dear (Supporter) confirm name to register' +
                '\n\nEnter your First Name')
            }else{
                menu.con('Welcome to Kumasi Ashanti Kotoko SC' + 
                '\n1. Payment' +
                '\n2. Buy A Ticket' +
                '\n3. Tell A Supporter')
            }
        });
    },
    next: {
        '1': 'payment',
        '2': 'ticket',
        '3': 'supporter',
        '*[a-zA-Z]+': 'lastname',
    }
})

// menu.state('confirm',{
//     run: async() => {
//         await fetchaccount(menu.args.phoneNumber, (data)=> {
//             if (data.body.status_message)
//                 menu.con('Registration Successfully Completed. \n\n Press 0 to continue')
//             else
//             menu.con('Something went wrong. Server Error')
//         })
//     },
//     next: {
//         '0': 'mainmenu',
//     }
// })

menu.state('lastname',{
    run: async() => {
        let firstname = menu.val;
        await menu.session.set('firstname', firstname);
        menu.con('Enter Last name')
    },
    next: {
        '*[a-zA-Z]+': 'confirmname',
    }
})

menu.state('confirmname',{
    run: async() => {
        let lastname = menu.val;
        await menu.session.set('lastname', lastname);

        let Firstname = await menu.session.get('firstname');
        let Lastname = await menu.session.get('lastname');
        menu.con(`Confirm The Details Provided:
        \n1. First Name - ${Firstname}
        \n2. Last Name - ${Lastname}
        
        \n\nPress 0 to continue`)
    },
    next: {
        '0': 'continue',
    }
})

menu.state('continue',{
    run: async() => {
        await createCustomer(menu.args.phoneNumber, (data)=> {
            if (data.body.customerid)
                menu.con('Registration Successfully Completed. \n\n Press 0 to continue')
            else
            menu.con('Something went wrong. Server Error')
        })
    },
    next: {
        '0': 'mainmenu',
    }
})

///////////////--------------MAIN MENU STARTS--------------////////////////

menu.state('mainmenu', {
    run: async() => {
        await fetchaccount(menu.args.phoneNumber, (data)=> {
            if(data.body.status_message){
                menu.con('Welcome to Kumasi Ashanti Kotoko SC\n\n Dear (Supporter) confirm name to register' +
                '\n\nEnter your First Name')
            }else{
                menu.con('Welcome to Kumasi Ashanti Kotoko SC' + 
                '\n1. Payment' +
                '\n2. Buy A Ticket' +
                '\n3. Tell A Supporter')
            }
        });
    },
    next: {
        '1': 'payment',
        '2': 'ticket',
        '3': 'supporter',
        '*[a-zA-Z]+': 'lastname',
    }
})

///////////////--------------PAYMENT STARTS--------------////////////////
menu.state('payment',{
    run: () => {
        menu.con('Welcome to Kumasi Ashanti Kotoko SC' +
        '\n1. Dues' +
        '\n2. Welfare' +
        '\n3. Donation' +
        '\n4. Pension')
    },
    next: {
        '1': 'dues',
        '2': 'welfare',
        '3': 'donation',
        '4': 'pension'
    }
})

///////////////--------------PAYMENT > DUES STARTS--------------////////////////
    
menu.state('dues',{
    run: () => {
        menu.con('Please make a choice:' + 
        '\n1. Default Fixed Amount' +
        '\n2. Custom Amount'
        )
    },
    next: {
        '1': 'default',
        '2': 'custom',
    }
})

menu.state('default',{
    run: () => {
        menu.con('Please you are about to make a Dues payment of GHC 00' +
        '\n\nPlease 1 to confirm payment'      
        )
    },
    next: {
        '1': 'default.confirm'
    }
})


menu.state('default.confirm',{
    run: async() => {
        let data = {
            code: "303",
            type: "Dues",
            amount: await menu.session.get('amount'),
            mobile: menu.args.phoneNumber,
            network: "string",
            token: "string",
            service: "string",
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

menu.state('custom',{
    run: () => {
        menu.con('Please enter your desired amount')
    },
    next: {
        '*\\d+': 'default'
    }
})

///////////////--------------PAYMENT > WELFARE  STARTS--------------////////////////

menu.state('welfare',{
    run: () => {
        menu.con('Please make a choice:' + 
        '\n1. Default Fixed Amount' +
        '\n2. Custom Amount'
        )
    },
    next: {
        '1': 'default',
        '2': 'custom',
    }
})

menu.state('default.welfare',{
    run: () => {
        menu.con('Please you are about to make a Welfare payment of GHC 00' +
        '\n\nPlease 1 to confirm payment'      
        )
    },
    next: {
        '1': 'default.confirm'
    }
})

menu.state('default.confirm',{
    run: async() => {
        let data = {
            code: "303",
            type: "Dues",
            amount: await menu.session.get('amount'),
            mobile: menu.args.phoneNumber,
            network: "string",
            token: "string",
            service: "string",
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

menu.state('custom',{
    run: () => {
        menu.con('Please enter your desired amount')
    },
    next: {
        '*\\d+': 'default.welfare'
    }
})


///////////////--------------PAYMENT > DONATION STARTS--------------////////////////

menu.state('donation',{
    run: () => {
        menu.con('Please enter amount to donate')
    },
    next: {
        '*[0-9]+': 'donation.amount'
    }
})

menu.state('donation.amount',{
    run: () => {
        menu.con('Please you are about to make a Donation of GHC 00 to Kumasi Asante Kotoko.' +
        '\n1. Confirm'
        )
    },
    next: {
        '1': 'donation.confirm'
    }
})

menu.state('donation.confirm',{
    run: () => {
        menu.end('You will receive a prompt to complete the payment process.')
    }
})


///////////////--------------PAYMENT > PENSION STARTS--------------////////////////
menu.state('pension', {
    run: () => {
        menu.con('How much would you like to pay?')
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
        '\n5. Stop Repeat Payments' +
        '\n0. Back' 
        )
    },
    next: {
        '1': 'policy',
        '2': 'policy',
        '3': 'policy',
        '4': 'policy',
        '5': 'srp',
        '0': 'pension'
    }
})

menu.state('policy', {
    run: async() => {
        let amount = await menu.session.get('amount');
        menu.con(`You about to make a contribution for GHC ${amount} to Peoples Pension Trust ` +
        '\n1. Proceed' +
        '\n0. Back'
        )
    },
    next: {
        '0': 'policy',
        '1': 'policy.accepted',
    }
})

menu.state('policy.accepted', {
    run: async() => {
        let data = {
            code: "303",
            type: "Pension",
            amount: await menu.session.get('amount'),
            mobile: menu.args.phoneNumber,
            network: "string",
            token: "string",
            service: "string",
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



menu.state('srp', {
    run: () => {
        menu.end('You have successfully cancelled your Repeat Payments')
    }
})


///////////////--------------BUY A TICKET STARTS--------------////////////////

menu.state('ticket', {
    run: () => {
        menu.con(`\n1. VVIP
        \n2. UPPER VIP
        \n3. LOWER VIP
        \n4. CENTRE LINE
        \n5. POPULAR STAND`)
    },
    next: {
        '*[0-9]+': 'ticket.quantity'
    }
})

menu.state('ticket.quantity', {
    run: () => {
        menu.con('Please enter quantity')
    },
    next: {
        '*[0-9]+': 'ticket.confirm'
    }
})

menu.state('ticket.confirm', {
    run: () => {
        menu.con('Please you about to make a ticket payment of GHS 00 to Kumasi Asante Kotoko SC' +
        '\n\nPlease Press:' +
        '\n1. Confirm'
        )
    },
    next: {
        '*\\d+': 'ticket.proceed'
    }
})


menu.state('ticket.proceed', {
    run: async() => {
        run: async() => {
            let data = {
                code: "303",
                type: "Ticket",
                amount: await menu.session.get('amount'),
                mobile: menu.args.phoneNumber,
                network: "string",
                token: "string",
                service: "string",
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
    
    }
})

///////////////--------------TELL A SUPPORTER STARTS--------------////////////////
menu.state('supporter', {
    run: () => {
        menu.con('Please enter a friend’s mobile number')
    },
    next: {
        '*[0-9]+': 'supporter.confirm'
    }
})

menu.state('supporter.confirm', {
    run: () => {
        menu.end('Please dial short code to register as a supporter of Kumasi Asante Kotoko')
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
        code: '303',
        key: '303',
        mobile: val
    }

    // console.log(data);

    var request = unirest('GET', `${apiUrl}/PayNow/Customer`)
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

async function createCustomer (val, callback) {
    let data = {
        code: "303",
        key: "303",
        name: await menu.session.get('firstname') + ' ' + await menu.session.get('lastname'),
        mobile: val,
        email: "",
        other: "",
        source: "USSD"
    }

    // console.log(data);

    var request = unirest('POST', `${apiUrl}/PayNow/Customer`)
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



