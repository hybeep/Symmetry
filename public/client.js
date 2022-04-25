var socket = io();

var btnsClicked = [];
var player2name = "", playername = "";
var record = 0, ganadas = 0, perdidas = 0;
var timerR;
var ttime;

socket.on('connectToRoom', (data, no) => {
  //alert(no);
  if (data == "Sala completa") {
    initTimer();
    makeTablero();
  } else {
    document.getElementById("content").innerHTML = "Esperando a otro jugador...";
  }
})

function initTimer() {
  var t = 0;
  timerR = setInterval(function () {
    document.getElementById("timer").innerHTML = t++;
  }, 1000);
}

function clearTimer() {
  clearInterval(timerR);
}

socket.on("setNames", (username) => {
  player2name = username;
  document.getElementById("player2").innerHTML = username;
})

socket.on('sendTemplate', (nums) => {
  for (var i = 0; i < nums.length; i++) {
    document.getElementById(nums[i] + "t").classList.add('btn-primary');
    if (document.getElementById(nums[i] + "t").classList.contains('btn-secondary')) {
      document.getElementById(nums[i] + "t").classList.remove('btn-secondary');
    }
  }
})

socket.on('setCoord', (coord) => {
  document.getElementById(coord + "p").classList.add('btn-danger');
  if (document.getElementById(coord + "p").classList.contains('btn-secondary')) {
    document.getElementById(coord + "p").classList.remove('btn-secondary');
  }
})

socket.on('delCoord', (coord) => {
  document.getElementById(coord + "p").classList.add('btn-secondary');
  if (document.getElementById(coord + "p").classList.contains('btn-danger')) {
    document.getElementById(coord + "p").classList.remove('btn-danger');
  }
})

socket.on("desconectado", (dsc) => {
  clearTimer();
  document.getElementById("timer").innerHTML = "";
  showMdl(player2name + " se ha ido");
  socket.emit("leaveroom", playername);
  document.getElementById("btnexit").innerHTML = "<button onclick='salir()' id='salir' class='btn btn-danger'>Salir</button>";
  socket.emit("join", playername);
})

socket.on("win", (win) => {
  var mnsj = "";
  clearTimer();
  if (win) {
    btnsClicked = [];
    var newRecord = document.getElementById("timer").textContent;
    if (record === 0) { record = newRecord; }
    if (newRecord < record) { record = newRecord; }
    ganadas++;
    mnsj += "FELICIDADES!, has ganado";
    mnsj += "<br/>Record: " + record;
    mnsj += "<br/>Ganadas: " + ganadas;
    mnsj += "<br/>Perdidas: " + perdidas;
  } else {
    perdidas++;
    mnsj = "Has perdido";
    mnsj += "<br/>Record: " + record;
    mnsj += "<br/>Ganadas: " + ganadas;
    mnsj += "<br/>Perdidas: " + perdidas;
    document.getElementById("myModal").style.color = "#DE3C4B";
  }
  document.getElementById("timer").innerHTML = "";
  showMdl(mnsj);
})

function showMdl(mnsj) {
  document.getElementById("mnsjWin").innerHTML = mnsj;
  $('#myModal').modal({
    show: 'true',
    keyboard: false,
    backdrop: 'static'
  });
}

function unirse() {
  var aphnmrc = /^[A-z0-9]+$/g;
  if (aphnmrc.test(document.getElementById("username").value)) {
    document.getElementById("btnexit").innerHTML = "<button onclick='salir()' id='salir' class='btn btn-danger'>Salir</button>";
    playername = document.getElementById("username").value;
    socket.emit("join", playername);
  } else {
    alert("El nombre solo puede tener letras y numeros");
  }
}

