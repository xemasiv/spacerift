const onFinished = require('on-finished');
const Immutable = require('immutable');
const Redux = require('redux');

const debug = require('debug')('Spacerift');

const Fingerprint = require('./plugins/Fingerprint.js');

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
    STORE.dispatch({ type: 'connect', req, res });
    onFinished(req, () => STORE.dispatch({ type: 'disconnect', req, res }) );
  };

  const STORE = Redux.createStore((state = Immutable.Map({}), action) => {
    debug('ACTION', action.type);
    switch (action.type) {
      case 'connect':
        PLUGINS.map((plugin, index) => {
          debug(plugin.label, 'plugin', index + 1, 'of', PLUGINS.length);
          state = plugin.onConnect(state, action);
        });
        return state;
        break;
      case 'disconnect':
        PLUGINS.map((plugin, index) => {
          debug(plugin.label, 'plugin', index + 1, 'of', PLUGINS.length);
          state = plugin.onDisconnect(state, action);
        });
        return state;
        break;
      default:
        return state;
        break;
    }
  });
  return { HTTP, PLUGINS, Fingerprint };
};

module.exports = Spacerift;
