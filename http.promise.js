var Promise   = require('bluebird'),
  HTTP_ERROR  = require('./http.error'),
  HTTP_METHOD = {
    'post'  : 'POST',
    'put'   : 'PUT',
    'patch' : 'PATCH',
    'head'  : 'HEAD',
    'del'   : 'DELETE',
    'get'   : 'GET'
  };

module.exports = (function wrapRequest(request){
  function HTTP(options, extra){
    var opts = setOptions(options, extra);
    opts.method = opts.method.toUpperCase();
    return new Promise(function HTTP_PROMISE(resolve, reject) {
      request(opts, function HTTP_RESPONSE(error, response, body) {
        var statusCode = response.statusCode;
        if (error) {
          error.options = opts;
          reject(error);
        } else if (opts.error && statusCode >= 400) {
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
    return function(options, extra){
      var opts = setOptions(options, extra, method);
      return HTTP(opts);
    }
  }

  Object.keys(request).forEach(function (k){
    if (request.hasOwnProperty(k) && request[k])
      HTTP[k] = HTTP_METHOD.hasOwnProperty(k)
              ? wrapMethod(k)
              : request[k].bind(request);
  });

  HTTP.error = HTTP_ERROR;
  HTTP.defaults = function (defaults){
    return wrapRequest(request.defaults(defaults));
  };

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
    method: method || 'GET'
  }, options);
  if (typeof options === 'string') {
    opts.uri = options;
    opts = assign(opts, extra);
  }
  return opts;
}