function makeTablero() {

  //jugador
  var txt = "<div class='col-sm-1 col-xs-1'></div>";
  txt += "<div class='col-sm-2 col-xs-2'>";
  txt += "<h4 id='player2' class='plyr'><h4>";
  txt += "<table class='table table-borderless'>";
  for (var i = 1; i < 11; i++) {
    txt += "<tr>";
    for (var j = 1; j < 5; j++) {
      txt += "<td>";
      txt += "<button type='button' class='btn btn-secondary btn-lg btn-block disabled' id='" + (4 * (i - 1) + j) + "p'><p></p></button>";
      txt += "</td>";
    }
    txt += "</tr>";
  }
  txt += "</table>";
  txt += "</div>";

  txt += "<div class='col-sm-2 col-xs-2'></div>";

  //plantilla
  txt += "<div class='col-sm-2 col-xs-2'>";
  txt += "<h4 class='plyr'>---<h4>";
  txt += "<table class='table table-borderless'>";
  for (var i = 1; i < 11; i++) {
    txt += "<tr>";
    for (var j = 1; j < 5; j++) {
      txt += "<td>";
      txt += "<button type='button' class='btn btn-secondary btn-lg btn-block disabled' id='" + (4 * (i - 1) + j) + "t'><p></p></button>";
      txt += "</td>";
    }
    txt += "</tr>";
  }
  txt += "</table>";
  txt += "</div>";

  txt += "<div class='col-sm-2 col-xs-2'></div>";

  //tablero
  txt += "<div class='col-sm-2 col-xs-2'>";
  txt += "<h4 class='plyr'>Me<h4>";
  txt += "<table class='table table-borderless'>";
  for (var i = 1; i < 11; i++) {
    txt += "<tr>";
    for (var j = 1; j < 5; j++) {
      txt += "<td>";
      txt += "<button type='button' class='btn btn-lg btn-block btn-light' id='" + (4 * (i - 1) + j) + "' onclick='buttonClicked(this.id)'><p></p></button>";
      txt += "</td>";
    }
    txt += "</tr>";
  }
  txt += "</table>";
  txt += "</div>";
  txt += "<div class='col-sm-1 col-xs-1'></div>";

  document.getElementById("content").innerHTML = txt;
}

function buttonClicked(btnID) {
  var id = 0;
  var nmrc = /^[0-9]+$/g;
  if (nmrc.test(btnID)) {
    id = Number(btnID);
  } else {
    alert("No modifiques el HTML.");
    return;
  }
  if (id > 0 && id < 41) {
    btnsClicked.push(btnID);
    document.getElementById(btnID).classList.add('btn-info');
    if (document.getElementById(btnID).classList.contains('btn-light')) {
      document.getElementById(btnID).classList.remove('btn-light');
    }
    document.getElementById(btnID).setAttribute("onclick", "buttonUnclicked(this.id)");
    socket.emit("sendCoord", btnID);
    socket.emit("checkWin", btnsClicked);
  } else {
    alert("No modifiques el HTML.");
  }
}

function buttonUnclicked(btnID) {
  var id = 0;
  var nmrc = /^[0-9]+$/g;
  if (nmrc.test(btnID)) {
    id = Number(btnID);
  } else {
    alert("No modifiques el HTML.");
    return;
  }
  if (id > 0 && id < 41) {
    btnsClicked.splice(btnsClicked.indexOf(btnID), 1);
    document.getElementById(btnID).classList.add('btn-light');
    if (document.getElementById(btnID).classList.contains('btn-info')) {
      document.getElementById(btnID).classList.remove('btn-info');
    }
    document.getElementById(btnID).setAttribute("onclick", "buttonClicked(this.id)");
    socket.emit("unsendCoord", btnID);
    socket.emit("checkWin", btnsClicked);
  } else {
    alert("No modifiques el HTML.");
  }
}

function salir() {
  socket.emit("leaveroom", playername);
  ganadas = 0;
  perdidas = 0;
  record = 0;
  clearTimer();
  document.getElementById("timer").innerHTML = "";
  document.getElementById("btnexit").innerHTML = "";
  var text = "<div class='col-sm-4 col-xs-4'></div>";
  text += "<div class='col-sm-4 col-xs-4'>";
  text += "<input type='text' name='' id='username' placeholder='Escribe tu nombre de usuario'>";
  text += "<button onclick='unirse()' id='join' class='btn btn-danger'>UNIRSE</button>";
  text += "</div>";
  text += "<div class='col-sm-4 col-xs-4'></div>";
  document.getElementById("content").innerHTML = text;
}

(function () {
  if (window.innerWidth < 650) {
    alert("Para un visualizacion adecuada debe usar un dispositivo de al menos 650 px de ancho.")
  }
  document.getElementById("next").addEventListener("click", () => {
    socket.emit("join", playername);
  })
  document.getElementById("content").addEventListener("change", () => {
    clearTimeout(ttime);
  });
  window.addEventListener("resize", function(){
    if (window.innerWidth < 650) {
      alert("Para un visualizacion adecuada debe usar un dispositivo de al menos 650 px de ancho.")
    }
  });
})();