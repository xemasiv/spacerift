const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const compression = require('compression')
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const cors = require('cors');
const app = express();
app.use(cors({
    origin: true,
    methods:['GET','POST'],
    credentials: true
}));
app.use(compression());
app.use(expressSession({
  secret: 'Bjq3DojKaYvj',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', express.static('./dist'));
app.use('/static', express.static('./test/static'));

const Spacerift = require('../index.js')({
  debug: true
});

const QuickLink = require('./custom-plugins/QuickLink.js');
const SignedNonce = require('./custom-plugins/SignedNonce.js');

Spacerift.PLUGINS.push( Spacerift.Fingerprint({ debug: true }) );
Spacerift.PLUGINS.push( Spacerift.RequestBody({ debug: true }) );
Spacerift.PLUGINS.push( Spacerift.RequestSession({ debug: true }) );
/*
Spacerift.PLUGINS.push( QuickLink({ debug: true }) );
*/
// Spacerift.PLUGINS.push( SignedNonce({ debug: true }) );

app.get('/', (req, res) => {
  res.sendFile(__dirname.concat('/index.html'));
});
app.post('/', Spacerift.HTTP);


http.createServer(app).listen(80);
console.log("NOTE: Run this with 'npm test' to work properly.");
console.log('Now listening at port 80.');
