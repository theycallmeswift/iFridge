var util = require('util')
  , express = require('express')
  , app = module.exports = express.createServer()
  , io = require('socket.io').listen(app)
  , Twilio = require('twilio-js')
  , RFIDServer = require('./lib/server')
  , env = process.env.NODE_ENV || 'development'
  , config = require('./config.json')
  , rfidserver = new RFIDServer();

app.configure(function() {
  app.set('env', env);
  app.set('port', process.env.PORT || 3000);
  app.set('phoneNumber', config.twilio.phoneNumber);
  app.set('config', config);
  app.use(express.static(__dirname + "/public"));
});

/* Load and connect the database */
app.db = require('./lib/db');
app.db.connect(config.mongo);

/* Load the helpers */
app.helpers = require('./lib/helpers');

/* Add a socket.io reference to app */
app.io = io;

app.io.sockets.on('connection', function (socket) {
  socket.on('lock', function(rfid) {
    app.db.collection('rfids', function(err, rfids) {
      rfids.update({ rfid: rfid }, { $set: { protected: true }}, {safe:true}, function(err) {
        socket.emit('locked', rfid);
      });
    });
  });
});

/* Twilio setup */
Twilio.AccountSid = config.twilio.sid;
Twilio.AuthToken = config.twilio.token;
app.Twilio = Twilio;

/* RFID Handler */
rfidserver.on('data', app.helpers.RFIDHandler);

app.db.on('connected', function() {
  util.log("Connected to '" + config.mongo.database + "' database");
  app.db.collection('rfids', function(err, rfids) {
    rfids.update({ }, { $set: { lastUpdate: new Date().getTime() }, $unset: { inFridge: 1 }}, { safe: true, multi: true }, function(err) {
      if(err) throw err;

      rfidserver.listen(1337, function() {
        util.log("TCP Server listening on port 1337");
      });

      app.listen(app.set('port'), function() {
        util.log("HTTP Server listening on port " + app.set('port') + " in " + env + " mode");
      });
    });
  });
});
