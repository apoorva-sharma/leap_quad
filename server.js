var app = require('http').createServer(handler).listen(8000)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , arDrone = require('ar-drone');

var drone = arDrone.createClient();

var HOVERING = 1;
var LANDED = 0;
var EMERGENCY = 3;

var droneStatus = LANDED;

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

function controlDrone(pitch,yaw,roll) {
  // tells the drone what to do.
  // console.log("pitch: " + pitch + "\t yaw: " + yaw + "\t roll: " + roll);

  // making it discrete to allow more stability. 
  p = Math.floor(pitch*10)*0.07;
  r = Math.floor(roll*10)*0.07;
  y = Math.floor(yaw*10)*0.07;

  setPitch = (p > 0) ? drone.back : drone.front;
  setRoll = (r > 0) ? drone.left : drone.right;

  // only turn when we really mean it.
  if (Math.abs(y) > 0.1) {
    setYaw = (y > 0) ? drone.clockwise : drone.counterClockwise;
  } 

  console.log("norm: " + p + "\t" + y + "\t" + r);
  return
};

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });

  socket.on('connect', function() {
    // tell drone to takeoff
    // drone.takeoff(function() {
    //   droneStatus = HOVERING;
    // });
  });

  socket.on('pyrdata', function (data) {
    // console.log(data);
    controlDrone(data.pitch, data.yaw, data.roll);
  });

  socket.on('disconnect', function () {
    // land the drone
    // drone.land(fucntion() {
    //   droneStatus = LANDED:
    // });
  })
});
