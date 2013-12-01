var page = require('webpage').create();
var system = require('system');

//
// Usage and argparse
//
var usage = 'Usage: phantomjs driver.js [ URL ]';
var args = Array.prototype.slice.call(system.args, 0);
if (args.length > 1) {
  args.url = args[1];
} else {
  console.log(usage);
  phantom.exit();
}


// 
// Utilities
// 
var isocodePhantomPrefixPresent = function(msg) {
  return /^phantom|/.test(msg)
};

var isocodePhantomPrefixStrip = function(msg) {
  var prefix = 'phantom|'.length;
  return msg.substr(prefix);
};



//
// Emit string
//
page.onConsoleMessage = function(msg) {
  if (isocodePhantomPrefixPresent(msg)) {
    console.log(isocodePhantomPrefixStrip(msg));
  }
};



//
// Drive PhantomJS
// 
page.open(args.url, function() {
  page.evaluate(function() {
    console.log($('html').html());
  });
  phantom.exit();
});
