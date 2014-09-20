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
  describe('#defaults()', function () {
    var newhttp = http.defaults({
      method: 'POST',
      transform: function(response, body){
        return body.length;
      }
    });
    before(function(){
      nock.get('/defaults').reply(400);
      nock.post('/defaults').reply(200);
    });
    it('should return a wrapper around the original API', function(){
      expect(Object.keys(http)).to.be.eql(Object.keys(newhttp));
    });
    it('should default to the options passed in to it', function(){
      return newhttp(url+'/defaults');
    });
  });

  describe('Toggle debugging', function(){
    it('should be disabled by default', function(){
      expect(http.debug).to.not.be.true;
    });
    it('should enable debugging when set to true', function(){
      http.debug = true;
      expect(http.debug).to.be.true;
    });
    it('should disable debugging when set to false', function(){
      http.debug = false;
      expect(http.debug).to.be.false;
    });
  });

  describe('Error when creating request()', function(){
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
    it('should be an instance of HTTPServerError', function(){
      expect(error).to.not.be.an.instanceof(http.error.server);
    });
    it('should should have all the right properties', function(){
      expect(error.title).to.be.a('string');
      expect(error.summary).to.be.a('string');
      expect(error.options).to.be.an('object');
      expect(error.statusCode).to.be.a('number').that.is.not.within(100, 599);
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
