# HTTP as Promised — Promisified HTTP client.

[![NPM Version](https://img.shields.io/npm/v/http-as-promised.svg?style=flat)](https://npmjs.org/package/http-as-promised)
[![Build Status](https://travis-ci.org/jcready/http-as-promised.svg?branch=master)](https://travis-ci.org/jcready/http-as-promised)
[![Coverage Status](https://coveralls.io/repos/jcready/http-as-promised/badge.png?branch=master)](https://coveralls.io/r/jcready/http-as-promised?branch=master)

Using [Bluebird](https://github.com/petkaantonov/bluebird) and [Create Error](https://github.com/tgriesser/create-error) to make [Request](https://github.com/mikeal/request) easier to use. The most notible difference between this library and simply "promisifying" the request module is that this library will automatically reject the promise with an `HTTPError` if the response status code is an HTTP error status code (e.g. `response.statusCode >= 400`).

## Super simple to use

HTTP as Promised is designed to be the simplest way possible to make http calls. It supports HTTPS and follows redirects by default.

```javascript
var request = require('http-as-promised');
request('http://www.google.com').spread(function(response, body){
  console.log(body) // HTTP request was successful
}).catch(function (error){
  console.error(error) // HTTP request was unsuccessful
})
```

## HTTP Errors

HTTP as Promised exposes a custom `HTTPError` constructor which is extended from the global `Error` constructor. The `HTTPError` constructor also exposes more specific types of `HTTPError` constructors both for ranges/types of HTTP Errors (4xx/client and 5xx/server) as well as status-code-specific HTTP errors (404, 418, 509, etc.). When instanciated, each of these constructors will be a fully-fledged `instanceof Error` with stack traces and everything. In addition to the `message` and `name` properties, instances of `HTTPError` will also include the following properties:

* `statusCode` (e.g. `404`)
* `title` (e.g. `"Not Found"`)
* `summary` (e.g. `"requested resource could not be found"`)
* `type` (e.g. `"ClientError"`)
* `range` (e.g. `"4xx"`)

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

## Consistency with Request

HTTP as Promised supports all the same [options you'd pass to Request](https://github.com/mikeal/request/blob/master/README.md#requestoptions-callback) as well as all of [Request's convenience methods](https://github.com/mikeal/request/blob/master/README.md#convenience-methods).
