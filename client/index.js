const Peer = require('simple-peer');
const DEBUG = require('debug');
const debug = DEBUG('Spacerift:debug');
const info = DEBUG('Spacerift:info');
info.enabled = true;
debug.enabled = ENV.debug;
class Client{
  constructor (o) {
    const { host } = o || {};
    this.host = Boolean(host) ? host : window.location.href;
    this.peer = new Peer({ initiator: true });
  }
}
window.SpaceriftClient = Client;
info('OK!');
