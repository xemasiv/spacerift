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
              private: pgp_private,
              public: pgp_public
            });
          });
        });
      });
    }
  });
});

const sign = (public, private, passphrase, message) => new Promise((resolve, reject) => {
  kbpgp.KeyManager.import_from_armored_pgp({ armored: public }, (err, alice) => {
    if (Boolean(err) === true) {
      reject(err);
    } else {
      alice.merge_pgp_private({ armored: private }, (err) => {
        if (Boolean(err) === true) {
          reject(err);
        } else {
          if (alice.is_pgp_locked()) {
            alice.unlock_pgp({ passphrase: passphrase }, (err) => {
              if (Boolean(err) === true) {
                reject(err);
              } else {
                debug("Loaded private key with passphrase");
                var params = { msg: message, sign_with:  alice };
                kbpgp.box (params, (err, result_string, result_buffer) => {
                  resolve(result_string);
                });
              }
            });
          } else {
            debug("Loaded private key w/o passphrase");
            var params = { msg: message, sign_with:  alice };
            kbpgp.box (params, (err, result_string, result_buffer) => {
              resolve(result_string);
            });
          }
        }
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
          switch (req.body.action) {
            case 'create':
              var { userid, passphrase } = req.body;
              create(userid, passphrase)
                .then((result) => {
                  debug(result);
                  res.send({result});
                })
                .catch(debug)
              break;
            case 'sign':
              var { public, private, passphrase, message } = req.body;
              sign(public, private, passphrase, message)
                .then((result) => {
                  debug(result);
                  res.send({result});
                })
                .catch(debug)
              break;
            default:
              break;
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
