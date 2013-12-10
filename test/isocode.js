/*!
  * klass: a classical JS OOP façade
  * https://github.com/ded/klass
  * License MIT (c) Dustin Diaz & Jacob Thornton 2012
  */

!function (name, context, definition) {
  if (typeof define == 'function') define(definition)
  else if (typeof module != 'undefined') module.exports = definition()
  else context[name] = definition()
}('klass', this, function () {
  var context = this
    , old = context.klass
    , f = 'function'
    , fnTest = /xyz/.test(function () {xyz}) ? /\bsupr\b/ : /.*/
    , proto = 'prototype'

  function klass(o) {
    return extend.call(isFn(o) ? o : function () {}, o, 1)
  }

  function isFn(o) {
    return typeof o === f
  }

  function wrap(k, fn, supr) {
    return function () {
      var tmp = this.supr
      this.supr = supr[proto][k]
      var undef = {}.fabricatedUndefined
      var ret = undef
      try {
        ret = fn.apply(this, arguments)
      } finally {
        this.supr = tmp
      }
      return ret
    }
  }

  function process(what, o, supr) {
    for (var k in o) {
      if (o.hasOwnProperty(k)) {
        what[k] = isFn(o[k])
          && isFn(supr[proto][k])
          && fnTest.test(o[k])
          ? wrap(k, o[k], supr) : o[k]
      }
    }
  }

  function extend(o, fromSub) {
    // must redefine noop each time so it doesn't inherit from previous arbitrary classes
    function noop() {}
    noop[proto] = this[proto]
    var supr = this
      , prototype = new noop()
      , isFunction = isFn(o)
      , _constructor = isFunction ? o : this
      , _methods = isFunction ? {} : o
    function fn() {
      if (this.initialize) this.initialize.apply(this, arguments)
      else {
        fromSub || isFunction && supr.apply(this, arguments)
        _constructor.apply(this, arguments)
      }
    }

    fn.methods = function (o) {
      process(prototype, o, supr)
      fn[proto] = prototype
      return this
    }

    fn.methods.call(fn, _methods).prototype.constructor = fn

    fn.extend = arguments.callee
    fn[proto].implement = fn.statics = function (o, optFn) {
      o = typeof o == 'string' ? (function () {
        var obj = {}
        obj[o] = optFn
        return obj
      }()) : o
      process(this, o, supr)
      return this
    }

    return fn
  }

  klass.noConflict = function () {
    context.klass = old
    return this
  }

  return klass
});
/*
 * object.watch polyfill
 *
 * 2012-04-03
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

// object.watch
if (!Object.prototype.watch) {
  Object.defineProperty(Object.prototype, "watch", {
      enumerable: false
    , configurable: true
    , writable: false
    , value: function (prop, handler) {
      var
        oldval = this[prop]
      , newval = oldval
      , getter = function () {
        return newval;
      }
      , setter = function (val) {
        oldval = newval;
        return newval = handler.call(this, prop, oldval, val);
      }
      ;
      
      if (delete this[prop]) { // can't watch constants
        Object.defineProperty(this, prop, {
            get: getter
          , set: setter
          , enumerable: true
          , configurable: true
        });
      }
    }
  });
}

// object.unwatch
if (!Object.prototype.unwatch) {
  Object.defineProperty(Object.prototype, "unwatch", {
      enumerable: false
    , configurable: true
    , writable: false
    , value: function (prop) {
      var val = this[prop];
      delete this[prop]; // remove accessors
      this[prop] = val;
    }
  });
}
/*
 * TODO REFACTOR Split me into files
 *
 * TODO REFACTOR PR Klass: support constructor inheritance in raw object usage
 *
 * TODO ROBUSTNESS Expand browser support
 * - use SpyOn strategy (v2) over proxy object strategy (v1)
 * - support XHR1
 * - support ActiveX XHR object
 * - consider inter-spec translation of XHRLog
 *   - Record with XHR2, replay as XHR1
 *
 * TODO ROBUSTNESS find or create a XHR Test suite
 */
