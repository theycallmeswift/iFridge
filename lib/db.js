var mongodb = require('mongodb')
  , events = require('events')
  , util = require('util')
  , async = require('async');

function Database() {
  events.EventEmitter.call(this);
  this._connected = false;
  this._mongoConnection = undefined;
  this._collectionCache = {};
}

util.inherits(Database, events.EventEmitter);

Database.prototype.connect = function(config, cb) {
  var self = this;
  self.config = config;

  self.server = new mongodb.Server(config.server, config.port, { auto_reconnect: true });
  self.db = new mongodb.Db(config.database, self.server, {});

  self.db.on('close', function(error){
    self._connected = false;
    self.emit('disconnected');
  });

  self.db.open(function(err, p_client) {
    if(err) return self.emit('error', err);
    self._mongoConnection = p_client;

    if(config.username && config.password) {
      self.db.authenticate(config.username, config.password, function(err) {
        if(err) return self.emit('error', err);

        self._connected = true;
        return self.emit('connected');
      });
    } else {
      self._connected = true;
      return self.emit('connected');
    }
  });
  return self.db;
};

Database.prototype.collection = function(collectionName, cb) {
  var callback = cb || function() { }
    , self = this;

  if(self._collectionCache[collectionName]) {
    return cb(null, self._collectionCache[collectionName]);
  }

  self.db.collection(collectionName, function(err, collectionObj) {
    if(err) return cb(err);

    self._collectionCache[collectionName] = collectionObj;
    return cb(null, collectionObj);
  });
};

Database.prototype.dropDatabase = function(cb) {
  if(!this._connected || !this._mongoConnection) {
    return cb(new Error('Connection not yet established'));
  }

  return this._mongoConnection.dropDatabase(cb);
};

module.exports = new Database;
