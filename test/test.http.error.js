'use strict';

process.env.NODE_ENV = 'test';

var chai      = require('chai'),
  url         = 'http://thisurlwillneverexisthttpaspromised.com',
  nock        = require('nock')(url),
  Promise     = require('bluebird'),
  http        = require('../http.promise'),
  statusCodes = require('../http.statusCodes');

var expect = chai.expect;
Promise.onPossiblyUnhandledRejection(function(){});

describe('HTTP Error', function() {
  var clientHttpErrors = [],
      serverHttpErrors = [],
      clientHttpErrorPromises = [],
      serverHttpErrorPromises = [];
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
    return Promise.all(clientHttpErrorPromises.concat(serverHttpErrorPromises).map(function (promise) {
      return promise.reflect()
    }));
  });

  describe('HTTP Client Rejection', function () {
    clientHttpErrorPromises.forEach(function (req, i){
      var err = clientHttpErrors[i];
      describe('@error[' + err.statusCode + '] - ' + err.title, function(){
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
        it('should have a type, title, summary, range, statusCode, and options', function(){
          expect(error.type).to.be.a('string');
          expect(error.title).to.be.a('string');
          expect(error.summary).to.be.a('string');
          expect(error.options).to.be.an('object');
          expect(error.range).to.be.a('string').that.is.eql('4xx');
          expect(error.statusCode).to.be.a('number').that.is.within(400, 499);
        });
      });
    });
  });

  describe('HTTP Server Rejection', function(){
    serverHttpErrorPromises.forEach(function (req, i){
      var err = serverHttpErrors[i];
      describe('@error[' + err.statusCode + '] - ' + err.title, function () {
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
        it('should have a type, title, summary, range, statusCode, and options', function(){
          expect(error.type).to.be.a('string');
          expect(error.title).to.be.a('string');
          expect(error.summary).to.be.a('string');
          expect(error.options).to.be.an('object');
          expect(error.range).to.be.a('string').that.is.eql('5xx');
          expect(error.statusCode).to.be.a('number').that.is.within(500, 599);
        });
      });
    });
  });

  describe('Non-Standard HTTP Errors', function(){
    var error = {
      client: {},
      server: {},
      unknown: {}
    };
    var keys = ['client', 'server', 'unknown'];
    before(function (done){
      nock.get('/').reply(456);
      nock.get('/').reply(567);
      nock.get('/').reply(678);
      http(url).catch(function (c){
        error.client = c;
        http(url).catch(function (s){
          error.server = s;
          http(url, new http.error).catch(function (u){
            error.unknown = u;
            done();
          });
        });
      });
    });
    it('should be an instance of Error', function(){
      keys.forEach(function (type){
        expect(error[type]).to.be.an.instanceof(Error);
      });
    });
    it('should be an instance of HTTPError', function(){
      keys.forEach(function (type){
        expect(error[type]).to.be.an.instanceof(http.error);
      });
    });
    it('should be an instance of HTTPTypeError', function(){
      keys.forEach(function (type){
        if (type !== 'unknown') {
          expect(error[type]).to.be.an.instanceof(http.error[type]);
        }
      });
    });
    it('should have a type, title, summary, statusCode, and options', function(){
      keys.forEach(function (type){
        var err = error[type];
        var hasStatus = expect(err.statusCode).that.is.a('number');
        switch (type) {
        case 'client':
          expect(err.range).to.be.a('string').that.is.eql('4xx');
          hasStatus.that.is.within(400, 499); break;
        case 'server':
          expect(err.range).to.be.a('string').that.is.eql('5xx');
          hasStatus.that.is.within(500, 599); break;
        default:
          hasStatus.that.is.not.within(100, 599);
        }
        expect(err.type).to.be.a('string');
        expect(err.title).to.be.a('string');
        expect(err.summary).to.be.a('string');
        expect(err.options).to.be.an('object');
      });
    });
  });

  describe('JSON.stringify()-ed HTTP Errors', function(){
    var error = null;
    before(function (done){
      clientHttpErrorPromises[0].catch(function (e){
        error = e;
        done();
      });
    });
    it('should not include the response IncomingMessage object', function(){
      var json = JSON.stringify(error);
      var parsed = JSON.parse(json);
      expect(error).to.have.property('response');
      expect(parsed).to.not.have.property('response');
    });
  });
});
