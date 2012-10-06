var net = require('net')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter;

function Server(port) {
  var self = this;

  EventEmitter.call(self);
  self._server = net.createServer(function(connection) {
    connection.setEncoding('ascii');

    connection.on('data', function(data) {
      self.emit('data', data);
    });

    connection.on('end', function() {
      self.emit('end');
    });
  });
}

util.inherits(Server, EventEmitter);

Server.prototype.listen = function(port, cb) {
  var callback = cb || function() {};
  this._server.listen(port, callback);
  this.emit('listening');
};

module.exports = Server;
