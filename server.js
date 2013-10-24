var app = require('http').createServer(handler).listen(8000)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , arDrone = require('ar-drone')
  , url = require('url');

var drone = arDrone.createClient();

var HOVERING = 1;
var LANDED = 0;
var EMERGENCY = 3;

var droneStatus = LANDED;

function handler (req, res) {
  path =  url.parse(req.url).pathname;

  console.log(path);

  pathToLoad = (path == '/') ? '/index.html' : path;

  fs.readFile(__dirname + pathToLoad,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading ' + pathToLoad);
    }

    res.writeHead(200);
    res.end(data);
  });
}

function setPitch(p) {
  pitch = Math.min(1, Math.abs(p));
  if (p > 0) { 
    drone.back(pitch);
  } else {
    drone.front(pitch);
  }
}

function setRoll(r) {
  roll = Math.min(1, Math.abs(r));
  console.log(roll);
  if (r > 0) { 
    drone.left(roll);
  } else {
    drone.right(roll);
  }
}

function setYaw(y) {
  if (Math.abs(y) > 0.2) {
    yaw = Math.min(1, Math.abs(y));
    if (y > 0) { 
      drone.clockwise(yaw); 
    } else {
     drone.counterClockwise(yaw);
    }
  }
}

function setAlt(a) {
  if (Math.abs(a) > 75) {
    alt = Math.min(1, (Math.abs(a) - 75)/50);
    if (a > 0) {
      drone.up(alt);
    } else { 
      drone.down(alt);
    }
  }
}

function controlDrone(pitch,yaw,roll,alt) {
  // tells the drone what to do.
  // console.log("pitch: " + pitch + "\t yaw: " + yaw + "\t roll: " + roll);

  // making it discrete to allow more stability. 
  // These are arbitrary numbers, TODO: make it configurable.
  p = Math.floor(pitch*10)*0.05;
  r = Math.floor(roll*10)*0.04;
  y = Math.floor(yaw*10)*0.03;
  a = Math.floor((alt-170)/10)*10;

  // send commands to drone!
  setRoll(r);
  setPitch(p);
  setYaw(y);
  setAlt(a);

  // DEBUG
  // console.log("norm: " + p + "\t" + y + "\t" + r + "\t" + a);

  return
};

io.sockets.on('connection', function (socket) {

  socket.on('takeoff', function() {
    // tell drone to takeoff
    drone.takeoff(function() {
      droneStatus = HOVERING;
    });
  });

  socket.on('pyrdata', function (data) {
    // console.log(data);
    console.log(droneStatus);
    if (droneStatus == HOVERING) {
      controlDrone(data.pitch, data.yaw, data.roll, data.alt);
    }
  });

  socket.on('land', function () {
    // land the drone
    drone.land(function() {
      droneStatus = LANDED;
    });
  })
});
