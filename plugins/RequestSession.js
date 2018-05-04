const debug = require('debug')('ReqSession');

const RequestSession = (options) => {
  if (typeof options === 'object') {
    if (Boolean(options.debug) === true) {
      debug.enabled = true;
      debug.useColors = true;
      debug('Running in debug mode.')
    }
  }
  return {
    label: 'RequestSession',
    onConnect: (state, action) => {
      const { req } = action;
      debug(req.session);
      return state;
    },
    onDisconnect: (state, action) => {
      const { req } = action;
      debug(req.session);
      return state;
    }
  };
};
module.exports = RequestSession;
