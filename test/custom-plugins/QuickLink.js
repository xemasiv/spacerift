const Immutable = require('immutable');
const debug = require('debug')('QuickLink');

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
      debug('req.session', req.session);
      return state;
    },
    onDisconnect: (state, action) => {
      const { req, res } = action;
      return state;
    }
  };
};
module.exports = QuickLink;
