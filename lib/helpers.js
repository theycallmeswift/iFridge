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

            if(!inFridge && object.protected && object.phoneNumber) {
              return sendSMSAlert(object.phoneNumber, object.title);
            }
          });
        }
      });
    });
  }
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

module.exports = {
  RFIDHandler: RFIDHandler
};
