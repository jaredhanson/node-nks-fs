/**
 * Module dependencies.
 */
var path = require('path')
  , fs = require('fs')
  , mkdirp = require('mkdirp')
  , async = require('async');


// TODO: this can be optimized with a watch, or a cache of the dir listing, so file
//       system access isn't required every get
// TODO: if a key pair is requested, ensure that both exist to avoid a race condition
//       where one is stored but the other isn't.  if that condition exists, find the
//       previous key

// contains private keys, along with corresponding public keys and/or certificates
function FSKeyStore(root, pubroot) {
  this._root = root;
  this._pubroot = pubroot;
  this._ext = '.pem';
}

// TODO: Need to read a file, determine if it is formatted correctly, and read associated
//       cert and/or private key
//       certs can live in "public" directory, and that results in a data structure with
//       both.

FSKeyStore.prototype.all = function(cb) {
  var self = this
    , keys = [];
  
  fs.readdir(this._pubroot, function(err, entries) {
    console.log(entries)
    
    var entry, i = 0;
    
    
    (function iter(err) {
      if (err) { return cb(err); }
      
      entry = entries[i++];
      if (!entry) {
        // done
        return cb(null, keys);
      }
      
      var key = {};
      
      fs.readFile(path.join(self._pubroot, entry), 'utf8', function(err, cert) {
        if (err) { return iter(err); }
        key.id = entry; // TODO: Strip extension
        key.public = cert;
        
        // TODO: Read private key, if dir is accissable
        keys.push(key);
        iter();
      });
    })();
  });
}


FSKeyStore.prototype.get = function(kid, cb) {
  if (typeof kid == 'function') {
    cb = kid;
    kid = undefined;
  }
  
  var self = this
    , root = this._root
    , ext = this._ext;
  
  if(!root) { return cb(new Error('no root configured')); }

  function proceed(entry) {
    var id = path.basename(entry.path, path.extname(entry.path));
    
    fs.readFile(entry.path, 'utf8', function(err, key) {
      if (err) { return cb(err); }
      
      var wantsCert = kid ? cb.length == 4 : cb.length == 5;
      if (wantsCert) {
        fs.readFile(path.join(root, 'public', id + ext), 'utf8', function(err, cert) {
          if (err) { return cb(err); }
          return complete(id, key, cert, entry);
        });
      } else {
        return complete(id, key, undefined, entry);
      }
    });
  }
  
  function complete(id, key, cert, entry) {
    var arity = cb.length;
    
    if (kid) {
      if (arity == 4) {
        return cb(null, key, cert, { issuedAt: entry.ctime });
      } else { // arity == 3
        return cb(null, key, { issuedAt: entry.ctime });
      }
    } else {
      if (arity == 5) {
        return cb(null, id, key, cert, { issuedAt: entry.ctime });
      } else { // arity == 4
        return cb(null, id, key, { issuedAt: entry.ctime });
      }
    }
  }
  
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
  
  // by specific id
  if(kid) {
    var entry = kid+ext;
    stat(entry, function(err, item){
      if(!item || !isFile(item)) {
        return cb(new Error('key not found at '+path.join(root,entry)));
      }
      proceed(item);
    });
    return;
  }

  // or return the newest file in the fs store root
  fs.readdir(root, function(err, entries) {
    if (err) {
      // return specific error when empty
      if(err.errno === 34) { return cb(new Error('No keys in keystore')); }
      return cb(err);
    }
    
    async.map(entries, stat, function(err, results) {
      if (err) { return cb(err); }
      
      var files = results.filter(isFile).sort(newest);
      if (files.length == 0) { return cb(new Error('No keys in keystore')); }
      return proceed(files[0]);
    });
  });
}

FSKeyStore.prototype.store = function(kid, key, cert, cb) {
  var self = this
    , root = this._root
    , ext = this._ext;

  if(!root) { return cb(new Error('no root configured')); }

  mkdirp(path.join(root,'public'), function(err){
    if(err) { return cb('mkdirp failed for: '+root+', '+err); }

    var pathKey = path.join(root,kid+ext);
    var pathCert = path.join(root,'public',kid+ext);

    // never overwrite an existing file
    if(fs.existsSync(pathKey)) { return cb(new Error('key file exists: '+pathKey)); };
    if(fs.existsSync(pathCert)) { return cb(new Error('key file exists: '+pathCert)); };

    fs.writeFile(pathKey,key,function(err){
      if(err) { return cb(new Error('key store failed for: '+pathKey+', '+err)); }
      fs.writeFile(pathCert,cert,function(err){
        if(err) { return cb(new Error('key store failed for: '+pathCert+', '+err)); }
        cb();
      });
    });
  });
}


/**
 * Expose `FSKeyStore`.
 */
module.exports = FSKeyStore;
