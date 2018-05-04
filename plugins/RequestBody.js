const debug = require('debug')('ReqBody');

const RequestBody = (options) => {
  if (typeof options === 'object') {
    if (Boolean(options.debug) === true) {
      debug.enabled = true;
      debug.useColors = true;
      debug('Running in debug mode.')
    }
  }
  return {
    label: 'RequestBody',
    onConnect: (state, action) => {
      const { req } = action;
      debug(req.body);
      return state;
    },
    onDisconnect: (state, action) => {
      const { req } = action;
      debug(req.body);
      return state;
    }
  };
};
module.exports = RequestBody;
