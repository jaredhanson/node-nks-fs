/* global describe, it, expect */

var pkg = require('..');

describe('sks/rotator', function() {
  
  it('should export factory', function() {
    expect(pkg.Rotator).to.be.a('function');
  });

  it('should create', function() {
    var store = new pkg.MemoryKeyStore();
    var config = {};
    var generator = function(cb){cb('no');};
    var rotator = new pkg.Rotator(store,generator,config);
    expect(rotator).to.be.an('object');
    expect(rotator.start).to.be.a('function');
    expect(rotator.frequency).to.be.equal(86400*1000);
  });

  it('should rotate', function(done) {
    var store = new pkg.MemoryKeyStore();
    var config = {};
    var generator = function(cb){cb(false, 'test', 'key', 'cert');};
    var rotator = new pkg.Rotator(store,generator,config);
    rotator.rotate(function(err){
      expect(err).to.not.exist;
      expect(store._keys.length).to.be.equal(1);
      expect(store._keys[0].id).to.be.equal('test');
      done();
    });
  });
  
});
