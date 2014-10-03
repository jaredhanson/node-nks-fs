function MockLogger() {
  this.messages = [];
}

MockLogger.prototype.error = function(msg) {
  this.messages.push({ level: 'error', message: msg });
}

MockLogger.prototype.warn = function(msg) {
  this.messages.push({ level: 'warn', message: msg });
}

MockLogger.prototype.info = function(msg) {
  this.messages.push({ level: 'info', message: msg });
}

MockLogger.prototype.debug = function(msg) {
  this.messages.push({ level: 'debug', message: msg });
}

MockLogger.prototype.silly = function(msg) {
  this.messages.push({ level: 'silly', message: msg });
}


module.exports = MockLogger;
