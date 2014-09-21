# HTTP as Promised — Promisified HTTP client.

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

Using [bluebird][bluebird] and [create-error][create-error] to make [request][request] easier to use. The most notible difference between this library and simply "promisifying" the request module is that this library will automatically reject the promise with an `HTTPError` if the response idicates an HTTP error (e.g. `response.statusCode >= 400`). HTTP as Promised supports all the same [options you'd pass to request](https://github.com/mikeal/request/blob/master/README.md#requestoptions-callback) as well as all of [request's convenience methods](https://github.com/mikeal/request/blob/master/README.md#convenience-methods).

## Super simple to use. Promise.

HTTP as Promised is designed to be the simplest way possible to make http calls. It supports HTTPS and follows redirects by default.

```javascript
var request = require('http-as-promised');
request('http://www.google.com').spread(function (response, body){
  console.log(body) // HTTP request was successful
}).catch(function (error){
  console.error(error) // HTTP request was unsuccessful
})
```

## Options

In addition to [all of the options](https://www.npmjs.org/package/request#request-options-callback-) that [request][request] accepts, there are two options specific to HTTP as Promised:

* **`resolve`** - Indicates the fulfillment value with which you want the HTTP promise to be resolve. Accepts a string or array of strings. Possible values: 

  * **`'body'`** - This is probably the one that is going to be the most useful setting for developers looking for a simple interface. Using this means you can easily pass the promises around and know that the fulfillment value is just going to be the `body` object.
  * **`'response'`** - This will resolve the promise with just the `response` object.
  * **`['body', 'response']`** - This swaps the ordering of the resolved array so that the "body" comes before the "response" object in the resolved array.
  * **`['response', 'body']`** *(default)* - By default HTTP as Promised will resolve promises with an array containing the `response` ([`http.IncomingMessage`](http://nodejs.org/api/http.html#http_http_incomingmessage) object) followed by the response `body` (`String`, `Buffer`, or JSON object if the `json` option is supplied). This means that for simple access to the `body` you would probably want to use [`.spread()`](https://github.com/petkaantonov/bluebird/blob/master/API.md#spreadfunction-fulfilledhandler--function-rejectedhandler----promise) instead of [`.then()`](https://github.com/petkaantonov/bluebird/blob/master/API.md#thenfunction-fulfilledhandler--function-rejectedhandler----promise) as seen in the example above.
* **`error`** - If set to `false` HTTP as Promised will no longer reject the response with an `HTTPError` based on the its HTTP status code. Defaults to `true`. See below.

## HTTP Errors

HTTP as Promised exposes a custom `HTTPError` constructor which is extended from the global `Error` constructor. The `HTTPError` constructor also exposes more specific types of `HTTPError` constructors both for ranges/types of HTTP Errors (4xx/client and 5xx/server) as well as status-code-specific HTTP errors (404, 418, 509, etc.). When instanciated, each of these constructors will be a fully-fledged `instanceof Error` with stack traces and everything. In addition to the `message` and `name` properties, instances of `HTTPError` will also include the following properties:

```
# type        // "ClientError"
# title       // "Not Found"
# summary     // "requested resource could not be found"
# range       // "4xx"
# statusCode  //  404
```

## Catching HTTP Errors

Since we're using Bluebird to construct our promises, catching and handling specific HTTP Errors is a breeze.

```javascript
var request = require('http-as-promised');
request('http://www.google.com')
.catch(request.error[404], function(e){
  // Handle 404 HTTP Errors
})
.catch(request.error.client, function(e){
  // Handle Client HTTP Errors
})
.catch(request.error['4xx'], function(e){
  // Handle HTTP Errors in the 400-499 range
})
.catch(request.error, function(e){
  // Handle any other HTTP Errors
})
```

[npm-image]: https://img.shields.io/npm/v/http-as-promised.svg?style=flat-square
[npm-url]: https://npmjs.org/package/http-as-promised
[travis-image]: http://img.shields.io/travis/jcready/http-as-promised.svg?style=flat-square
[travis-url]: https://travis-ci.org/jcready/http-as-promised
[coveralls-image]: http://img.shields.io/coveralls/jcready/http-as-promised.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/jcready/http-as-promised?branch=master

[bluebird]: https://www.npmjs.org/package/bluebird
[request]: https://www.npmjs.org/package/request
[create-error]: https://www.npmjs.org/package/create-error;