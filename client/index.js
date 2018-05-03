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
    let EE = new EventEmitter3();
    this.on = EE.on.bind(EE);
    this.once = EE.once.bind(EE);
    this.emit = EE.emit.bind(EE);

    this.host = (
      typeof options === 'object' &&
      Boolean(options.host) === true
    ) ? options.host : window.location.href;

    this.peers = Immutable.List();
  }
  createPeer (options) {
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
};
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
