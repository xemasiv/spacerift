const Immutable = require('immutable');
const debug = require('debug')('fingerprint');

const QuickLink = (options) => {
  if (typeof options === 'object') {
    if (Boolean(options.debug) === true) {
      debug.enabled = true;
      debug.useColors = true;
      debug('Running in debug mode.')
    }
  }
  return {
    label: 'QuickLink',
    onConnect: (state, action) => {
      const { req, res } = action;
      return state;
    },
    onDisconnect: (state, action) => {
      const { req, res } = action;
      return state;
    }
  };
};
module.exports = QuickLink;
