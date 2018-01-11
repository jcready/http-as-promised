'use strict';

var createError = require('create-error'),
    statusCodes = require('./http.statusCodes'),
    HTTPError = createError('HTTPError', {
      range: 'xxx',
      statusCode: 0,
      type: 'HTTPError',
      title: 'Unknown',
      message: 'Unknown',
      summary: 'an unknown HTTP error occured'
    }),
    error = {
      client: {
        range: '4xx',
        statusCode: 444.4,
        title: 'Client Error',
        summary: 'the request contains bad syntax or cannot be fulfilled'
      },
      server: {
        range: '5xx',
        statusCode: 555.5,
        title: 'Server Error',
        summary: 'the server failed to fulfill an apparently valid request'
      }
    };

for (var k in error) {
  var err = error[k];
  err.type = err.title.replace(' ', '');
  err.message = err.range + ' ' + err.title;
  var ErrorType = createError(HTTPError, 'HTTPError', err);
  HTTPError[k] = HTTPError[err.range] = ErrorType;
  ErrorType.prototype.toJSON = errorToJSON;
}

statusCodes.forEach(function (err){
  var range = (err.statusCode / 100 | 0) + 'xx';
  var type = range === '4xx' ? 'client' : 'server';
  err.range = range;
  err.type = error[type].title.replace(' ', '');
  err.message = err.statusCode + ' ' + err.title;
  HTTPError[err.statusCode] = createError(HTTPError[range], 'HTTPError', err);
  HTTPError[err.statusCode].prototype.toJSON = errorToJSON;
});

HTTPError[0] = HTTPError;
HTTPError.prototype.toJSON = errorToJSON;

function errorToJSON(){
  var error = {};
  for (var k in this) {
    error[k] = this[k];
  }
  return error;
}

module.exports = HTTPError;
