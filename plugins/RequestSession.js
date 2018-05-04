const debug = require('debug')('RequestSession');

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
    actionCreator: (event, req, res) => {
      return (dispatch, getState) => {
        // Here you can:
        // - Identify if it's a 'connect' or 'disconnect' event
        // - Get stuff from 'req' or 'res'
        // - Get the current state from 'getState'
        // - Dispatch an action synchronously or asynchronously using 'dispatch'
        debug(req.session);
      };
    },
    reducer: (state, action) => {
      // Here you can:
      // - Identify the dispatch action from 'action'
      // - Modify and return the 'state'
      const { type, req, res } = action;
      return state;
    }
  };
};
module.exports = RequestSession;
