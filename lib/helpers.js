var app = require('../app')
  , config = app.set('config')
  , util = require('util');

function RFIDHandler (data) {
  var rfid = data.replace(/\n$/, '')
    , REGEX = /^\w{10}$/;

  if(rfid === 'connected') {
    return util.log("Arduino sensor connected");
  }

  if(REGEX.test(rfid) && rfid.length === 10) {
    app.db.collection('rfids', function(err, rfids) {
      var query
        , now = new Date()
        , ten = new Date(now)
        , timestamp = now.getTime();

      ten.setSeconds(now.getSeconds() - 5);

      if(err) {
        return util.error(err);
      }

      query = {
        rfid: rfid,
        lastUpdate: { $lte: ten.getTime() }
      };

      console.log(query);

      rfids.findAndModify(query, [['_id','asc']], {$set: {lastUpdate: timestamp }}, { new: true }, function(err, object) {
        if(err) {
          return util.error(err);
        }

        if(object) {
          var inFridge = !object.inFridge;

          util.log(JSON.stringify(object));

          rfids.update({ _id: object._id }, { $set: { inFridge: inFridge }}, {safe:true}, function(err) {
            if(err) {
              return util.error(err);
            }
            util.log(rfid + " is in fridge: " + inFridge);

            if(inFridge) {
              app.io.sockets.emit('insert', object.rfid, object.type || 'beer');
            } else {
              app.io.sockets.emit('remove', object.rfid, object.type || 'beer');
              getNutritionInfo();
            }

            if(!inFridge && object.protected && object.phoneNumber) {
              app.io.sockets.emit('protected', object.title, object.type || 'beer');
              sendSMSAlert(object.phoneNumber, object.title);
            }

            if(!inFridge && object.expires && object.expires < now && object.phoneNumber) {
              app.io.sockets.emit('expired', object.title, object.type || 'beer');
              sendExpiredCall(object.phoneNumber);
            }
          });
        }
      });
    });
  }
}

function getNutritionInfo(callback) {
  var cb = callback || function() {};

  app.db.collection('rfids', function(err, rfids) {
    if(err) {
      return cb(err);
    }

    rfids.find({ inFridge: false }).toArray(function(err, results) {
      if(err) {
        return cb(err);
      }

      var nutrition = {
        calories: 0,
        fat: 0,
        carbs: 0,
        protein: 0,
        sodium: 0
      };

      results.forEach(function(item) {
        if(item.nutrition) {
          nutrition.calories += item.nutrition.calories;
          nutrition.fat += item.nutrition.fat;
          nutrition.carbs += item.nutrition.carbs;
          nutrition.protein += item.nutrition.protein;
          nutrition.sodium += item.nutrition.sodium;
        }
      });

      console.log(results);
      app.io.sockets.emit('nutrition', nutrition);
    });
  });
}

function sendSMSAlert(phoneNumber, item) {
  util.log("Sending SMS alert for '" + item + "' to " + phoneNumber);
  return app.Twilio.SMS.create({
    to: phoneNumber,
    from: app.set('phoneNumber'),
    body: "Get your ass to the fridge! Somebody is stealing your " + item
  }, function(err, twilioRes) {
    if(err) {
      return util.error(err);
    }
    return util.log(JSON.stringify(twilioRes));
  });
}

function sendExpiredCall(phoneNumber) {
  app.Twilio.Call.create({to: phoneNumber, from: app.set('phoneNumber'), url: "http://jonsplanet.com/milkbad.wav"}, function(err,tres) {
    if(err) {
      return util.error(err);
    }
    util.log("Sent expired call to " + phoneNumber);
  })
}

module.exports = {
  RFIDHandler: RFIDHandler
};
