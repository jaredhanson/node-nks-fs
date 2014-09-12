/**
 * Module dependencies.
 */


function Rotator(store, config, generator) {
  if(typeof store != 'object' || typeof config != 'object' || typeof generator != 'function') throw new Error('Rotator requires store, config, and generator args');

  this.store = store;
  this.config = config;
  // daily default
  this.frequency = this.config.frequency || 86400*1000;
  this.generator = generator;
}

Rotator.prototype.rotate = function(done) {
  // optional callback
  if(typeof done != 'function') { done = function(){}; };

  // use given generator
  this.generator(function(err, key){
    if(err) { return done(err); };
    // TODO
    console.log("SAVE KEY",key);
    done();
  });
}

Rotator.prototype.start = function(done) {
  var self = this;
  self.timer = setInterval(self.rotate, self.frequency);
  self.rotate(done);
}

Rotator.prototype.stop = function(done) {
  if(!self.timer) { return done('not started'); };
  clearInterval(self.timer);
  self.timer = false;
  done();
}


/**
 * Expose `Rotator`.
 */
module.exports = Rotator;
