const Peer          = require('simple-peer');
const EventEmitter3 = require('eventemitter3');
const Immutable     = require('immutable');
const DEBUG         = require('debug');
const uuid          = require('uuid-random');

const debug     = DEBUG('Spacerift:debug');
const info      = DEBUG('Spacerift:info');
info.enabled    = true;
debug.enabled   = ENV.debug;

let STATE = Immutable.Map({});

class Client {
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
window.Spacerift = {
  STATE,
  Client
};
if (ENV.debug) {
  window.x = new Client();
}
info('OK!');
