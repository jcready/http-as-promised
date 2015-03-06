/* http://httpstatus.es/
 *
 * Copyright (C) 2012 - 2014 Samuel Ryan (citricsquid)
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

module.exports = [{ /*eslint quotes: [2, "double"], comma-spacing: 0*/
  statusCode: 400,
  title: "Bad Request",
  summary: "request cannot be fulfilled due to bad syntax"
},{
  statusCode: 401,
  title: "Unauthorized",
  summary: "authentication is possible but has failed"
},{
  statusCode: 402,
  title: "Payment Required",
  summary: "payment required, reserved for future use"
},{
  statusCode: 403,
  title: "Forbidden",
  summary: "server refuses to respond to request"
},{
  statusCode: 404,
  title: "Not Found",
  summary: "requested resource could not be found"
},{
  statusCode: 405,
  title: "Method Not Allowed",
  summary: "request method not supported by that resource"
},{
  statusCode: 406,
  title: "Not Acceptable",
  summary: "content not acceptable according to the Accept headers"
},{
  statusCode: 407,
  title: "Proxy Authentication Required",
  summary: "client must first authenticate itself with the proxy"
},{
  statusCode: 408,
  title: "Request Timeout",
  summary: "server timed out waiting for the request"
},{
  statusCode: 409,
  title: "Conflict",
  summary: "request could not be processed because of conflict"
},{
  statusCode: 410,
  title: "Gone",
  summary: "resource is no longer available and will not be available again"
},{
  statusCode: 411,
  title: "Length Required",
  summary: "request did not specify the length of its content"
},{
  statusCode: 412,
  title: "Precondition Failed",
  summary: "server does not meet request preconditions"
},{
  statusCode: 413,
  title: "Request Entity Too Large",
  summary: "request is larger than the server is willing or able to process"
},{
  statusCode: 414,
  title: "Request-URI Too Long",
  summary: "URI provided was too long for the server to process"
},{
  statusCode: 415,
  title: "Unsupported Media Type",
  summary: "server does not support media type"
},{
  statusCode: 416,
  title: "Requested Range Not Satisfiable",
  summary: "client has asked for unprovidable portion of the file"
},{
  statusCode: 417,
  title: "Expectation Failed",
  summary: "server cannot meet requirements of Expect request-header field"
},{
  statusCode: 418,
  title: "I'm A Teapot",
  summary: "I'm a teapot"
},{
  statusCode: 420,
  title: "Enhance Your Calm",
  summary: "Twitter rate limiting"
},{
  statusCode: 422,
  title: "Unprocessable Entity",
  summary: "request unable to be followed due to semantic errors"
},{
  statusCode: 423,
  title: "Locked",
  summary: "resource that is being accessed is locked"
},{
  statusCode: 424,
  title: "Failed Dependency",
  summary: "request failed due to failure of a previous request"
},{
  statusCode: 426,
  title: "Upgrade Required",
  summary: "client should switch to a different protocol"
},{
  statusCode: 428,
  title: "Precondition Required",
  summary: "origin server requires the request to be conditional"
},{
  statusCode: 429,
  title: "Too Many Requests",
  summary: "user has sent too many requests in a given amount of time"
},{
  statusCode: 431,
  title: "Request Header Fields Too Large",
  summary: "server is unwilling to process the request"
},{
  statusCode: 444,
  title: "No Response",
  summary: "server returns no information and closes the connection"
},{
  statusCode: 449,
  title: "Retry With",
  summary: "request should be retried after performing action"
},{
  statusCode: 450,
  title: "Blocked By Windows Parental Controls",
  summary: "Windows Parental Controls blocking access to webpage"
},{
  statusCode: 451,
  title: "Wrong Exchange Server",
  summary: "the server cannot reach the client's mailbox"
},{
  statusCode: 499,
  title: "Client Closed Request",
  summary: "connection closed by client while HTTP server is processing"
},{
  statusCode: 500,
  title: "Internal Server Error",
  summary: "generic error message"
},{
  statusCode: 501,
  title: "Not Implemented",
  summary: "server does not recognise method or lacks ability to fulfill"
},{
  statusCode: 502,
  title: "Bad Gateway",
  summary: "server received an invalid response from upstream server"
},{
  statusCode: 503,
  title: "Service Unavailable",
  summary: "server is currently unavailable"
},{
  statusCode: 504,
  title: "Gateway Timeout",
  summary: "gateway did not receive response from upstream server"
},{
  statusCode: 505,
  title: "HTTP Version Not Supported",
  summary: "server does not support the HTTP protocol version"
},{
  statusCode: 506,
  title: "Variant Also Negotiates",
  summary: "content negotiation for the request results in a circular reference"
},{
  statusCode: 507,
  title: "Insufficient Storage",
  summary: "server is unable to store the representation"
},{
  statusCode: 508,
  title: "Loop Detected",
  summary: "server detected an infinite loop while processing the request"
},{
  statusCode: 509,
  title: "Bandwidth Limit Exceeded",
  summary: "bandwidth limit exceeded"
},{
  statusCode: 510,
  title: "Not Extended",
  summary: "further extensions to the request are required"
},{
  statusCode: 511,
  title: "Network Authentication Required",
  summary: "client needs to authenticate to gain network access"
},{
  statusCode: 598,
  title: "Network Read Timeout",
  summary: "network read timeout behind the proxy"
},{
  statusCode: 599,
  title: "Network Connect Timeout",
  summary: "network connect timeout behind the proxy"
}];
