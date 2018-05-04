const Peer          = require('simple-peer');
const EventEmitter3 = require('eventemitter3');
const Immutable     = require('immutable');
const Redux         = require('redux');
const debug     = require('debug')('Spacerift');
let REDUCERS = [];
const STORE = Redux.createStore((state = Immutable.Map({}), action) => {
  debug('ACTION', action.type);
  REDUCERS.map((reducer, index) => {
    debug('REDUCER', index + 1, 'of', REDUCERS.length);
    state = reducer(state, action);
    debug('STATE UPDATED');
    debug(state.toString());
  });
  return state;
});
class HTTPClient {
  constructor (options) {
    debug('HTTPClient.constructor()', options);
    let EE = new EventEmitter3();
    this.on = EE.on.bind(EE);
    this.once = EE.once.bind(EE);
    this.emit = EE.emit.bind(EE);
    let host;
    if (typeof options === 'object' && Boolean(options.host) === true ) {
      host = options.host;
    } else {
      if (typeof window !== 'undefined') {
        host = window.location.href;
      }
    }
    this.host = host;
    this.peers = Immutable.List();
  }
  createPeer (options) {
    debug('HTTPClient.createPeer()', options);
    let client = this;
    let peer = new Peer(options);
    client.peers = client.peers.push(peer);
    /*
      let signalContext = uuid();
        client.once(signalContext, (signal) => {
          signal = btoa(JSON.stringify(signal));
          debug('signal received');
          debug(signal);
          fetch(client.host, {
              method: 'POST',
              body: {
                type: 'CONNECT',
                signal
              }
            })
            .then(debug)
            .catch(debug);
        });
      peer.on('signal', (signal) => {
        // client.emit(signalContext, signal);
        client.emit('signal', peer, signal);
      });
    */
    return peer;
  }
  request (body) {
    debug('HTTPClient.request()', body);
    let client = this;
    if (Boolean(client.host) === false) {
      debug('ERROR', 'Client.host not found');
      return;
    }
    return fetch(client.host, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }
};
if (typeof window !== 'undefined') {
  window.Immutable = Immutable;
  window.Redux = Redux;
  window.Peer = Peer;
  window.Spacerift = {
    HTTPClient,
    STORE,
    REDUCERS,
    enableDebug: () => {
      debug.enabled = true;
    }
  };
} else if (typeof module !== 'undefined') {
  module.exports = Spacerift = {
    HTTPClient,
    STORE,
    REDUCERS,
    enableDebug: () => {
      debug.enabled = true;
    }
  };
}
