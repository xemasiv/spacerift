const DEBUG         = require('debug');
const Peer          = require('simple-peer');
const uuid          = require('uuid-random');
const EventEmitter3 = require('eventemitter3');
const ACTIONS       = require('../shared/Enums.js');
const debug     = DEBUG('Spacerift:debug');
const info      = DEBUG('Spacerift:info');
info.enabled    = true;
debug.enabled   = ENV.debug;
class Client{
  constructor (o) {
    this.host = ( typeof o === 'object' && Boolean(o.host) === true ) ? o.host : window.location.href;
    this.peers = [];
    let EventEmitter = new EventEmitter3();
    this.on = EventEmitter.on.bind(EventEmitter);
    this.once = EventEmitter.once.bind(EventEmitter);
    this.emit = EventEmitter.emit.bind(EventEmitter);
  }
  discover () {
    let client = this;
    debug('host:', client.host);
    let peer = new Peer({ initiator: true });
    let signalContext = uuid();
    client.once(signalContext, (signal) => {
      signal = btoa(JSON.stringify(signal));
      debug('signal received');
      debug(signal);
      fetch(client.host, {
          method: 'POST',
          body: {
            type: ACTIONS.CONNECT,
            signal
          }
        })
        .then(debug)
        .then(debug)
        .catch(debug);
    });
    debug('awaiting signal..');
    peer.on('signal', (signal) => {
      client.emit(signalContext, signal)
      client.emit('signal', signal);
    });
    client.peers.push(peer);
  }
}
window.SpaceriftClient = Client;
if (ENV.debug) {
  window.x = new Client();
}
info('OK!');
debug('actions:', ACTIONS);
