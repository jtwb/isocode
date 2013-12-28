# Isocode ≅

Run any Javascript app or HTML page with essential Javascript as [Isomorphic code](http://nerds.airbnb.com/isomorphic-javascript-future-web-apps/). Specifically, **Isocode** will

* Transmit HTML describing the post-onLoad state of the page.
* Cache all `XMLHttpRequests` using [Precognition](https://github.com/jtwb/precognition).

Consequently, **Isocode** can do things like

* Reveal complex `pushState`-based Javascript applications to search engine indexes.
* Make complex `pushState`-based Javascript applications accessible to browsers without Javascript enabled or available.
* Potentially improve the time until interaction for users with high connection latency.

# ≅ Usage

## ExpressJS & ConnectJS

Install the [connect-isocode](https://github.com/jtwb/connect-isocode) wrapper.

```bash
$ npm install --save connect-isocode
```

Use the middleware in your app

```javascript
var isocode = require('connect-isocode');
app.use(isocode());
```

## Rack / Nginx / Restify / Revel

Port the [connect](https://github.com/jtwb/connect-isocode) wrapper to your platform. See [https://github.com/jtwb/isocode/wiki/Wrappers](Wrapper design).

