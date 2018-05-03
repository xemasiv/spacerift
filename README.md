# spacerift
HTTP-based peer-links with efficient roundtrips.

## Server Basics
* The server is an `express` instance where each incoming request is fingerprinted to identify clients by device.
  * `sha3_256` hash of the following:
    * `useragent`
    * `ip`
    * `headers.host`, `headers.accept`, `headers.language`
* Clients are then Mapped to `clients` object
  * `clients` is an instance of Map(), where:
    * `key` : `sha3_256` fingerprint
    * `value` : Object
      * `request` : `req` Object
      * `connection` : `online` String
* An `onFinished` is also attached to the `req` Object to detect whenever the client disconnects.
  * This changes the client's `connection` state to `offline`, and this removes the `request` reference to the `req` Object.
  * Now everytime this client connects, its `connection` state is switched back to `online`, and its `request` value is updated with the new `req` Object.

## Server & Client Plug-ins
* We use plug-ins to allow users to just pick any existing modules for their project, or easily craft one for custom purposes.

## License

Attribution 4.0 International (CC BY 4.0)

* https://creativecommons.org/licenses/by/4.0/
* https://creativecommons.org/licenses/by/4.0/legalcode.txt

![cc](https://creativecommons.org/images/deed/cc_blue_x2.png) ![by](https://creativecommons.org/images/deed/attribution_icon_blue_x2.png)
