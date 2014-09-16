/* global describe, it, expect */

var pkg = require('../..');

describe('sks/store/memory', function() {
  
  it('should export factory', function() {
    expect(pkg.MemoryKeyStore).to.be.a('function');
  });

  it('should create a store', function() {
    var store = new pkg.MemoryKeyStore();
    expect(store).to.be.an('object');
    expect(store.get).to.be.a('function');
    expect(store.store).to.be.a('function');
  });

  it('should store', function(done) {
    var store = new pkg.MemoryKeyStore();
    store.store('id','key','cert',function(err){
      expect(err).to.not.exist;
      done();
    })
  });

  it('get any key', function(done) {
    var store = new pkg.MemoryKeyStore();
    store.store('id','key','cert',function(err){
      store.get(function(err, id, key, meta){
        expect(err).to.not.exist;
        expect(id).to.be.equal('id');
        expect(key).to.be.equal('key');
        done();
      });
    })
  });

  it('get specific key', function(done) {
    var store = new pkg.MemoryKeyStore();
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
    var store = new pkg.MemoryKeyStore();
    store.get(function(err, id, key, meta){
      expect(err.message).to.be.equal('No keys in keystore');
      done();
    });
  });

  it('unknown id errors', function(done) {
    var store = new pkg.MemoryKeyStore();
    store.store('id','key','cert',function(err){
      store.get('id2',function(err, key, meta){
        expect(err.message).to.be.equal('key not found: id2');
        done();
      });
    })
  });

});
