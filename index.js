const onFinished = require('on-finished');
const Immutable = require('immutable');
const Redux = require('redux');

const debug = require('debug')('Spacerift');

const Fingerprint = require('./plugins/Fingerprint.js');
const RequestBody = require('./plugins/RequestBody.js');
const RequestSession = require('./plugins/RequestSession.js');

const Spacerift = (options) => {

  if (typeof options === 'object') {
    if (Boolean(options.debug) === true) {
      debug.enabled = true;
      debug.useColors = true;
      debug('Running in debug mode.')
    }
  }

  const PLUGINS = [];

  const HTTP = (req, res) => {
    STORE.dispatch({ type: 'CONNECT', req, res });
    onFinished(req, () => STORE.dispatch({ type: 'DISCONNECT', req, res }) );
  };

  const STORE = Redux.createStore((state = Immutable.Map({}), action) => {
    debug('ACTION', action.type);
    switch (action.type) {
      case 'CONNECT':
        PLUGINS.map((plugin, index) => {
          debug(plugin.label, 'plugin', index + 1, 'of', PLUGINS.length);
          state = plugin.onConnect(state, action);
          debug('STATE', state.toString());
        });
        return state;
        break;
      case 'DISCONNECT':
        PLUGINS.map((plugin, index) => {
          debug(plugin.label, 'plugin', index + 1, 'of', PLUGINS.length);
          state = plugin.onDisconnect(state, action);
          debug('STATE', state.toString());
        });
        return state;
        break;
      default:
        return state;
        break;
    }
  });
  return { HTTP, PLUGINS, Fingerprint, RequestBody, RequestSession };
};

module.exports = Spacerift;
