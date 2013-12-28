# Isocode ≅

Run any Javascript app as an [isomorphic app](http://nerds.airbnb.com/isomorphic-javascript-future-web-apps/).

# Usage ≅

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

