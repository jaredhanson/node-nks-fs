/**
 * Module dependencies.
 */
var path = require('path')
  , fs = require('fs')
  , async = require('async');


// TODO: this can be optimized with a watch, or a cache of the dir listing, so file
//       system access isn't required every get
// TODO: if a key pair is requested, ensure that both exist to avoid a race condition
//       where one is stored but the other isn't.  if that condition exists, find the
//       previous key

// contains private keys, along with corresponding public keys and/or certificates
function FSKeyStore(root) {
  this._root = root;
  this._ext = '.pem';
}

FSKeyStore.prototype.get = function(kid, cb) {
  if (typeof kid == 'function') {
    cb = kid;
    kid = undefined;
  }
  
  var self = this
    , root = this._root;
  
  function proceed(entry) {
    var id = path.basename(entry.path, path.extname(entry.path));
    
    fs.readFile(entry.path, 'utf8', function(err, key) {
      if (err) { return cb(err); }
      
      if (kid) {
        return cb(null, key, { issuedAt: entry.ctime });
      } else {
        return cb(null, id, key, { issuedAt: entry.ctime });
      }
      
      // TODO: implement option to read pub key too
      //fs.readFile(path.join(root, 'public', id + ext))
    });
  }
  
  if (kid) {
    // TODO: implement this (get by id)
    return cb(new Error('not implemented'));
  } else {
    function stat(item, callback) {
      var p = path.join(root, item);
      fs.stat(p, function(err, stats) {
        if (err) { return callback(err) };
        stats.path = p;
        return callback(null, stats);
      });
    }
  
    function isFile(item) {
      return item.isFile();
    }
  
    function newest(s1, s2) {
      return s2.ctime.getTime() - s1.ctime.getTime();
    }
  
    fs.readdir(root, function(err, entries) {
      if (err) { return cb(err); }
      
      async.map(entries, stat, function(err, results) {
        if (err) { return cb(err); }
        
        var files = results.filter(isFile).sort(newest);
        if (files.length == 0) { return cb(new Error('No keys in keystore')); }
        return proceed(files[0]);
      });
    });
  }
}


/**
 * Expose `FSKeyStore`.
 */
module.exports = FSKeyStore;
