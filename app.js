var Server = require('./lib/server')
  , server = new Server();

server.on('listening', function() {
  console.log('Listening');
});

server.on('data', function(data) {
  console.log("Data: ", data);
});

server.listen(1337);
