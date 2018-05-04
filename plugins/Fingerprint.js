const Immutable = require('immutable');
const debug = require('debug')('Fingerprint');
const circular = require('circular-json');
const sha3_256 = require('js-sha3').sha3_256;
const useragent = require('useragent');
const geoip = require('geoip-lite');

// TODO:
// Support client names and namespaces.
// Allows multiple identities to co-exist from a single device.
const Fingerprint = (options) => {
  if (typeof options === 'object') {
    if (Boolean(options.debug) === true) {
      debug.enabled = true;
      debug.useColors = true;
      debug('Running in debug mode.')
    }
  }
  return {
    label: 'Fingerprint',
    actionCreator: (event, req, res) => {
      return (dispatch, getState) => {
        // Here you can:
        // - Identify if it's a 'connect' or 'disconnect' event
        // - Get stuff from 'req' or 'res'
        // - Get the current state from 'getState'
        // - Dispatch an action synchronously or asynchronously using 'dispatch'
        debug('actionCreator EVENT', event);
        debug('actionCreator STATE', getState());

        const getFingerprint = (req) => {
          const agent = useragent.lookup(req.headers['user-agent']).toJSON();
          const geo = geoip.lookup(req.ip);
          const headers = {
            host: req.headers['host'],
            accept: req.headers['accept'],
            language: req.headers['accept-language']
          };
          const protocol = req.protocol;
          return sha3_256(
            circular.stringify({
              agent, geo, headers, protocol
            })
          );
        };
        let fingerprint = getFingerprint(req);
        switch (event) {
          case 'connect':
            dispatch({ type: 'mount', fingerprint, req, res });
            break;
          case 'disconnect':
            dispatch({ type: 'unmount', fingerprint, req, res });
            break;
          default:
            break;
        };
      };
    },
    reducer: (state, action) => {
      // Here you can:
      // - Identify the dispatch action from 'action'
      // - Modify and return the 'state'
      const { type, fingerprint, req, res } = action;
      debug('reducer type', type);
      debug('reducer fingerprint', fingerprint);

      if (state.has('fingerprints') === false) {
        state = state.set('fingerprints', Immutable.List());
      };
      if (state.has('requests') === false) {
        state = state.set('requests', Immutable.Map({}));
      };
      if (state.has('responses') === false) {
        state = state.set('responses', Immutable.Map({}));
      };

      let fingerprints = state.get('fingerprints');
      let requests = state.get('requests');
      let responses = state.get('responses');

      switch (type) {
        case 'mount':
          req.session.fingerprint = fingerprint;

          if (fingerprints.includes(fingerprint) === false) {
            fingerprints = fingerprints.push(fingerprint);
            state = state.set('fingerprints', fingerprints);
          };
          if (requests.has(fingerprint) === false) {
            requests = requests.set(fingerprint, req);
            state = state.set('requests', requests);
          };
          if (responses.has(fingerprint) === false) {
            responses = responses.set(fingerprint, res);
            state = state.set('responses', responses);
          };
          return state;
          break;
        case 'unmount':
          delete req.session.fingerprint;

          if (fingerprints.includes(fingerprint) === true) {
            fingerprints = fingerprints.delete(fingerprints.indexOf(fingerprint));
            state = state.set('fingerprints', fingerprints);
          };
          if (requests.has(fingerprint) === true) {
            requests = requests.delete(fingerprint);
            state = state.set('requests', requests);
          };
          if (responses.has(fingerprint) === true) {
            responses = responses.delete(fingerprint);
            state = state.set('responses', responses);
          };
          return state;
          break;
        default:
          return state;
          break;
      }
    }
  };
};
module.exports = Fingerprint;
