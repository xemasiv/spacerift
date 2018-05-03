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
app.use(express.static('../dist'));


const Spacerift = require('../index.js')({
  debug: true
});
const Fingerprint = require('../plugins/Fingerprint.js');
Spacerift.PLUGINS.push(
  Fingerprint({
    debug: true
  })
);
app.post('/', Spacerift.HTTP);


http.createServer(app).listen(80);
console.log('Now listening at port 80.')