;
// Begin scope
(function(undefined) {

  // unused pattern for node support
  var root = window || this;



  // 
  // ******* CONSTANTS *******
  //
  // mode constants
  var MODE_REPLAY = 'replay',
      MODE_RECORD = 'record',
      MODE_OFF = 'off';


  // XHR constants
  var XHR_HOOKS = [
    'onerror',
    'onload',
    'onreadystatechange',
    'ontimeout',
  ];

  var XHR_MUTABLE_PROPERTIES = [
    'timeout',
    'withCredentials'
  ];

  var XHR_IMMUTABLE_PROPERTIES = [
    'readyState',
    'response',
    'responseText',
    'responseXML',
    'status',
    'statusText'
  ];
  /*
   * jQuery target set:
   *
   * new(0)
   * open(5)
   * send(1)
   * overrideMimeType(1)
   * setRequestHeader(2)
   * onload
   * onerror
   * status
   * statusText
   * responseText
   * getAllResponseHeaders(0)
   * abort(0)
   *
   * Others listed in MDN:
   * getResponseHeader(1)
   * onreadystatechange
   * response
   * responseType
   * responseXML
   * timeout
   * ontimeout
   * upload(1)
   * withCredentials
   */


  //
  // ************ RUNTIME CLOSURE DATA ***********
  // 
  var nativeXHR = XMLHttpRequest;
  var Data = root.XHRLog || {};



  //
  // ************ PRIVATE UTILITY ****************
  var noop = function() { };

  var passthru = function(callback, args) { return callback(args) };

  var chain = function(first, next) {
    return function() { 
      return first(next, arguments);
    };
  };

  var extend = function(host) { // ...
    var sources = Array.prototype.slice.call(arguments, 1);
    var l_sources = sources.length;
    var i_sources;
    var source;
    var key;

    for (i_sources = 0; i_sources < l_sources; i_sources++) {
      source = sources[i_sources];
      l_source = source.length;
      for (key in source) {
        host[key] = source[key];
      }
    }

    return host;
  };

  // TODO REFACTOR - decompose into familiar underscore semantics, e.g. pick, extend
  var copyProperties = function(proplist, from, into) {
    for (var i in proplist) {
      var name = proplist[i];
      into[name] = from[name];
    }
  };

  // wrap native[fname] in given wrap function
  //
  // wrap function must accept arguments (next, args)
  // and may invoke the native function with
  //
  //  result = next(args);
  //
  var proxy = function(fname, wrap) {
    var wrap = wrap || passthru;
    return function() {
      var proxyInstance = this;
      var nativeInstance = this.__native;
      var args = arguments;
      var goNative = function(args) {
        proxyInstance._syncImmutableProperties();
        return nativeInstance[fname].apply(nativeInstance, args);
      };
      // console.log('proxy', fname);
      return wrap.call(this, goNative, args);
    };
  };



  //
  // *********** XHRProxy *************
  //
  /*
   * On property setters:
   *  The XHR API can be configured by setting properties,
   *  e.g. myxhr.timeout = 3000;
   *  The Recorder proxy may fail to capture these settings in IE < 9.
   *
   * Property setter strategy:
   * 1 Sync values on all recieved function calls
   * 2 Use defineSetter and defineProperty to catch "late" configuration
   * 3 Ignore late configuration in IE<=8
   */
  /*
   * Stories
   * When a proxy method is called, it should trigger syncValues
   * When a proxy method is called, it should apply the args to the native function of given name
   * When a proxy method is called, if a wrapper is given, it should let the wrapper adjust the arguments and return value
   */
  var XHRProxy = klass(function(params) {
      this.__native = new nativeXHR(params);
      this._proxyHooks();
    })
  .methods({

    abort: proxy('abort'),

    open: proxy('open'),

    send: proxy('send'),

    overrideMimeType: proxy('overrideMimeType'),

    getResponseHeader: proxy('getResponseHeader'),

    getAllResponseHeaders: proxy('getAllResponseHeaders'),

    setRequestHeader: proxy('setRequestHeader'),

    upload: proxy('upload'),

    onHook: function() {
      this._syncImmutableProperties();
    },
    
    _proxyHooks: function() {
      var self = this;
      var nativeInstance = this.__native;

      // for each hook
      // attach a default handler which
      // - fires onHook
      // - fires ononload
      // - fires user onload
      for (var i in XHR_HOOKS) {
        (function() {
          var name = XHR_HOOKS[i];
          nativeInstance[name] = function() {
            // console.log(name);

            // fire onHook for all hooks
            self.onHook.apply(self, arguments);

            // fire ononload
            self['on' + name] && self['on' + name].apply(self, arguments);

            // fire onload
            self[name] && self[name].apply(this, arguments);
          };
        })();
      }
    },

    // copy from native object to proxy object
    _syncImmutableProperties: function() {
      var nativeInstance = this.__native;

      // when readyState < 2,
      // reading immutable properties throws DOMException
      if (nativeInstance.readyState >= 2) {
        copyProperties(XHR_IMMUTABLE_PROPERTIES, nativeInstance, this);
      }
    },

    _getCacheKeyFromOptions: function(opts) {
      return [opts[0], opts[1], opts[3], opts[4]].join(' ').trim();
    }
  });



  //
  // ****************** XHRRecorder ******************
  //
  var XHRRecorder = XHRProxy.extend(function() {
    var self = this;
    var nativeInstance = this.__native;

    (function setupXHRMutableProperties() {
      // for each mutable property
      // use Gecko Watch (polyfill)
      // which uses Object.defineProperty
      // forward mutations to the native object
      for (var i in XHR_MUTABLE_PROPERTIES) {
        (function() {
          var name = XHR_MUTABLE_PROPERTIES[i];
          this.watch(name, function(_, __, value) {
            nativeInstance[name] = value;
            return value;
          });
        })();
      }
    })();
  })
  .methods({

    open: proxy('open', function(next, args) {
      this.__key = this._getCacheKeyFromOptions(args);
      return next(args);
    }),

    // record response into data
    // under key set by open / send pair
    ononload: function() {
      Data[this.__key] = this._serialize();
      // console.log('serialized');
      // console.log(Data[this.__key]);
    },

    // includes
    //   * immutable properties
    //   * response headers
    _serialize: function() {
      var serialized = {
        _responseHeaders: this.getAllResponseHeaders()
      };

      copyProperties(XHR_IMMUTABLE_PROPERTIES, this, serialized);

      return serialized;
    }
  });



  /*
   * XHR Proxy: Replay
   *
   * XMLHttpRequest.prototype.open = function() { ... }
   *
   * on 'send', fire user onload
   * responseText, status, getAllResponseHeaders must all
   * respond with fake data
   *
   * no need to watch the mutable settings
   * as they will be ignored
   */
  var XHRReplay = XHRRecorder.extend(function() {
  }).methods({

    ononload: noop,

    ononerror: noop,

    // TODO impliment - parse string responseHeaders into hash
    getResponseHeader: proxy('getResponseHeader', function(_, args) {
      // var key = args[0];
      // return this._responseHeaders[key];
      return;
    }),

    getAllResponseHeaders: proxy('getAllResponseHeaders', function() {
      return this._responseHeaders;
    }),

    open: proxy('open', function(next, args) {
      this.__key = this._getCacheKeyFromOptions(args);
      return next(args);
    }),

    send: proxy('send', function(next, args) {

      var self = this;

      // if no replay available for this request, passthru
      if (!(this.__key && this.__key in Data)) {
        return next(args);
      }

      extend(this, Data[this.__key]);

      // then execute user onload callback on next tick
      setTimeout(function() {
        self.onload && self.onload("load");
      }, 0);

      return false;
    })

  });



  /*
   * Core controller
   */
  var Precognition = {

    mode: MODE_REPLAY,

    nativeXHR: nativeXHR,

    record: function() {
      Precognition.mode = MODE_RECORD;
      root.XMLHttpRequest = XHRRecorder;
    },

    replay: function() {
      Precognition.mode = MODE_REPLAY;
      root.XMLHttpRequest = XHRReplay;
      Data = root.XHRLog;
    },

    off: function() {
      Precognition.mode = MODE_OFF;
      root.XMLHttpRequest = nativeXHR;
    }
  };



  /*
   * Attach library to window
   */
  root.Precognition = Precognition;
  root.XHRLog = Data;
})();

// TODO require precognition

(function(window) {
  if (window.Isocode) { return; }

  var mode = window.IsocodeMode || 'server';

  window.Isocode = {
    mode: function() {
      var args = arguments;
      return args.length ? mode = args[0] : mode;
    }
  };

  // on start
  if (mode == 'server') {
    Precognition.record();
  } else {
    Precognition.replay();
  }

})(window);
