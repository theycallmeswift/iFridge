var Server = require('./lib/server')
  , express = require('express')
  , app = express.createServer()
  , rfidServer = new Server();


app.listen(8080);

app.use(express.static(__dirname + "/public"));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

app.get('/feed', function (req, res) {
    res.sendfile(__dirname + '/public/feed.html');
});

rfidServer.on('listening', function() {
  console.log('Listening');
});

rfidServer.on('data', function(data) {
  console.log("Data: ", data);
});

rfidServer.listen(1337);
