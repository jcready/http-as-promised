# HTTP as Promised — Promisified HTTP client.

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

Since we're using Bluebird to construct our promises, catching and handling specific HTTP Errors is a breaze.

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

Everything from here on is simply copied from [Request's README](https://github.com/mikeal/request/blob/master/README.md).

---

## Options

The first argument can be either a `url` or an `options` object. The only required option is `uri`; all others are optional.

* `uri` || `url` - fully qualified uri or a parsed url object from `url.parse()`
* `qs` - object containing querystring values to be appended to the `uri`
* `method` - http method (default: `"GET"`)
* `headers` - http headers (default: `{}`)
* `body` - entity body for PATCH, POST and PUT requests. Must be a `Buffer` or `String`.
* `form` - when passed an object or a querystring, this sets `body` to a querystring representation of value, and adds `Content-type: application/x-www-form-urlencoded; charset=utf-8` header. When passed no options, a `FormData` instance is returned (and is piped to request).
* `auth` - A hash containing values `user` || `username`, `pass` || `password`, and `sendImmediately` (optional).  See documentation above.
* `json` - sets `body` but to JSON representation of value and adds `Content-type: application/json` header.  Additionally, parses the response body as JSON.
* `multipart` - (experimental) array of objects which contains their own headers and `body` attribute. Sends `multipart/related` request. See example below.
* `followRedirect` - follow HTTP 3xx responses as redirects (default: `true`). This property can also be implemented as function which gets `response` object as a single argument and should return `true` if redirects should continue or `false` otherwise.
* `followAllRedirects` - follow non-GET HTTP 3xx responses as redirects (default: `false`)
* `maxRedirects` - the maximum number of redirects to follow (default: `10`)
* `encoding` - Encoding to be used on `setEncoding` of response data. If `null`, the `body` is returned as a `Buffer`.
* `pool` - A hash object containing the agents for these requests. If omitted, the request will use the global pool (which is set to node's default `maxSockets`)
* `pool.maxSockets` - Integer containing the maximum amount of sockets in the pool.
* `timeout` - Integer containing the number of milliseconds to wait for a request to respond before aborting the request
* `proxy` - An HTTP proxy to be used. Supports proxy Auth with Basic Auth, identical to support for the `url` parameter (by embedding the auth info in the `uri`)
* `oauth` - Options for OAuth HMAC-SHA1 signing. See documentation above.
* `hawk` - Options for [Hawk signing](https://github.com/hueniverse/hawk). The `credentials` key must contain the necessary signing info, [see hawk docs for details](https://github.com/hueniverse/hawk#usage-example).
* `strictSSL` - If `true`, requires SSL certificates be valid. **Note:** to use your own certificate authority, you need to specify an agent that was created with that CA as an option.
* `jar` - If `true` and `tough-cookie` is installed, remember cookies for future use (or define your custom cookie jar; see examples section)
* `aws` - `object` containing AWS signing information. Should have the properties `key`, `secret`. Also requires the property `bucket`, unless you’re specifying your `bucket` as part of the path, or the request doesn’t use a bucket (i.e. GET Services)
* `httpSignature` - Options for the [HTTP Signature Scheme](https://github.com/joyent/node-http-signature/blob/master/http_signing.md) using [Joyent's library](https://github.com/joyent/node-http-signature). The `keyId` and `key` properties must be specified. See the docs for other options.
* `localAddress` - Local interface to bind for network connections.
* `gzip` - If `true`, add an `Accept-Encoding` header to request compressed content encodings from the server (if not already present) and decode supported content encodings in the response.
* `tunnel` - If `true`, then *always* use a tunneling proxy.  If
  `false` (default), then tunneling will only be used if the
  destination is `https`, or if a previous request in the redirect
  chain used a tunneling proxy.
* `proxyHeaderWhiteList` - A whitelist of headers to send to a
  tunneling proxy.

## Convenience methods

There are also shorthand methods for different HTTP METHODs and some other conveniences.

### request.defaults(options)

This method returns a wrapper around the normal request API that defaults to whatever options you pass in to it.

**Note:** You can call `.defaults()` on the wrapper that is returned from `request.defaults` to add/override defaults that were previously defaulted. 

For example:
```javascript
//requests using baseRequest() will set the 'x-token' header
var baseRequest = request.defaults({
  headers: {x-token: 'my-token'}
})

//requests using specialRequest() will include the 'x-token' header set in
//baseRequest and will also include the 'special' header
var specialRequest = baseRequest.defaults({
  headers: {special: 'special value'}
})
```

### request.put

Same as `request()`, but defaults to `method: "PUT"`.

```javascript
request.put(url)
```

### request.patch

Same as `request()`, but defaults to `method: "PATCH"`.

```javascript
request.patch(url)
```

### request.post

Same as `request()`, but defaults to `method: "POST"`.

```javascript
request.post(url)
```

### request.head

Same as request() but defaults to `method: "HEAD"`.

```javascript
request.head(url)
```

### request.del

Same as `request()`, but defaults to `method: "DELETE"`.

```javascript
request.del(url)
```

### request.get

Same as `request()` (for uniformity).

```javascript
request.get(url)
```
### request.cookie

Function that creates a new cookie.

```javascript
request.cookie('cookie_string_here')
```
### request.jar

Function that creates a new cookie jar.

```javascript
request.jar()
```

## Debugging

There are at least three ways to debug the operation of `request`:

1. Launch the node process like `NODE_DEBUG=request node script.js`
   (`lib,request,otherlib` works too).

2. Set `require('request').debug = true` at any time (this does the same thing
   as #1).

3. Use the [request-debug module](https://github.com/nylen/request-debug) to
   view request and response headers and bodies.
