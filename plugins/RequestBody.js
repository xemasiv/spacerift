const Immutable = require('immutable');
const debug = require('debug')('RequestBody');
const circular = require('circular-json');
const sha3_256 = require('js-sha3').sha3_256;
const useragent = require('useragent');
const geoip = require('geoip-lite');

// TODO:
// Support client names and namespaces.
// Allows multiple identities to co-exist from a single device.
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
    actionCreator: (event, req, res) => {
      return (dispatch, getState) => {
        // Here you can:
        // - Identify if it's a 'connect' or 'disconnect' event
        // - Get stuff from 'req' or 'res'
        // - Get the current state from 'getState'
        // - Dispatch an action synchronously or asynchronously using 'dispatch'
        debug(req.body);
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
module.exports = RequestBody;