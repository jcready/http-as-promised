var createError = require('create-error'),
    HTTPError = createError('HTTPError', { status: 0 }),
    types = {
      'client': { title: 'ClientError', range: '4xx' },
      'server': { title: 'ServerError', range: '5xx' }
    },
    codes = [{
      summary: "request cannot be fulfilled due to bad syntax",
      title: "Bad Request",
      status: 400
    },{
      summary: "authentication is possible but has failed",
      title: "Unauthorized",
      status: 401
    },{
      summary: "payment required, reserved for future use",
      title: "Payment Required",
      status: 402
    },{
      summary: "server refuses to respond to request",
      title: "Forbidden",
      status: 403
    },{
      summary: "requested resource could not be found",
      title: "Not Found",
      status: 404
    },{
      summary: "request method not supported by that resource",
      title: "Method Not Allowed",
      status: 405
    },{
      summary: "content not acceptable according to the Accept headers",
      title: "Not Acceptable",
      status: 406
    },{
      summary: "client must first authenticate itself with the proxy",
      title: "Proxy Authentication Required",
      status: 407
    },{
      summary: "server timed out waiting for the request",
      title: "Request Timeout",
      status: 408
    },{
      summary: "request could not be processed because of conflict",
      title: "Conflict",
      status: 409
    },{
      summary: "resource is no longer available and will not be available again",
      title: "Gone",
      status: 410
    },{
      summary: "request did not specify the length of its content",
      title: "Length Required",
      status: 411
    },{
      summary: "server does not meet request preconditions",
      title: "Precondition Failed",
      status: 412
    },{
      summary: "request is larger than the server is willing or able to process",
      title: "Request Entity Too Large",
      status: 413
    },{
      summary: "URI provided was too long for the server to process",
      title: "Request-URI Too Long",
      status: 414
    },{
      summary: "server does not support media type",
      title: "Unsupported Media Type",
      status: 415
    },{
      summary: "client has asked for unprovidable portion of the file",
      title: "Requested Range Not Satisfiable",
      status: 416
    },{
      summary: "server cannot meet requirements of Expect request-header field",
      title: "Expectation Failed",
      status: 417
    },{
      summary: "I'm a teapot",
      title: "I'm A Teapot",
      status: 418
    },{
      summary: "Twitter rate limiting",
      title: "Enhance Your Calm",
      status: 420
    },{
      summary: "request unable to be followed due to semantic errors",
      title: "Unprocessable Entity",
      status: 422
    },{
      summary: "resource that is being accessed is locked",
      title: "Locked",
      status: 423
    },{
      summary: "request failed due to failure of a previous request",
      title: "Failed Dependency",
      status: 424
    },{
      summary: "client should switch to a different protocol",
      title: "Upgrade Required",
      status: 426
    },{
      summary: "origin server requires the request to be conditional",
      title: "Precondition Required",
      status: 428
    },{
      summary: "user has sent too many requests in a given amount of time",
      title: "Too Many Requests",
      status: 429
    },{
      summary: "server is unwilling to process the request",
      title: "Request Header Fields Too Large",
      status: 431
    },{
      summary: "server returns no information and closes the connection",
      title: "No Response",
      status: 444
    },{
      summary: "request should be retried after performing action",
      title: "Retry With",
      status: 449
    },{
      summary: "Windows Parental Controls blocking access to webpage",
      title: "Blocked By Windows Parental Controls",
      status: 450
    },{
      summary: "the server cannot reach the client's mailbox",
      title: "Wrong Exchange Server",
      status: 451
    },{
      summary: "connection closed by client while HTTP server is processing",
      title: "Client Closed Request",
      status: 499
    },{
      summary: "generic error message",
      title: "Internal Server Error",
      status: 500
    },{
      summary: "server does not recognise method or lacks ability to fulfill",
      title: "Not Implemented",
      status: 501
    },{
      summary: "server received an invalid response from upstream server",
      title: "Bad Gateway",
      status: 502
    },{
      summary: "server is currently unavailable",
      title: "Service Unavailable",
      status: 503
    },{
      summary: "gateway did not receive response from upstream server",
      title: "Gateway Timeout",
      status: 504
    },{
      summary: "server does not support the HTTP protocol version",
      title: "HTTP Version Not Supported",
      status: 505
    },{
      summary: "content negotiation for the request results in a circular reference",
      title: "Variant Also Negotiates",
      status: 506
    },{
      summary: "server is unable to store the representation",
      title: "Insufficient Storage",
      status: 507
    },{
      summary: "server detected an infinite loop while processing the request",
      title: "Loop Detected",
      status: 508
    },{
      summary: "bandwidth limit exceeded",
      title: "Bandwidth Limit Exceeded",
      status: 509
    },{
      summary: "further extensions to the request are required",
      title: "Not Extended",
      status: 510
    },{
      summary: "client needs to authenticate to gain network access",
      title: "Network Authentication Required",
      status: 511
    },{
      summary: "network read timeout behind the proxy",
      title: "Network Read Timeout",
      status: 598
    },{
      summary: "network connect timeout behind the proxy",
      title: "Network Connect Timeout",
      status: 599
    }];

for (var type in types) {
  if (types.hasOwnProperty(type)) {
    var error = createError(HTTPError, 'HTTP'+types[type].title);
    HTTPError[type] = HTTPError[types[type].range] = error;
    console.log(types[type].range);
    HTTPError[types[type].range.toUpperCase()] = error;
    HTTPError[type].prototype.type = types[type].title.toUpperCase;
  }
}

HTTPError.prototype.toJSON = function(){
  var error = {};
  for (var k in this)
    if (k !== 'response')
      error[k] = this[k];
  return error;
};

codes.forEach(function (error){
  var type = (error.status / 100 | 0) + 'xx';
  error.message = error.status + ' ' + error.title;
  HTTPError[error.status] = createError(HTTPError[type], 'HTTPError', error);
  HTTPError[error.status].prototype.toJSON = function(){
    var error = {};
    for (var k in this)
      if (k !== 'response')
        error[k] = this[k];
    return error;
  };
});

module.exports = HTTPError;