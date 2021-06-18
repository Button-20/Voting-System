const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 4000; 

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));

require('./src/routes/ussd.route')(app);


app.listen(PORT, () => {
    console.log('Successfully connected to port ' + PORT)
})
