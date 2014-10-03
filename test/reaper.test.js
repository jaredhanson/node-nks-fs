/*
 * Module Dependancies
 */

var Reaper = require('../lib/reaper')
  , Logger = require('./mocks/logger');

/*
 * Test Zone
 */
describe('sks/reaper', function () {
  it ('should export a function', function () {
    expect(Reaper).to.be.a('function');
  });
  it('should have a purge method', function () {
      var r = new Reaper({});
      expect(r.purge).to.be.a('function');
  });
  var kList = ['old', 'new'];
  describe('succesful purge', function () {
    var keystore = {};

    keystore.list = function (cb) {
      process.nextTick(function () {
        return cb(null, kList);
      });
    };

    keystore.get = function (key, cb) {
      process.nextTick(function() {
        if (key === 'old') {
          return cb(null, 'old', {issuedAt: new Date() - 100});
        } else if (key === 'new') {
          return cb(null, 'old', {issuedAt: new Date()});
        }
        return cb(new Error('Key fail'))
      });
    };

    keystore.remove = function (key, cb) {
      process.nextTick(function () {          
        if (key === 'old') {
          kList = kList.slice(1);
          return cb();
        } else if (key == 'new') {
          kList = kList.reverse().slice(1);
        }
        return cb(new Error('Key fail'))
      })
    };

    var logger = new Logger();
    before(function (done) {
      var r = new Reaper(keystore, logger);
      r.purge(new Date() - 50, function (err) {
        if (err) {
          return done(err);
        }
        return done();
      });
    });

    it('should purge old keys', function () {
      expect(kList.length).to.be.equal(1);
      expect(kList[0]).to.be.equal('new');
    });
  });
})
