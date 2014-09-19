var Promise    = require('bluebird'),
  HTTP_ERROR   = require('./http.error'),
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
  ];

module.exports = (function wrapRequest(request){
  reqMethods.forEach(function (method){
    HTTP[method] = HTTP_METHODS.hasOwnProperty(method)
                 ? wrapMethod(method)
                 : request[method].bind(request);
  });

  HTTP.error = HTTP_ERROR;
  HTTP.defaults = setDefaults;
  Object.defineProperties(HTTP, {
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
        } else if (opts.error && response.statusCode >= 400) {
          var statusCode = response.statusCode;
          var HTTPErr = HTTP.error.hasOwnProperty(statusCode)
                      ? HTTP.error[statusCode]
                      : statusCode >= 500
                        ? HTTP.error.server
                        : HTTP.error.client
          var httpErr = new HTTPErr;
          httpErr.body = body;
          httpErr.options = opts;
          httpErr.response = response;
          reject(httpErr);
        } else if (typeof opts.transform === 'function') {
          resolve([response, opts.transform(response, body)]);
        } else {
          resolve([response, body]);
        }
      });
    });
  }

  function wrapMethod(method){
    return function HTTP_METHOD(options, extra){
      return HTTP(setOptions(options, extra, method));
    }
  }

  function setDefaults(defaults){
    return wrapRequest(request.defaults(defaults));
  }

  return HTTP;
})(require('request'));

function assign(target, extension){
  if (!target) return extension || {};
  if (typeof extension === 'object' && extension !== null)
    for (var k in extension)
      if (extension.hasOwnProperty(k))
        target[k] = extension[k];
  return target;
}

function setOptions(options, extra, method){
  var opts = assign({
    error: true,
    method: 'GET'
  }, options);
  if (typeof options === 'string') {
    opts.uri = options;
    opts = assign(opts, extra);
  }
  opts.method = method || opts.method;
  return opts;
}
