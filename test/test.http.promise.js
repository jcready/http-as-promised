/*jslint nodejs: true, expr: true*/
/*global describe: true, it: true, before: true*/

process.env.NODE_ENV = 'test';

var chai      = require('chai'),
  url         = 'https://www.npm.org',
  nock        = require('nock')(url),
  Promise     = require('bluebird'),
  http        = require('../http.promise'),
  statusCodes = require('../http.statusCodes');

chai.use(require('chai-as-promised'));
var expect = chai.expect;
Promise.onPossiblyUnhandledRejection(function(){});

describe('HTTP as Promised', function() {
  var httpError = new HTTPError;
  var clientHttpErrors = [],  serverHttpErrors = [];
  var clientHttpErrorPromises = []; serverHttpErrorPromises = [];
  statusCodes.forEach(function (status){
    if (status.statusCode < 500) {
      nock.get('/').reply(status.statusCode);
      clientHttpErrorPromises.push(http(url));
      clientHttpErrors.push(new http.error[status.statusCode]);
    } else {
      nock.get('/').reply(status.statusCode);
      serverHttpErrorPromises.push(http(url));
      serverHttpErrors.push(new http.error[status.statusCode]);
    }
  });

  before(function(){
    return Promise.settle(clientHttpErrorPromises.concat(serverHttpErrorPromises));
  });

  describe('HTTP Client Rejection', function () {
    clientHttpErrorPromises.forEach(function (req, i){
      describe('HTTP ' + clientHttpErrors[i].message, function () {
        var error = null;
        before(function (done){
          req.catch(function (e){
            error = e;
            done();
          });
        });
        it('should be an instance of Error', function(){
          expect(error).to.be.an.instanceof(Error);
        });
        it('should be an instance of HTTPError', function(){
          expect(error).to.be.an.instanceof(http.error);
        });
        it('should be an instance of HTTPClientError', function(){
          expect(error).to.be.an.instanceof(http.error.client);
        });
        it('should should have all the right properties', function(){
          expect(error).to.have.property('statusCode')
            .that.is.a('number')
            .that.is.within(400, 499);
          expect(error).to.have.property('range')
            .that.is.eql('4xx');
          expect(error).to.have.property('type')
            .that.is.a('string');
          expect(error).to.have.property('title')
            .that.is.a('string');
          expect(error).to.have.property('summary')
            .that.is.a('string')
        });
      });
    });
  });

  describe('HTTP Server Rejection', function () {
    serverHttpErrorPromises.forEach(function (req, i){
      describe('HTTP ' + serverHttpErrors[i].message, function () {
        var error = null;
        before(function (done){
          req.catch(function (e){
            error = e;
            done();
          });
        });
        it('should be an instance of Error', function(){
          expect(error).to.be.an.instanceof(Error);
        });
        it('should be an instance of HTTPError', function(){
          expect(error).to.be.an.instanceof(http.error);
        });
        it('should be an instance of HTTPServerError', function(){
          expect(error).to.be.an.instanceof(http.error.server);
        });
        it('should should have all the right properties', function(){
          expect(error).to.have.property('statusCode')
            .that.is.a('number')
            .that.is.within(500, 599);
          expect(error).to.have.property('range')
            .that.is.eql('5xx');
          expect(error).to.have.property('type')
            .that.is.a('string');
          expect(error).to.have.property('title')
            .that.is.a('string');
          expect(error).to.have.property('summary')
            .that.is.a('string')
        });
      });
    });
  });
});
