# HTTP as Promised — Promisified HTTP client.

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Code Climate][codeclimate-image]][codeclimate-url]
[![Dependencies][dependencies-image]][dependencies-url]

Using [bluebird][bluebird] and [create-error][create-error] to make [request][request] easier to use. The most notible difference between this library and simply "promisifying" the request module is that this library will automatically reject the promise with an `HTTPError` if the response idicates an HTTP error (e.g. `response.statusCode >= 400`). HTTP as Promised supports all the same [options you'd pass to request](https://github.com/mikeal/request/blob/master/README.md#requestoptions-callback) as well as all of [request's convenience methods](https://github.com/mikeal/request/blob/master/README.md#convenience-methods).

## Super simple to use. Promise.

HTTP as Promised is designed to be the simplest way possible to make http calls. It supports HTTPS and follows redirects by default.

```javascript
var $http = require('http-as-promised');

$http('https://www.github.com')
  .spread(function (response, body){
    console.log(body) // HTTP request was successful
  })
  .catch(function (error){
    console.error(error) // HTTP request was unsuccessful
  });
```

## Options

In addition to [all of the options](https://www.npmjs.org/package/request#request-options-callback-) that the [request module][request] accepts, there are two options specific to HTTP as Promised:

* **`error`** - If set to `false` HTTP as Promised will no longer reject the response with an [`HTTPError`](#http-errors) based on the its HTTP status code. Defaults to `true`. [See below](#http-errors).

* **`resolve`** - Indicates the fulfillment value with which you want the HTTP promise to be resolved. Accepts a string or array of strings. Possible values: 

  * **`['response', 'body']`** *(default)* - By default HTTP as Promised will resolve promises with an array containing the `response` ([`http.IncomingMessage`](http://nodejs.org/api/http.html#http_http_incomingmessage) object) followed by the response `body` (`String`, `Buffer`, or JSON object if the `json` option is supplied). This means that for simple access to the `body` you would probably want to use [`.spread()`](https://github.com/petkaantonov/bluebird/blob/master/API.md#spreadfunction-fulfilledhandler--function-rejectedhandler----promise) instead of [`.then()`](https://github.com/petkaantonov/bluebird/blob/master/API.md#thenfunction-fulfilledhandler--function-rejectedhandler----promise) as seen in the example above.
  * **`['body', 'response']`** - This swaps the ordering of the resolved array so that the "body" comes before the "response" object in the resolved array.
  * **`'response'`** - This will resolve the promise with just the `response` object
  * **`'body'`** - This is probably the one that is going to be the most useful setting for developers looking for a simple interface. Using this means you can easily pass the promises around and know that the fulfillment value is just going to be the `body` object.
 
    ```javascript
    var url = 'https://www.npm.org',
        nock = require('nock')(url);
        
    nock.post('/').reply(200, 'Hello World!');
    $http.post(url, { resolve: 'body' }).then(console.log);
    ```
     
    ```
    "Hello World"
    ```

## HTTP Errors

HTTP as Promised exposes a custom `HTTPError` constructor which is extended from the global `Error` constructor. The `HTTPError` constructor also exposes more specific types of `HTTPError` constructors both for ranges/types of HTTP Errors (4xx/client and 5xx/server) as well as status-code-specific HTTP errors (404, 418, 509, etc.). When instanciated, each of these constructors will be a fully-fledged `instanceof Error` with stack traces and everything. In addition to the `message` and `name` properties, instances of `HTTPError` will also include additional HTTP specific information:

```javascript
var $http = require('http-as-promised'),
    err =  new $http.error[505];

console.log('Error:            ', err instanceof Error);
console.log('HTTP Error:       ', err instanceof $http.error);
console.log('HTTP 5xx Error:   ', err instanceof $http.error['5xx']);
console.log('HTTP Server Error:', err instanceof $http.error['server']);
throw err;
```

```
Error:             true
HTTP Error:        true
HTTP 5xx Error:    true
HTTP Server Error: true
HTTPError: 505 HTTP Version Not Supported
    at Object.<anonymous> (/test.js:2:7)
    at Module._compile (module.js:456:26)
    at Object.Module._extensions..js (module.js:474:10)
    at Module.load (module.js:356:32)
    at Function.Module._load (module.js:312:12)
    at Function.Module.runMain (module.js:497:10)
    at startup (node.js:119:16)
    at node.js:906:3
{ [HTTPError: 505 HTTP Version Not Supported]
  statusCode: 505,
  title: 'HTTP Version Not Supported',
  summary: 'server does not support the HTTP protocol version',
  range: '5xx',
  type: 'ServerError',
  message: '505 HTTP Version Not Supported' }
```

When an `HTTPError` is the reason why a response was rejected by HTTP as Promised, it will include some additional properties:

```javascript
var $http = require('http-as-promised'),
    url = 'https://www.npm.org',
    nock = require('nock')(url);

nock.get('/bogus/url').reply(404, 'Cannot find /bogus/url');
$http(url+'/bogus/url').catch(console.log);
```

```
{ [HTTPError: 404 Not Found]
  statusCode: 404,
  title: 'Not Found',
  summary: 'requested resource could not be found',
  range: '4xx',
  type: 'ClientError',
  message: '404 Not Found',
  body: 'Cannot find /bogus/url',
  response: [Object: IncomingMessage]
  options:
   { error: true,
     method: 'GET',
     uri: 'https://www.npm.org/bogus/url' } }
```

## Catching HTTP Errors

Since we're using Bluebird to construct our promises, handling specific HTTP Errors is a breeze using [`.catch()`](https://github.com/petkaantonov/bluebird/blob/master/API.md#catchfunction-errorclassfunction-predicate-function-handler---promise):

```javascript
var $http = require('http-as-promised'),
    url = 'https://stackoverflow.com',
    nock = require('nock')(url);

nock.get('/teapot').reply(418);
$http(url+'/teapot')
  .catch($http.error[418], function (e){
    // Catch 418 I'm A Teapot HTTP Errors
  })
  .catch($http.error.client, function (e){
    // Catch any remaining Client HTTP Errors
  })
  .catch($http.error['4xx'], function (e){
    // An alias for $http.error.client
  })
  .catch($http.error, function (e){
    // Catch any other HTTP Errors that weren't already caught
  })
  .catch(function (e){
    // Catch any other type of Error
  })
```

For better stack traces you can enable bluebird's [`longStackTraces`](https://github.com/petkaantonov/bluebird/blob/master/API.md#promiselongstacktraces---void), as well as bluebird's other [error management configuration](https://github.com/petkaantonov/bluebird/blob/master/API.md#error-management-configuration) methods by calling them on HTTP as Promised:

```javascript
$http.longStackTraces();
nock.get('/').reply(420);
denialOfService(url).catch(err);

function denialOfService(url){
  return $http(url);
}
```

```
HTTPError: 420 Enhance Your Calm
    at Request.HTTP_RESPONSE [as _callback] (http.promise.js:73:25)
    at Request.self.callback (node_modules/request/request.js:237:22)
    at Request.EventEmitter.emit (events.js:98:17)
    at Request.<anonymous> (node_modules/request/request.js:1146:14)
    at Request.EventEmitter.emit (events.js:117:20)
    at OutgoingMessage.<anonymous> (node_modules/request/request.js:1097:12)
    at OutgoingMessage.EventEmitter.emit (events.js:117:20)
    at node_modules/nock/lib/request_overrider.js:419:18
    at Object._onImmediate (node_modules/nock/lib/request_overrider.js:438:9)
From previous event:
    at new Promise (node_modules/bluebird/js/main/promise.js:82:37)
    at HTTP (http.promise.js:56:12)
    at denialOfService (test.js:12:10)
    at Object.<anonymous> (test.js:9:1)
    at Module._compile (module.js:456:26)
    at Object.Module._extensions..js (module.js:474:10)
    at Module.load (module.js:356:32)
    at Function.Module._load (module.js:312:12)
 { [HTTPError: 420 Enhance Your Calm]
   statusCode: 420,
   title: 'Enhance Your Calm',
   summary: 'Twitter rate limiting',
   range: '4xx',
   type: 'ClientError',
   message: '420 Enhance Your Calm',
   body: '',
   options: { error: true, method: 'GET', uri: 'https://twitter.com' } }
```

## For those times you really just need request

You can directly access the request module used by the HTTP as Promised module:

```javascript
var $http = require('http-as-promised');
$http.request('http://google.com/doodle.png').pipe(fs.createWriteStream('doodle.png'))
```

[npm-image]: https://img.shields.io/npm/v/http-as-promised.svg?style=flat-square
[npm-url]: https://npmjs.org/package/http-as-promised
[travis-image]: http://img.shields.io/travis/jcready/http-as-promised.svg?style=flat-square
[travis-url]: https://travis-ci.org/jcready/http-as-promised
[coveralls-image]: http://img.shields.io/coveralls/jcready/http-as-promised.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/jcready/http-as-promised?branch=master
[dependencies-image]: https://img.shields.io/david/jcready/http-as-promised.svg?style=flat-square
[dependencies-url]: https://david-dm.org/jcready/http-as-promised
[codeclimate-image]: https://img.shields.io/codeclimate/github/jcready/http-as-promised.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/jcready/http-as-promised

[bluebird]: https://www.npmjs.org/package/bluebird
[request]: https://www.npmjs.org/package/request
[create-error]: https://www.npmjs.org/package/create-error;
