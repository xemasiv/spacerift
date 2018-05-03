const DEBUG = require('debug');
const onFinished = require('on-finished');
const circular = require('circular-json');
const sha3_256 = require('js-sha3').sha3_256;
const Immutable = require('immutable');
const Redux = require('redux');

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

const PLUGINS = [];

const pluginFingerprint = () => ({
  label: 'FINGERPRINT',
  onConnect: (state, action) => {
    const { req, res } = action;

    const agent = useragent.lookup(req.headers['user-agent']).toJSON();
    const geo = geoip.lookup(req.ip);
    const headers = {
      host: req.headers['host'],
      accept: req.headers['accept'],
      language: req.headers['accept-language']
    };
    let fingerprint = sha3_256(circular.stringify({ agent, geo, headers }));

    if (state.has('fingerprints') === false) {
      state = state.set('fingerprints', Immutable.List());
    };
    if (state.has('requests') === false) {
      state = state.set('requests', Immutable.Map({}));
    };
    if (state.has('responses') === false) {
      state = state.set('responses', Immutable.Map({}));
    };

    let fingerprints = state.get('fingerprints');
    let requests = state.get('requests');
    let responses = state.get('responses');

    if (fingerprints.includes(fingerprint) === false) {
      fingerprints = fingerprints.push(fingerprint);
      state = state.set('fingerprints', fingerprints);
    };
    if (requests.has(fingerprint) === false) {
      requests = requests.set(fingerprint, req);
      state = state.set('requests', requests);
    };
    if (responses.has(fingerprint) === false) {
      responses = responses.set(fingerprint, res);
      state = state.set('responses', responses);
    };

    return state;
  },
  onDisconnect: (state, action) => {
    const { req, res } = action;

    const agent = useragent.lookup(req.headers['user-agent']).toJSON();
    const geo = geoip.lookup(req.ip);
    const headers = {
      host: req.headers['host'],
      accept: req.headers['accept'],
      language: req.headers['accept-language']
    };
    let fingerprint = sha3_256(circular.stringify({ agent, geo, headers }));

    let fingerprints = state.get('fingerprints');
    let requests = state.get('requests');
    let responses = state.get('responses');

    if (fingerprints.includes(fingerprint) === true) {
      fingerprints = fingerprints.delete(fingerprints.indexOf(fingerprint));
      state = state.set('fingerprints', fingerprints);
    };
    if (requests.has(fingerprint) === true) {
      requests = requests.delete(fingerprint);
      state = state.set('requests', requests);
    };
    if (responses.has(fingerprint) === true) {
      responses = responses.delete(fingerprint);
      state = state.set('responses', responses);
    };

    return state;
  }
});
PLUGINS.push(pluginFingerprint());

const STORE = Redux.createStore((state = Immutable.Map({}), action) => {
  debug('ACTION', action.type);
  switch (action.type) {
    case 'connect':
      PLUGINS.map((plugin, index) => {
        debug(plugin.label, 'plugin', index + 1, 'of', PLUGINS.length);
        state = plugin.onConnect(state, action);
        debug('STATE UPDATED');
        debug(state.toObject());
      });
      return state;
      break;
    case 'disconnect':
      PLUGINS.map((plugin, index) => {
        debug(plugin.label, 'plugin', index + 1, 'of', PLUGINS.length);
        state = plugin.onDisconnect(state, action);
        debug('STATE UPDATED');
        debug(state.toObject());
      });
      return state;
      break;
    default:
      return state;
      break;
  }
});

const postHandler = (req, res) => {
  /*
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

  debug(req.body);*/

  STORE.dispatch({ type: 'connect', req, res });
  onFinished(req, (...args) => {
    /*
    let clientState = clients.get(fingerprint);
    clientState = clientState.set('connection', 'offline');
    clients.set(fingerprint, clientState);
    debug('OFFLINE', fingerprint);
    debug('clientState', clientState.toString());
    debug('CLIENTS SIZE', clients.size);
    */
    STORE.dispatch({ type: 'disconnect', req, res });
  });
};

const Spacerift = {
  postHandler
};

module.exports = Spacerift;
