
/*
__        __  _               _     _   _                         __        __         ____
\ \      / / | |__     __ _  | |_  | | | |   __ _  __   __   ___  \ \      / /   ___  |  _ \    ___    _ __     ___
 \ \ /\ / /  | '_ \   / _` | | __| | |_| |  / _` | \ \ / /  / _ \  \ \ /\ / /   / _ \ | | | |  / _ \  | '_ \   / _ \
  \ V  V /   | | | | | (_| | | |_  |  _  | | (_| |  \ V /  |  __/   \ V  V /   |  __/ | |_| | | (_) | | | | | |  __/
   \_/\_/    |_| |_|  \__,_|  \__| |_| |_|  \__,_|   \_/    \___|    \_/\_/     \___| |____/   \___/  |_| |_|  \___|
   What.js: There is no point of editing this file, This is meant just to emit whatever is recieved and have a writer emitter.
            No edit done to this file will be used in production
*/
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require("fs");
var password =  fs.readFileSync("secure_password", "utf8").replace(/(\r\n|\n|\r)/gm,"");
console.log("password: " + password);
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
io.on('connection', function(socket){
  var onevent = socket.onevent;
  socket.onevent = function (packet) {
      var args = packet.data || [];
      onevent.call (this, packet);    // original call
      packet.data = ["*"].concat(args);
      onevent.call(this, packet);      // additional call to catch-all
  };
  socket.on("*",function(event,data) {
    if (event == "writer") {} else {
      io.emit(event, data);
      console.log(event + ":" + data);
    }
  });
  socket.on("writer", function(data) {
    if (data[0] == password) {
      io.emit("writer", data[1]);
      console.log(data.run + " was sent to all clients!");
    } else {
      socket.emit("writer", "console.error('incorrect emitter password. Rejected');");
      console.log("Denied writer user");
    }
  });
});
http.listen(3002, function(){
  console.log('listening on *:3002');
});
setInterval(function() {
  io.emit("online", io.engine.clientsCount);
}, 1000);
// base code by DatOneLefty, all in 50 lines
