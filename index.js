const onFinished = require('on-finished');
const Immutable = require('immutable');
const Redux = require('redux');
const ReduxThunk = require('redux-thunk').default;

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
    debug('CONNECTED');
    PLUGINS.map((plugin, index) => {
      var event = 'connect';
      debug(plugin.label, 'plugin', index + 1, 'of', PLUGINS.length);
      STORE.dispatch(plugin.actionCreator(event, req, res));
    });
    onFinished(res, () => {
      debug('DISCONNECTED');
      PLUGINS.map((plugin, index) => {
        var event = 'disconnect';
        debug(plugin.label, 'plugin', index + 1, 'of', PLUGINS.length);
        STORE.dispatch(plugin.actionCreator(event, req, res));
      });
    });
  };

  const RootReducer = (state = Immutable.Map({}), action) => {
    debug('ACTION', action.type);
    PLUGINS.map((plugin, index) => {
      debug(plugin.label, 'plugin', index + 1, 'of', PLUGINS.length);
      state = plugin.reducer(state, action);
      debug('STATE', state.toString());
    });
    return state;
  };

  const STORE = Redux.createStore(
    RootReducer,
    Redux.applyMiddleware(ReduxThunk)
  );
  return { HTTP, PLUGINS, Fingerprint, RequestBody, RequestSession };
};

module.exports = Spacerift;
