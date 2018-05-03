const DEBUG = require('debug');
const onFinished = require('on-finished');
const circular = require('circular-json');
const sha3_256 = require('js-sha3').sha3_256;
const Immutable = require('immutable');

const debug = DEBUG('Spacerift');
debug.enabled = true;
debug.useColors = true;

const useragent = require('useragent');
const geoip = require('geoip-lite');

const clients = new Map();

/*
const check = () => {
  debug('CHECK', clients.size, clients.size % 2 === 0);
  if (
    clients.size > 0 && // if we have any clients
    clients.size % 2 === 0 // and we got pairs for each
  ) {
    let pair = [];
    debug('LOOKUP');
    clients.forEach((value, key) => {
      debug('ACROSS', key);
      pair.push({key, value});
      clients.delete(key);
      debug('@', pair.length);
      if (pair.length === 2) {
        debug('MATCH');
      }
    });
  };
};
*/

const postHandler = (req, res) => {
  const agent = useragent.lookup(req.headers['user-agent']).toJSON();
  const geo = geoip.lookup(req.ip);
  const headers = {
    host: req.headers['host'],
    accept: req.headers['accept'],
    language: req.headers['accept-language']
  };
  let fingerprint = sha3_256(
    circular.stringify({ agent, geo, headers })
  );

  let clientState;
  if (clients.has(fingerprint) === true) {
    clientState = clients.get(fingerprint);
    clientState = clientState.set('connection', 'online');
    clientState = clientState.set('request', req);
    clients.set(fingerprint, clientState);
  } else {
    clientState = Immutable.Map({
      fingerprint: fingerprint,
      request: req,
      connection: 'online'
    });
    clients.set(fingerprint, clientState);
  };
  debug('ONLINE', fingerprint);
  debug('clientState', clientState.toString());
  debug('CLIENTS SIZE', clients.size);

  debug(req.body);
  onFinished(req, (...args) => {
    let clientState = clients.get(fingerprint);
    clientState = clientState.set('connection', 'offline');
    clients.set(fingerprint, clientState);
    debug('OFFLINE', fingerprint);
    debug('clientState', clientState.toString());
    debug('CLIENTS SIZE', clients.size);
  });
};

const Spacerift = {
  postHandler
};

module.exports = Spacerift;
