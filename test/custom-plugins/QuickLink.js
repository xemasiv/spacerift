const Immutable = require('immutable');
const debug = require('debug')('QuickLink');
const circular = require('circular-json');

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
      debug('req.body', req.body);
      debug('req.session', req.session);
      res.json({ hi: 'hi hi hi'});
      debug(state.toObject());
      return state;
    },
    onDisconnect: (state, action) => {
      const { req, res } = action;
      debug(state.toObject());
      return state;
    }
  };
};
module.exports = QuickLink;
