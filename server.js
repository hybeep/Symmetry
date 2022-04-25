var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile('index.html');
});

function createTemp() {
    var nums = [];
    while (nums.length < 16) {
        var no = Math.floor((Math.random() * 40) + 1);
        if (nums.indexOf(no) === -1) {
            nums.push(no);
        }
    }
    nums.sort(function (a, b) { return a - b });
    return nums;
}

function simmetTemp(nums) {
    var simmet = [];
    for (var i = 0; i < nums.length; i++) {
        if (nums[i] % 4 === 0) { simmet[i] = nums[i] - 3; }
        if (nums[i] % 4 === 1) { simmet[i] = nums[i] + 3; }
        if (nums[i] % 4 === 2) { simmet[i] = nums[i] + 1; }
        if (nums[i] % 4 === 3) { simmet[i] = nums[i] - 1; }
    }
    simmet.sort(function (a, b) { return a - b });
    return simmet;
}

io.on('connection', (socket) => {
    console.log('Client connected');

    var currentRoomId;
    var roomno = 1;

    socket.on("join", (username) => {

        while (io.sockets.adapter.rooms.get("room-" + roomno) !== undefined && io.sockets.adapter.rooms.get("room-" + roomno).size > 1) {
            roomno++;
        }

        socket.join("room-" + roomno);
        currentRoomId = "room-" + roomno;

        var names = [];

        if (io.sockets.adapter.rooms.get(currentRoomId).size == 1) {
            names.push(username);
            io.sockets.adapter.rooms.set("names-" + roomno, names);
            io.sockets.in(currentRoomId).emit('connectToRoom', "Esperando a otro jugador", roomno);
        } else {
            io.sockets.in(currentRoomId).emit('connectToRoom', "Sala completa", roomno);
            io.sockets.adapter.rooms.get("names-" + roomno).push(username);
            socket.broadcast.to(currentRoomId).emit('setNames', io.sockets.adapter.rooms.get("names-" + roomno)[1]);
            socket.emit('setNames', io.sockets.adapter.rooms.get("names-" + roomno)[0]);
            io.sockets.adapter.rooms.set("nums-" + roomno, createTemp());
            io.sockets.in(currentRoomId).emit('sendTemplate', io.sockets.adapter.rooms.get("nums-" + roomno));
            io.sockets.adapter.rooms.set("numssim-" + roomno, simmetTemp(io.sockets.adapter.rooms.get("nums-" + roomno)));
        }
        console.log("lista de nombres:  " + io.sockets.adapter.rooms.get("names-" + roomno));
    });

    socket.on("sendCoord", (coord) => {
        socket.broadcast.to(currentRoomId).emit('setCoord', coord);
    });

    socket.on("unsendCoord", (coord) => {
        socket.broadcast.to(currentRoomId).emit('delCoord', coord);
    });

    socket.on("checkWin", (coords) => {
        coords.sort(function (a, b) { return a - b });
        var crds = [];
        for (var i = 0; i < coords.length; i++) {
            crds[i] = Number(coords[i]);
        }

        var same = true;
        for (var i = 0; i < io.sockets.adapter.rooms.get("numssim-" + roomno).length; i++) {
            if (io.sockets.adapter.rooms.get("numssim-" + roomno)[i] !== crds[i]) {
                same = false;
                break;
            }
        }
        if (same) {
            socket.broadcast.to(currentRoomId).emit('win', false);
            socket.emit('win', true);
        }
    });

    socket.on("leaveroom", (player) => {
        socket.leave(currentRoomId);
        socket.broadcast.to(currentRoomId).emit('desconectado', true);
        console.log('Client disconnected');
    })

    socket.on('disconnect', function () {
        socket.leave(currentRoomId);
        socket.broadcast.to(currentRoomId).emit('desconectado', true);
        console.log('Client disconnected');
    })
    /*
        socket.on('disconnect', () => {
            io.sockets.adapter.rooms.get("names-" + roomno).splice(0, io.sockets.adapter.rooms.get("names-" + roomno).length);
            socket.leave(currentRoomId);
            socket.broadcast.to(currentRoomId).emit('desconectado', true);
            console.log('Client disconnected');
        })*/
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Listening on ${PORT}`));