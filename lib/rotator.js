/**
 * Module dependencies.
 */


function Rotator(config, generator) {
  if(typeof config != 'object' || typeof generator != 'function') throw new Error('Rotator requires config and generator args');

  this.config = config;
  this.generator = generator;
}

Rotator.prototype.start = function(done) {
  done('not implemented');
}

Rotator.prototype.stop = function(done) {
  done('not implemented');
}


/**
 * Expose `Rotator`.
 */
module.exports = Rotator;
