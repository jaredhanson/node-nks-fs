/**
 * Module dependencies.
 */
var EventEmitter = require('events').EventEmitter
  , util = require('util');


function Rotator(store, keygen, options) {
  options = options || {};

  EventEmitter.call(this);
  // daily default
  this.frequency = options.frequency !== undefined ? options.frequency : 86400*1000;
  this._store = store;
  this._keygen = keygen;
}

util.inherits(Rotator, EventEmitter);

Rotator.prototype.rotate = function(cb) {
  var self = this;

  // optional callback
  if(typeof cb != 'function') { cb = function(){}; };

  // use given generator
  self._keygen(function(err, key, cert, kid){
    if(err) {
      self.emit('error', err);
      return cb(err);
    };
    self._store.store(kid, key, cert, function(err) {
      if(err) {
        self.emit('fail', err);
        return cb(err);
      };
      self.emit('rotate', kid);
      return cb();
    });
  });
}

Rotator.prototype.start = function(cb) {
  this._timer = setInterval(this.rotate.bind(this), this.frequency);
  // initial rotation
  var self = this;
  process.nextTick(function() {
    self.rotate(cb);
  });
}

Rotator.prototype.stop = function(cb) {
  // optional callback
  if(typeof cb != 'function') { cb = function(){}; };
  
  if(!this._timer) { return process.nextTick(cb); };
  clearInterval(this._timer);
  this._timer = false;
  process.nextTick(cb);
}


/**
 * Expose `Rotator`.
 */
module.exports = Rotator;
