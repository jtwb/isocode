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
    // $('html').html();
    return (document.doctype ? document.doctype + '\n' : '') +
      document.documentElement.outerHTML;
  };

  writeConfigToDOM();
  console.log('phantom|' + getPageHTML());
};


//
// Drive PhantomJS
// 
page.open(args.url, function() {
  page.evaluate(processPage);
  phantom.exit();
});
