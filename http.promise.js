'use strict';

var Promise = require('bluebird'),
  onPossiblyUnhandledRejection = Promise.onPossiblyUnhandledRejection.bind(Promise),
  onUnhandledRejectionHandled = Promise.onUnhandledRejectionHandled.bind(Promise),
  longStackTraces = Promise.longStackTraces.bind(Promise),
  HTTP_METHODS = {
    post  : 'POST',
    put   : 'PUT',
    patch : 'PATCH',
    head  : 'HEAD',
    del   : 'DELETE',
    get   : 'GET'
  },
  reqMethods = [
    'get', 'head', 'post', 'put',
    'patch', 'del', 'jar', 'cookie'
  ],
  defaultOptions = {
    error: true,
    method: 'GET'
  };

module.exports = (function wrapRequest(request, defaultOpts){
  reqMethods.forEach(function (method){
    HTTP[method] = HTTP_METHODS.hasOwnProperty(method)
                 ? wrapMethod(HTTP_METHODS[method])
                 : request[method].bind(request);
  });

  HTTP.defaults = setDefaults;
  HTTP.onPossiblyUnhandledRejection = onPossiblyUnhandledRejection;
  HTTP.onUnhandledRejectionHandled = onUnhandledRejectionHandled;
  HTTP.longStackTraces = longStackTraces;
  Object.defineProperties(HTTP, {
    error: {
      value: require('./http.error'),
      enumerable: false,
      configurable: false,
      writable: false
    },
    request: {
      value: request,
      enumerable: false,
      configurable: false,
      writable: false
    },
    debug: {
      get: function() { return request.debug },
      set: function(v){ return request.debug = v },
      enumerable: true
    }
  });

  function HTTP(options, extra){
    var opts = setOptions(options, extra);
    opts.method = opts.method.toUpperCase();
    return new Promise(function HTTP_PROMISE(resolve, reject) {
      request(opts, function HTTP_RESPONSE(error, response, body) {
        if (error) {
          error.options = opts;
          error.statusCode = 0;
          error.title = 'Invalid Request';
          error.summary = 'failed to perform HTTP request';
          reject(error);
        } else if (opts.error && (response.statusCode === 0 || response.statusCode >= 400)) {
          var statusCode = response.statusCode;
          var HTTPErr = HTTP.error.hasOwnProperty(statusCode)
                      ? HTTP.error[statusCode]
                      : statusCode < 500
                        ? HTTP.error.client
                        : statusCode < 600
                          ? HTTP.error.server
                          : HTTP.error;
          var httpErr = new HTTPErr;
          httpErr.body = body;
          httpErr.options = opts;
          httpErr.response = response;
          httpErr.statusCode = statusCode;
          Object.defineProperty(httpErr, 'response', {
            value: response,
            enumerable: false,
            configurable: false,
            writable: false
          });
          reject(httpErr);
        } else {
          if (typeof opts.transform === 'function') {
            body = opts.transform(response, body);
          }
          if (!opts.resolve) {
            resolve([response, body]);
          } else if (opts.resolve === 'body') {
            resolve(body);
          } else if (opts.resolve === 'response') {
            resolve(response);
          } else if (Array.isArray(opts.resolve)
                  && opts.resolve.length === 2
                  && opts.resolve[0] === 'body'
                  && opts.resolve[1] === 'response') {
            resolve([body, response]);
          } else {
            resolve([response, body]);
          }
        }
      });
    });
  }

  function wrapMethod(method){
    return function HTTP_METHOD(options, extra){
      var opts = setOptions(options, extra, method);
      return HTTP(opts);
    }
  }

  function setDefaults(defaults){
    var current = assign({}, defaultOpts);
    return wrapRequest(
      request.defaults(defaults),
      assign(current, defaults)
    );
  }

  function setOptions(options, extra, method){
    var opts = assign(assign({}, defaultOpts), options);
    if (typeof options === 'string') {
      opts = assign(opts, extra);
      opts.uri = options;
    }
    opts.method = method || opts.method;
    return opts;
  }

  return HTTP;
})(require('request'), defaultOptions);

function assign(target, extension){ /*eslint-disable curly*/
  if (typeof extension === 'object' && extension !== null)
    for (var k in extension)
      if (extension.hasOwnProperty(k))
        target[k] = extension[k];
  return target;
}
