/*jslint nodejs: true, expr: true*/
/*global describe: true, it: true, before: true*/

process.env.NODE_ENV = 'test';

var chai  = require('chai'),
  url     = 'http://thisurlwillneverexisthttpaspromised.com',
  nock    = require('nock')(url),
  sinon   = require('sinon'),
  Promise = require('bluebird'),
  http    = require('../http.promise'),
  methods = {
    post  : 'POST',
    put   : 'PUT',
    patch : 'PATCH',
    head  : 'HEAD',
    del   : 'DELETE',
    get   : 'GET'
  };

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
var expect = chai.expect;
Promise.onPossiblyUnhandledRejection(function(){});

describe('HTTP Request', function() {
  describe('Invalid Request Error', function(){
    var error = null;
    before(function (done){
      http('invalid').catch(function (e){
        error = e;
        done();
      });
    });
    it('should be an instance of Error', function(){
      expect(error).to.be.an.instanceof(Error);
    });
    it('should not be an instance of HTTPError', function(){
      expect(error).to.not.be.an.instanceof(http.error);
    });
    it('should have a title, summary, statusCode, and options', function(){
      expect(error.summary).to.be.a('string');
      expect(error.options).to.be.an('object');
      expect(error.statusCode).to.be.a('number').that.is.not.within(100, 599);
    });
  });

  describe('@debug', function(){
    it('should be disabled by default', function(){
      expect(http.debug).to.not.be.true;
    });
    it('should enable debugging when set to true', function(){
      http.debug = true;
      expect(http.request.debug).to.be.true;
    });
    it('should disable debugging when set to false', function(){
      http.debug = false;
      expect(http.request.debug).to.be.false;
    });
  });

  describe('#defaults()', function () {
    var newhttp = null;
    before(function(){
      nock.get('/defaults').reply(404);
      nock.post('/defaults').reply(202);
      nock.put('/').reply(200, 'Hello World!');
      nock.delete('/').reply(204);
      nock.get('/').reply(208)
    });
    it('should return a wrapper around the original API', function(){
      newhttp = http.defaults({
        method: 'POST',
        resolve: 'body',
        transform: function(response, body){
          return response.statusCode;
        }
      });
      expect(Object.keys(http)).to.be.eql(Object.keys(newhttp));
    });
    it('should default to the options passed in to it', function(){
      return expect(newhttp(url+'/defaults')).to.eventually.eql(202);
    });
    it('should allow you to override the defaults per-call', function(){
      var req = newhttp.put(url, { resolve: ['body', 'response'] });
      return expect(req).to.eventually.be.an('array').that.has.length(2);
    });
    it('should allow you to call #defaults() on the previously returned wrapper', function(){
      var datnewnew = newhttp.defaults({ method: 'DELETE', resolve: 'response' });
      return expect(datnewnew(url)).to.eventually.have.property('statusCode', 204);
    });
    it('should allow you to reset the defaults', function(){
      var datoldold = http.defaults({});
      return datoldold(url, { resolve: 'foobar' }).spread(function (response, body){
        expect(response).to.have.property('statusCode', 208);
      });
    });
  });

  for (var k in methods) {
    if (methods.hasOwnProperty(k)) {
      describe('#' + k + '()', function(){
        var req = null;
        before(function(){
          nock[k]('/'+k).reply(200);
          req = http[k](url+'/'+k);
        });
        it('should return a Promise', function(){
          expect(req).to.be.an.instanceof(Promise);
        });
        it('should perform a ' + methods[k] + ' request', function(){
          return expect(req).to.be.resolved;
        });
      });
    }
  }
});
