

function Reaper(keystore, logger) {
  this.keystore = keystore;
  this.logger = logger || console;
}

Reaper.prototype.purge = function(time, cb) {
  // Number, dates, things with getTime
  if (typeof time != 'number') {
    try {
      time = time.getTime();
    } catch (ex) {
      return cb(ex);
    }
  }

  var self = this;

  self.keystore.list(function (err, l) {
    if (err) {
      return cb(err);
    }

    var keys = l
      , kIndex=0
      , key;

    function kIter(err) {
      if (err) {
        return cb(err);
      }

      key = keys[kIndex++];

      if (! key) {
        return cb();
      }

      self.keystore.get(key, function (err, key, res) {
        if (err) {
          return kIter(err);
        }

        var issuedAt = res.issuedAt
          , curTime = new Date();

        if ((time - issuedAt) >= 0) {
          self.keystore.remove(key, function (err) {
            if (err) {
              return kIter(err);
            }
            kIter();
          });
        } else {
          kIter();
        }
      });
    }

    kIter();
  });
};

exports = module.exports = Reaper;