/* global describe, it, expect */

var pkg = require('../..');
var fs = require('fs');

describe('sks/store/fs', function() {
  
  it('should export factory', function() {
    expect(pkg.FSKeyStore).to.be.a('function');
  });

  it('should create a store', function() {
    var store = new pkg.FSKeyStore('/tmp');
    expect(store).to.be.an('object');
    expect(store.get).to.be.a('function');
    expect(store.store).to.be.a('function');
  });

  it('should store', function(done) {
    var store = new pkg.FSKeyStore('/tmp/sks');
    var rand = Math.random().toString();
    store.store(rand,'key','cert',function(err){
      // ugly, should be a better way to clean up
      fs.unlink('/tmp/sks/'+rand+'.pem');
      fs.unlink('/tmp/sks/public/'+rand+'.pem');
      expect(err).to.not.exist;
      done();
    })
  });

  it('get any key', function(done) {
    var store = new pkg.FSKeyStore('/tmp/sks');
    store.store('id','key','cert',function(err){
      store.get(function(err, id, key, meta){
        expect(err).to.not.exist;
        expect(key).to.be.equal('key');
        done();
      });
    })
  });

  it('get specific key', function(done) {
    var store = new pkg.FSKeyStore('/tmp/sks');
    store.store('id','key','cert',function(err){
      store.get('id',function(err, key, cert, meta){
        expect(err).to.not.exist;
        expect(key).to.be.equal('key');
        expect(cert).to.be.equal('cert');
        done();
      });
    })
  });

  it('empty store errors', function(done) {
    var store = new pkg.FSKeyStore('/tmp/sks');
    store.get(function(err, id, key, meta){
      expect(err.message).to.be.equal('No keys in keystore');
      done();
    });
  });

  it('unknown id errors', function(done) {
    var store = new pkg.FSKeyStore('/tmp/sks');
    store.store('id','key','cert',function(err){
      store.get('id2',function(err, key, meta){
        expect(err.message).to.be.equal('key not found at /tmp/sks/id2.pem');
        done();
      });
    })
  });

});
