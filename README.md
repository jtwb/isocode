# Isocode ≅

**Isocode** evaluates any web page in a headless browser and builds a new page with all XHR traffic pre-cached and **[Precognition](https://github.com/jtwb/precognition)** included.

**Isocode** middleware is available for [Express / ConnectJS](#express--connectjs).

**Isocode** can

* Serve the post-onLoad state of Javascript apps.
* Reveal data in rich Javascript applications to search engine indexers, crawlers and users without Javascript enabled or available.
* Potentially improve the time-to-interaction for users with high connection latency.

**Isocode** and **Precognition** are agnostic towards MVC frameworks or lack thereof. In theory, this works with **jQuery**, **BackboneJS**, **Marionette**, **Ember**, **Angular**, ad infinitum.


## ≅ Scenarios

### Search Engine Indexers

Let's say you have a Javascript application bound to your REST API. Your server serves the API and the static page containing the JS app, but does not render the data as HTML. In this case, search engine indexers without Javascript will recognize your pages as blank.

Adding Isocode to the mix will cause your server to serve HTML pages which the indexer can read.

The pages still contain your Javascript app so they can be served to your regular visitors, although you may want to employ some user-agent filtering so only non-browser HTTP clients (indexers, cURL, etc) trigger Isocode.

### Performance

Let's say you have a Javascript application bound to your REST API. The first thing your JS app does is send an XHR request fetching the data for the page. For example, at `yourapp.com/users/jtwb` your JS app fetches `api.yourapp.com/users/jtwb.json` via XHR.

With Isocode enabled, visitors to `yourapp.com/users/jtwb` will not have to make that initial XHR request because the API response *will be inlined in the page and replayed via Precognition*. [Precognition](https://github.com/jtwb/precognition) creates a proxy over the browser's XMLHttpRequest and skips requests inlined in the page.

Combined with `Cache-Control` headers and a caching proxy, you have now eliminated that initial API latency without having to spin up PhantomJS on every request.

If the content is truly uncacheable however, you would face a balance between the benefit of performing XHR over the low-latency inter-colo network (ideally loopback) and the cost of PhantomJS. You may still gain in speed because your user's browser may very well transit a cell phone tower and the internet backbone. Isocode is loosely coupled with PhantomJS so faster page evaluators may become available later.


## ≅ Is it any good?

Yes.

## ≅ Usage

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

### Rack

See https://github.com/jtwb/rack-isocode

### Nginx / Restify / Revel

Port the [connect](https://github.com/jtwb/connect-isocode) wrapper to your platform. See [Wrapper design](https://github.com/jtwb/isocode/wiki/Wrappers#Design).

## ≅ Live Demo

With Isocode disabled, the page requires Javascript.

http://isocode-demo.odessa-labs.com/?bypass-isocode=1

Otherwise, the data is available without Javascript thanks to **Isocode**.

http://isocode-demo.odessa-labs.com/

Try viewing the demo pages with javascript disabled in your browser.

The server is running a [connect-isocode test Express application](https://github.com/jtwb/connect-isocode/tree/master/test/cats), using the Isocode middleware. It serves the BackboneJS application from https://github.com/davidsulc/backbone.marionette-collection-example, which is based on 
https://github.com/ddellacosta/backbone.js-examples/tree/master/collections3.
