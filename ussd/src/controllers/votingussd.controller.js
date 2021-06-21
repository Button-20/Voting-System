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


///////////////--------------MENU STARTS--------------////////////////

menu.startState({
    run: async() => {
        await fetchaccount(menu.args.phoneNumber, (data)=> {
            // if(data.body[0].hpin == 'false'){
            //     menu.con('Welcome to Ahantaman Rural Bank. Please create a PIN before continuing' + '\n\nEnter 4 digits.')
            // }else{
                menu.con(`Welcome to [Name],
                1. Vote
                `)        
            // }
        });
    },
    next: {
        '*\\d+': 'vote'
    }
})


///////////////--------------DEPOSIT STARTS--------------////////////////

menu.state('vote',{
    run: () => {
        menu.con(`Choose Category:
        1. [Category Name]
        2. [Category Name]
        3. [Category Name]
        4. [Category Name]
        5. [Category Name]
        `)
    },
    next: {
        '*\\d+': 'vote.category',
    }
})

menu.state('vote.category',{
    run: () => {
        menu.con(`Choose your contestant:
        1. [Contestant Name]
        2. [Contestant Name]
        3. [Contestant Name]
        4. [Contestant Name]
        5. [Contestant Name]
        `)
    },
    next: {
        '*\\d+': 'vote.contestant',
    }
})

menu.state('vote.contestant',{
    run: () => {
        menu.con(`Enter your preferred number of votes`)
    },
    next: {
        '*\\d+': 'vote.number',
    }
})

menu.state('vote.number',{
    run: () => {
        menu.con(`You are voting `)
    },
    next: {
        '*\\d+': 'vote.confirm',
    }
})

menu.state('vote.confirm',{
    run: () => {
        menu.end(`Follow`)
    },
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
