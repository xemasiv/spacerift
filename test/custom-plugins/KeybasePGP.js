const kbpgp = require('kbpgp');
const debug = require('debug')('KeybasePGP');
const F = kbpgp["const"].openpgp;

const create = (userid, passphrase) => new Promise((resolve, reject) => {
  var opts = {
    userid,
    primary: { nbits: 4096, flags: F.certify_keys | F.sign_data | F.auth | F.encrypt_comm | F.encrypt_storage, expire_in: 0 },
    subkeys: [ { nbits: 2048, flags: F.sign_data, expire_in: 86400 * 365 * 8  }, {
        nbits: 2048, flags: F.encrypt_comm | F.encrypt_storage, expire_in: 86400 * 365 * 8 } ]
  };
  kbpgp.KeyManager.generate(opts, (err, alice) => {
    if (Boolean(err) === true) {
      reject(err);
    } else {
      // sign alice's subkeys
      alice.sign({}, (err) => {
        alice.export_pgp_private({ passphrase }, (err, pgp_private) => {
          debug("private key: ", pgp_private);
          alice.export_pgp_public({}, (err, pgp_public) => {
            debug("public key: ", pgp_public);
            resolve({
              userid,
              passphrase,
              pgp_private,
              pgp_public
            });
          });
        });
      });
    }
  });

});

const KeybasePGP = (options) => {
  if (typeof options === 'object') {
    if (Boolean(options.debug) === true) {
      debug.enabled = true;
      debug.useColors = true;
      debug('Running in debug mode.')
    }
  }
  return {
    label: 'KeybasePGP',
    actionCreator: (event, req, res) => {
      return (dispatch, getState) => {
        // Here you can:
        // - Identify if it's a 'connect' or 'disconnect' event
        // - Get stuff from 'req' or 'res'
        // - Get the current state from 'getState'
        // - Dispatch an action synchronously or asynchronously using 'dispatch'

        if (event === 'connect') {
          if (req.body.namespace !== 'keybasepgp') {
            return;
          }
          if (req.body.action === 'create') {
            const { userid, passphrase } = req.body;
            create(userid, passphrase)
              .then((result) => {
                debug(result);
                res.send(result);
              })
              .catch(debug)
          }
        }
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
module.exports = KeybasePGP;
