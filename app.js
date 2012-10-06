var util = require('util')
  , express = require('express')
  , app = express.createServer()
  , RFIDServer = require('./lib/server')
  , DB = require('./lib/db')
  , TimeStamp = require('mongodb').Timestamp
  , config = require('./config.json')
  , rfidserver = new RFIDServer();

app.configure(function() {
  app.use(express.static(__dirname + "/public"));
});

app.get('/feed', function (req, res) {
  res.sendfile(__dirname + '/public/feed.html');
});

rfidserver.on('data', function(rfid) {

  DB.collection('rfids', function(err, rfids) {
    var query
      , now = new Date()
      , ten = new Date(now)
      , timestamp = now.getTime();

    ten.setSeconds(now.getSeconds() - 5);

    console.log(timestamp);

    if(err) {
      return util.error(err);
    }

    query = {
      rfid: rfid,
      lastUpdate: { $lte: ten.getTime() }
    };

    rfids.findAndModify(query, [['_id','asc']], {$set: {lastUpdate: timestamp }}, { new: true }, function(err, object) {
      console.log(err, object);
      if(object) {
        var inFridge = !object.inFridge;
        rfids.update({ _id: object._id }, { $set: { inFridge: inFridge }}, {safe:true}, function(err) {
          if(err) {
            return util.error(err);
          }
          util.log(rfid + " ~ " + inFridge);
        });
      }
    });
  });
});

DB.connect(config.mongo);

DB.on('connected', function() {
  util.log("Connected to '" + config.mongo.database + "' database");
  DB.collection('rfids', function(err, rfids) {
    rfids.update({ }, { $set: { lastUpdate: new Date().getTime() }, $unset: { inFridge: 1 }}, { safe: true }, function(err) {
      if(err) throw err;

      rfidserver.listen(1337, function() {
        util.log("TCP Server listening on port 1337");
      });

      app.listen(3000, function() {
        util.log("HTTP Server listening on port 3000");
      });
    });
  });
});
