/**
 * Module dependencies.
 */
  
  
function MemoryKeyStore() {
  // TODO: Put a configurable limit on the number of keys to store.
  this._keys = [];
}

MemoryKeyStore.prototype.get = function(kid, cb) {
  if (typeof kid == 'function') {
    cb = kid;
    kid = undefined;
  }
  
  if (this._keys.length == 0) { return cb(new Error('No keys in keystore')); }
  
  function complete(id, key, cert, meta) {
    var arity = cb.length;
    
    if (kid) {
      if (arity == 4) {
        return cb(null, key, cert, meta);
      } else { // arity == 3
        return cb(null, key, meta);
      }
    } else {
      if (arity == 5) {
        return cb(null, id, key, cert, meta);
      } else { // arity == 4
        return cb(null, id, key, meta);
      }
    }
  }
  
  if (kid) {
    var matched;
    this._keys.forEach(function(key){
      if(key.id === kid) matched = key;
    });
    if(!matched) return cb(new Error('key not found: '+kid));
    return complete(matched.id, matched.key, matched.cert, matched.meta);
  } else {
    var newest = this._keys[0];
    
    var wantsCert = kid ? cb.length == 4 : cb.length == 5;
    if (wantsCert) {
      return complete(newest.id, newest.key, newest.cert, newest.meta);
    } else {
      return complete(newest.id, newest.key, undefined, newest.meta);
    }
  }
}

MemoryKeyStore.prototype.store = function(kid, key, cert, cb) {
  this._keys.push({ id: kid, key: key, cert: cert });
  process.nextTick(cb);
}


/**
 * Expose `MemoryKeyStore`.
 */
module.exports = MemoryKeyStore;
