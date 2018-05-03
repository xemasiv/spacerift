const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const compression = require('compression')
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const cors = require('cors');
const DEBUG = require('debug');
const onFinished = require('on-finished');
const circular = require('circular-json');
const sha3_256 = require('js-sha3').sha3_256;

const debug = DEBUG('Spacerift');
debug.enabled = true;
debug.useColors = true;

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
app.use(bodyParser.urlencoded({
  extended: true
}));

const useragent = require('useragent');
const geoip = require('geoip-lite');
const ACTIONS = require('./shared/Enums.js');

const fresh = new Map();
const awaiting = new Map();

const check = () => {
  debug('running check');
  debug('fresh.size', fresh.size);
  debug('got equal pairs', fresh.size % 2 === 0);
  if (
    fresh.size > 0 && // if we have any freshies
    fresh.size % 2 === 0 // and we got pairs for each
  ) {
    let pair = [];
    debug('pair lookup');
    fresh.forEach((value, key) => {
      debug('across', key);
      pair.push({key, value});
      fresh.delete(key);
      debug('pair now', pair.length);
      if (pair.length === 2) {
        debug('pair matched!');
      }
    });
  };
};
app.use(express.static('dist'))
app.post('/', (req, res) => {
  const agent = useragent.lookup(req.headers['user-agent']).toJSON();
  const geo = geoip.lookup(req.ip);
  const headers = {
    host: req.headers['host'],
    accept: req.headers['accept'],
    language: req.headers['accept-language']
  };
  let signature = sha3_256(circular.stringify({ agent, geo, headers }));
  debug('START', fresh.size, awaiting.size, signature);
  debug(req.body);
  switch (req.body.type) {
    case ACTIONS.CONNECT:
      if (awaiting.has(signature) === false) {
        if (fresh.has(signature) === false) {
          fresh.set(signature, req);
          check();
        }
      }
      break;
    default:

      break;
  }
  onFinished(req, (...args) => {
    if (fresh.has(signature) === true) {
      fresh.delete(signature);
    }
    debug('END', fresh.size, awaiting.size, signature);
  });
});

/*
const forceSSL = require('express-force-ssl');
const SSL = {
  credentials: {
    key: fs.readFileSync('ssl/private.key', 'utf8'),
    cert: fs.readFileSync('ssl/api_realtycoast_io.crt', 'utf8'),
    ca: [
      fs.readFileSync('ssl/COMODORSADomainValidationSecureServerCA.crt', 'utf8')
    ]
  }
};
app.use(forceSSL);
app.use('/.well-known/acme-challenge', express.static('ssl'));
app.use('/.well-known/pki-validation', express.static('ssl'));
*/

const oneDay = 86400000 * 7;
app.use(
  '/static',
  express.static('bundles', {
    maxage: oneDay
  })
);

app.use((err, req, res, next) => {
  if (err) {
    console.log('err:', err);
    console.log('err.stack:', err.stack);
    res.status(500).send(`(Internal Server Error) `.concat(err.origin));
  } else {
    next();
  }
});



http.createServer(app).listen(80);
// https.createServer(SSL.credentials, app).listen(443);
console.log('Now listening at port 80.')
