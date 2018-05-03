# spacerift
Simplified WebRTC client orchestration.

#### Intro
* `Spacerift` is a server-based module which aims to make it easier for devs to `orchestrate WebRTC clients as they come and go`.
* The idea is to create a `minimal` framework which provides `efficiency`, `re-usability` and `flexibility` in various possible WebRTC server and client implementations.

#### Compatibility
* `HTTP-based` support is currently being developed for compatibility with `express`, and with `hapi`, `koa`, etc in the future.
* `WebSocket-based` support may be expected as soon as we have a stable `HTTP-based` implementation.

#### Immutable server state
* We are using `Immutable.js` for our server state.

#### Use of plug-ins
* The idea is to enables the use of existing implementations, or craft new ones without compatibility friction.
* Another purpose of using plugins is to orchestrate the way we interact with the server state, and to keep ourselves mindful in ensuring efficient roundtrips.
* Plugins are loaded in an `Array` during initialization, and are executed in chronological order.

## HTTP-based support

#### How it works

1. We bind `Spacerift.HTTP` to our `express` app.
```
const Spacerift = require('spacerift')({
  debug: true
});
app.post('/', Spacerift.HTTP);
```
2. We load our plugins at `Spacerift.PLUGINS`.
3. When our server receives a request on that endpoint, we dispatch a Redux `action`:
  * `type` : `connect`
  * `req` : `req`
  * `res` : `res`
4. Then our built-in reducer forwards this action to the `onConnect` method of our plugins:
  * `state` : `state`
  * `action` : `action`
    * `type` : `connect`
    * `req` : `req`
    * `res` : `res`
5. At this point it's now up to the plugin on which changes are to be made to the state, and how it will interact with the `req` request object and `res` response object.
6. We also have a built-in mechanism which detects when the client's request has closed, or has suddenly disconnected. This issues the following Redux `action`:
  * `type` : `disconnect`
  * `req` : `req`
  * `res` : `res`
7. Then our built-in reducer forwards this action to the `onDisconnect` method of our plugins:
  * `state` : `state`
  * `action` : `action`
    * `type` : `disconnect`
    * `req` : `req`
    * `res` : `res`

#### Plugin API

* A `plugin` is a function that returns a `plugin` Object. It's intentionally a function so we can optionally accept arguments as `options`.
* The returned `plugin` Object is expected to have the following properties and methods:
  * property `label` String
  * method `onConnect` Function
    * Takes `(state, action)`
      * `state` : `Immutable.Map`
      * `action` : `Object`
    * Returns
      * `state` : `Immutable.Map`
  * method `onDisconnect` Function
    * Takes `(state, action)`
      * `state` : `Immutable.Map`
      * `action` : `Object`
    * Returns
      * `state` : `Immutable.Map`

#### Built-in plug-ins
* plugin `Fingerprint`
  * Exposed as `Spacerift.Fingerprint`
  * This plugin's purpose is to efficiently identify individual clients as they connect and disconnect from our server.
  * A `sha3_256` hash of the following will be used as the `fingerprint`:
    * `useragent`
    * `ip`
    * `headers.host`, `headers.accept`, `headers.language`
  * Where:
    * `state[fingerprints]`.push(`fingerprint`)
    * `state[requests[fingerprint]]` : `req`
    * `state[responses[fingerprint]]` : `res`

#### Using plug-ins
* To use plugins, just push them to  `Spacerift.PLUGINS` Array:
```
Spacerift.PLUGINS.push(
    Spacerift.Fingerprint({
      debug: true
    })
);
```

#### Spacerift HTTPClient
* For the client-side, you may write and use your own WebRTC client implementations.
* However we also supply a bare client with the following libraries:
  * `immutable`
  * `redux`
  * `simple-peer`
* The following polyfills are also included:
  * `babel-polyfill`
  * `whatwg-fetch`
* In the browser, `spacerift.min.js` exposes the following:
  * `window.Immutable` : `immutable` library
  * `window.Redux` : `redux` library
  * `window.Peer` : `simple-peer` library
  * `window.Spacerift` : Object
    * `STORE` : `Redux Store`
    * `REDUCERS` : `Reducers Array`
    * `HTTPClient` : class `HTTPClient`
    * `enableDebug` : Function
* class `HTTPClient`
  * `constructor` (options)
    * Takes `(options)`
      * `options.host` - target host, defaults to window.location.href
  * method `createPeer` (options) Function
    * Creates a new `simple-peer` instance.
    * Takes `(options)`
      * `options` - passed to the new instance
    * Returns
      * `simple-peer` instance.
  * property `peers` `Immutable.List`
    * Returns list of created peers.
* Testing client `STORE` and `REDUCER`
  * Run `npm test` or load `spacerift.min.js` anywhere.
  * Paste the following code in console:
  ```
  Spacerift.enableDebug();
  Spacerift.REDUCERS.push((state, action) => {
    console.log(state.toString());
    console.log(action);
    return state;
  })
  Spacerift.STORE.dispatch({ type: 'Hello!' });
  ```
  * Expected result:
  ```
  06:44:00.381 Spacerift ACTION +0ms Hello!
  06:44:00.381 Spacerift REDUCER +1ms 1 of 1
  06:44:00.382 Map {}
  06:44:00.382 {type: "Hello!"}
  06:44:00.384 Spacerift STATE UPDATED +2ms
  06:44:00.384 Spacerift Map {} +0ms
  ```

## License

Attribution 4.0 International (CC BY 4.0)

* https://creativecommons.org/licenses/by/4.0/
* https://creativecommons.org/licenses/by/4.0/legalcode.txt

![cc](https://creativecommons.org/images/deed/cc_blue_x2.png) ![by](https://creativecommons.org/images/deed/attribution_icon_blue_x2.png)
