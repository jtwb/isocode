# Isocode ≅

**Isocode** evaluates any web page in a headless browser and builds a new page with all XHR traffic pre-cached and **[Precognition](https://github.com/jtwb/precognition)** included.

**Isocode** middleware is available for [Express / ConnectJS](#express--connectjs).

**Isocode** can

* Serve the post-onLoad state of Javascript apps.
* Reveal data in rich Javascript applications to search engine indexers, crawlers and users without Javascript enabled or available.
* Potentially improve the time-to-interaction for users with high connection latency.

**Isocode** and **Precognition** are agnostic towards MVC frameworks or lack thereof. In theory, this works with **jQuery**, **BackboneJS**, **Marionette**, **Ember**, **Angular**, ad infinitum.

# ≅ Usage

### Express / ConnectJS

Install the [connect-isocode](https://github.com/jtwb/connect-isocode) wrapper. (You may encounter https://github.com/ariya/phantomjs/issues/10904)

```bash
$ npm install --save connect-isocode
$ npm install -g phantomjs
```

Use the middleware in your app

```javascript
var isocode = require('connect-isocode');
app.use(isocode());
```

### Rack / Nginx / Restify / Revel

Port the [connect](https://github.com/jtwb/connect-isocode) wrapper to your platform. See [Wrapper design](https://github.com/jtwb/isocode/wiki/Wrappers#Design).

# ≅ Demo

This demo Express app is using the connect-isocode middleware. It serves the BackboneJS application from [https://github.com/davidsulc/backbone.marionette-collection-example], which is based on 
[https://github.com/ddellacosta/backbone.js-examples/tree/master/collections3].

With Isocode disabled, the page requires Javascript.
http://isocode-demo.odessa-labs.com/?bypass-isocode=1

With Isocode, the data is available without Javascript.
http://isocode-demo.odessa-labs.com/
