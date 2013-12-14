var page = require('webpage').create();
var system = require('system');

// plain driver reads the page from stdin using this strategy:
// 1 Spawn a webserver on some unix socket (or local port)
// 2 Tell phantom to fetch page from said unix socket (or local port)
// 3 On data recieved from isocode, xmit data to phantom
// 4 On complete, phantom should send EOF through the pipe
//
// Isocode child stdin -> Webserver IN -> Webserver RESPONSE
// -> Phantom PAGE IN ... Phantom result -> Phantom STDOUT -> Isocode child stdout
//
// Plan B
//
// Open file:///dev/stdin
// - note, phantom may not be waiting for EOF on stdin
//
// Plan C
//
// Pipe /dev/stdin to a /tmp file /tmp/:hash
// Open file:///tmp/:hash
// 

//
// Usage and argparse
//
var usage = 'Usage: phantomjs driver.js [ URL | "-" ]';
var args = Array.prototype.slice.call(system.args, 0);

console.log(args);
if (args.length < 2 || args[1] === '-') {
  
  // no arguments or first argument '-' implies read stdin
  args.stdin = true;
} else if (/--help|-h|--version|-v/.test(args[1])) {
  console.log(usage);
  phantom.exit();
} else {
  args.url = args[1];
}


// NOTES on working with PhantomJS Streams (e.g. STDIN)
// ... as of 1.9.2 ...
// * PhantomJS File, Streams are based on QT QFile http://qt-project.org/doc/qt-4.8/qiodevice.html#readAll
// * CPP Source:
//   https://github.com/ariya/phantomjs/blob/4989445e714bb97fe49ef8c00ccbce8b6cfbfbb0/src/filesystem.cpp
//   https://github.com/ariya/phantomjs/blob/4989445e714bb97fe49ef8c00ccbce8b6cfbfbb0/src/filesystem.h
//
// Methods available
// open
// read (bytes)
// read (-1 -> readall)
// atEnd() -> bool
// close
//
// while !atEnd
//  read (bufsize)
// 
// TODO explore streaming HTML bytes to phantom in 0x4000b blocks


//
// Start webserver
// iff reading from stdin
//
if (args.stdin) {
  var webserver = require('webserver');
  var server = webserver.create();
  var service = server.listen(9080, function(request, response) {
    var body = system.stdin.read(-1);
    response.statusCode = 200;
    response.write(body);
    response.close();
  });
}

// 
// Utilities
// 
// Console filter
//
var isocodePhantomPrefixPresent = function(msg) {
  return /^phantom\|/.test(msg)
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
// PhantomJS in-page processing
//
var processPage = function() {

  var getXHRLogConfig = function() {
    var dataJSONString = JSON.stringify(window.XHRLog);
    return 'XHRLog = ' + dataJSONString + ';\n';
  };

  var getIsocodeConfig = function() {
    return window.Isocode ? 'IsocodeMode = "client";\n' : '';
  };

  var writeConfigToDOM = function() {
    if (window.XHRLog) {
      var head = document.getElementsByTagName('head')[0];
      var inlineScriptHTML = '\n' +
        '<script type="text/javascript">\n' +
        getXHRLogConfig() +
        getIsocodeConfig() +
        '</script>\n';
      head.innerHTML = inlineScriptHTML + head.innerHTML;
    }
  };

  var getPageHTML = function() {
    return (document.doctype ? document.doctype + '\n' : '') +
      document.documentElement.outerHTML;
  };

  writeConfigToDOM();
  console.log('phantom|' + getPageHTML());
};


//
// Drive PhantomJS
// 
page.open(args.stdin ? 'http://localhost:9080/' : args.url, function() {
  page.evaluate(processPage);
  phantom.exit();
});
