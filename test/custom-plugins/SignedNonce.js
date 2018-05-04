const Immutable = require('immutable');
const debug = require('debug')('SignedNonce');
const circular = require('circular-json');
const kbpgp = require('kbpgp');

var F = kbpgp["const"].openpgp;
var opts = {
  userid: "User McTester (Born 1979) <user@example.com>",
  primary: {
    nbits: 4096,
    flags: F.certify_keys | F.sign_data | F.auth | F.encrypt_comm | F.encrypt_storage,
    expire_in: 0  // never expire
  },
  subkeys: [
    {
      nbits: 2048,
      flags: F.sign_data,
      expire_in: 86400 * 365 * 8 // 8 years
    }, {
      nbits: 2048,
      flags: F.encrypt_comm | F.encrypt_storage,
      expire_in: 86400 * 365 * 8
    }
  ]
};

let alice2;
kbpgp.KeyManager.generate(opts, (err, alice) => {
  alice2 = alice;
  if (!err) {
    // sign alice's subkeys
    alice.sign({}, (err) => {
      debug(alice);
      // export demo; dump the private with a passphrase
      alice.export_pgp_private ({
        passphrase: 'booyeah!'
      }, (err, pgp_private) => {
        debug("private key: ", pgp_private);
      });
      alice.export_pgp_public({}, (err, pgp_public) => {
        debug("public key: ", pgp_public);
      });
    });
  } else {
    debug('ERROR', err);
  }
});


const SignedNonce = (options) => {
  if (typeof options === 'object') {
    if (Boolean(options.debug) === true) {
      debug.enabled = true;
      debug.useColors = true;
      debug('Running in debug mode.')
    }
  }
  return {
    label: 'SignedNonce',
    onConnect: (state, action) => {
      const { req, res } = action;
      // res.json({ hi: 'hi hi hi'});
      debug(alice2);
      return state;
    },
    onDisconnect: (state, action) => {
      const { req, res } = action;
      return state;
    }
  };
};
module.exports = SignedNonce;
