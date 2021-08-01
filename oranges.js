var tileColours = ["#F4FA46", "#FD8308", "#F21713", "#F576E6", "#C910BA", "#495FC4", "#4BE846"];
//Yellow, Orange, Red, Pink, Purple, Blue, Green
var yellow = 0, orange = 1, red = 2, pink = 3, purple = 4, blue = 5, green = 6;
var colProb = [2, 3, 2, 4, 3, 5, 2];  //1 - 5
var cpt = colProb[0] + colProb[1] + colProb[2] + colProb[3] + colProb[4] + colProb[5];

var flavColours = ["#FFFFFF", "#FF7F00", "#FFFF00"];
window.mx = 0;
window.my = 0;
window.st = 0;
window.tTemp = undefined;

var px = 3;  //Protected starting area size (no reds and yellows)
var py = 3;


Array.prototype.total = function () { var t = 0; for (x = 0; x < this.length; x++) { t += this[x];} return t; };

function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; } //inclusive

window.tileObject = function (x, y, col) {
  this.x = x;
  this.y = y;
  this.l = "(" + x + ", " + y + ")";
  this.c = col;
  this.i = false;
};

document.onkeydown = keyEvent;

function keyEvent(e) {
  e = e || window.event;
  //console.log(e.keyCode);
  if (e.keyCode == '38' || e.keyCode == '87') {
    move(up);
  }
  else if (e.keyCode == '40' || e.keyCode == '83') {
    move(down);
  }
  else if (e.keyCode == '37' || e.keyCode == '65') {
    move(left);
  }
  else if (e.keyCode == '39' || e.keyCode == '68') {
    move(right);
  }
  else if (e.keyCode == '82') {//r - reload
    //FIRST THING
    clearInterval(mt);
    
    window.tileStats = [];
    window.player = {x: 0, y: 0, flavour: false};
    ptv.style.background = flavColours[0];
    ptv.style.left = "-504px";
    ptv.style.top = "-181px";
    loadTiles(mx, my);
  }
  else if (e.keyCode == '77') {//m - mode
    console.info("M - Mode Switch - This feature has not yet been implemented");
  }
}

function loadEvent() {
  var tileCont = document.getElementById("tileCont");
  window.tileStats = [];
  
  window.getSupportedPropertyName = function (properties) {
    for (var i = 0; i < properties.length; i++) { if (typeof document.body.style[properties[i]] != "undefined") { return properties[i]; } }
    return null;
  };
  window.transform = ["transform", "msTransform", "webkitTransform", "mozTransform", "oTransform"];
  
  window.ptv = document.querySelector("#player"), player = {x: 0, y: 0, flavour: false, locked: false};
  ptv.style.left = "-504px";
  ptv.style.top = "-181px";
  window.left = {x: -20, y: 0}, right = {x: 20, y: 0}, up = {x: 0, y: -20}, down = {x: 0, y: 20};
  window.move = function (direction) {
    if (player.locked) { return false; }
    //MODERN? (CHROME)
    //if (getSupportedPropertyName(transform)) {
    //  ptv.style[getSupportedPropertyName(transform)] = translate3d(direction.x, direction.y, "0px");
    //}
    
    //OLD? (IE)
    player.x += direction.x/20;
    player.y += direction.y/20;
    var f = false, v = -1;
    for (x = 0; x < mx * my && !f; x++) {
      if (tileStats[x].l == "(" + player.x + ", " + player.y + ")") { f = true; v = x; }
    }
    if (f) {
      if (tileStats[v].i) { f = false; }
      else if (player.flavour && tileStats[v].c == tileColours[blue]) { f = false; }
    }
    if (f) {
      player.locked = true;
      window.direction = direction;
      window.ma = 21;
      window.mt = setInterval('ptv.style.left = (parseInt(ptv.style.left.substring(0, ptv.style.left.length - 2)) + (direction.x/20)) + "px"; ptv.style.top = (parseInt(ptv.style.top.substring(0, ptv.style.top.length - 2)) + (direction.y/20)) + "px"; ma--; if (ma <= 1) { player.locked = false; clearInterval(mt); moveCalc(direction, ' + v + '); }', 250/ma);
    } else {
      player.x -= direction.x/20;
      player.y -= direction.y/20;
    }
  };
  window.moveCalc = function (direction, v) {
    if (tileStats[v].c == tileColours[orange]) { player.flavour = true; ptv.style.background = flavColours[1]; }
    else if (tileStats[v].c == tileColours[purple]) { player.flavour = false; ptv.style.background = flavColours[2]; }
    
    if (tileStats[v].c == tileColours[purple]) { move(direction); }
    else if (tileStats[v].c == "#000000") {
      clearInterval(tTemp);
      player.locked = true;
      var pTime = [document.title.split(":")[1].substring(1), document.title.split(":")[2]];
      console.log("Completed in " + (pTime[0] > 0 ? pTime[0] + " minute" + (pTime[0] != 1 ? "s" : "") : "") + (pTime[1] > 0 ? (pTime[0] > 0 ? ", " : "") + pTime[1] + " seconds" : "") + "!");
      document.title = "Oranges: Completed! " + pTime[0] + ":" + pTime[1];
      alert("Completed in " + (pTime[0] > 0 ? pTime[0] + " minute" + (pTime[0] != 1 ? "s" : "") : "") + (pTime[1] > 0 ? (pTime[0] > 0 ? ", " : "") + pTime[1] + " seconds" : "") + "!");
      document.getElementById("player").style.background = "#000000";
    }
  };
  
  loadTiles(25, 10);
}

function loadTiles(xlen, ylen) {
  mx = xlen;
  my = ylen;
  console.log("Oranges: Generating a " + mx + " by " + my + " puzzle...");
  document.title = "Generating Puzzle: 0%";
  tileCont.innerHTML = "";
  
  var array = [];
  for (z = 0; z < colProb.length; z++) { for (a = 0; a < colProb[z]; a++) { array.push(tileColours[z]); } }
  
  for (y = 0; y < ylen; y++) {
    for (x = 0; x < xlen; x++) {
      var col = getRandomInt(1, cpt);
      while (x < px && (x > 0 || y > 0) && y < py && !(array[col] == tileColours[pink] || array[col] == tileColours[green])) {
        col = getRandomInt(1, cpt);
      }
      col = array[col];
      if (x == 0 && y == 0) { col = "#FFFFFF"; }
      if (x == xlen - 1 && y == ylen - 1) { col = "#000000"; }
      tileStats.push(new tileObject(x, y, col));
      tileCont.innerHTML += "<div class='tile' id='(" + x + ", " + y + ")' style='background-color: " + col + ";'></div>";
      document.title = "Generating Puzzle: " + parseInt(y*100/ylen + x*100/ylen/xlen) + "%";
    }
    tileCont.innerHTML += "<br>";
  }
  for (x = 0; x < mx * my; x++) {
    if (tileStats[x].c == tileColours[yellow]) { tileStats[x].i = true; }
    else if (tileStats[x].c == tileColours[red]) { tileStats[x].i = true; }
    else if (tileStats[x].c == tileColours[blue] && (tileStats[tileStats[x - mx] ? x - mx : x].c == tileColours[yellow] ||
                                                     tileStats[tileStats[x + mx] ? x + mx : x].c == tileColours[yellow] || 
                                                     tileStats[tileStats[x - 1] ? x - 1 : x].c == tileColours[yellow] ||
                                                     tileStats[tileStats[x + 1] ? x + 1 : x].c == tileColours[yellow])) {
      tileStats[x].i = true;
    }
  }
  st = new Date();
  tTemp = setInterval("var min=parseInt((new Date().getTime()-st)/60000),sec=parseInt((new Date().getTime()-st)/1000)-(60*min);document.title='Oranges: '+min+':'+(sec<10?'0':'')+sec", 250);
  console.log("Oranges: Puzzle generated! Time started!");
}

function getPuzzle() {
  var cd = document.getElementById("puzzleCode");
  var v = "[";
  for (x = 0; x < tileStats.length; x++) {
    v += "{";
    
    v += "x:" + tileStats[x].x + ",";
    v += "y:" + tileStats[x].y + ",";
    v += "c:" + "'" + tileStats[x].c + "'";
    
    v += "}";
    if (x < tileStats.length - 1) { v += ","; }
  }
  v += "]";
  
  var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890\`\-\=\[\]\\\;\'\,\.\/\~\!\@\#\$\%\^\&\*\(\)\_\+\{\}\|\:\"\<\>\?".split("");
  var t = "";
  for (x = 0; x < v.toString().length; x++) { t += chars[(chars.indexOf(v.toString()[x]) + 18) % chars.length]; }
  v = t;
  
  cd.value = v;
}

function loadPuzzle() {
  var cd = document.getElementById("puzzleCode");
  var v = cd.value;
  var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890\`\-\=\[\]\\\;\'\,\.\/\~\!\@\#\$\%\^\&\*\(\)\_\+\{\}\|\:\"\<\>\?".split("");
  var t = "";
  for (x = 0; x < v.toString().length; x++) { t += chars[(chars.indexOf(v.toString()[x]) - 18 + chars.length) % chars.length]; }
  v = eval(t);
  
  mx = v[v.length - 1].x + 1;
  my = v[v.length - 1].y + 1;
  
  console.log("Oranges: Loading a " + mx + " by " + my + " puzzle...");
  document.title = "Loading Puzzle: 0%";
  tileCont.innerHTML = "";
  tileStats = [];
  
  window.player = {x: 0, y: 0, flavour: false};
  ptv.style.background = flavColours[0];
  ptv.style.left = "-504px";
  ptv.style.top = "-181px";
  
  for (y = 0; y < my; y++) {
    for (x = 0; x < mx; x++) {
      var col = v[y*mx + x].c;
      tileStats.push(new tileObject(x, y, col));
      tileCont.innerHTML += "<div class='tile' id='(" + x + ", " + y + ")' style='background-color: " + col + ";'></div>";
      document.title = "Generating Puzzle: " + parseInt(y*100/my + x*100/my/mx) + "%";
    }
    tileCont.innerHTML += "<br>";
  }
  for (x = 0; x < mx * my; x++) {
    if (tileStats[x].c == tileColours[yellow]) { tileStats[x].i = true; }
    else if (tileStats[x].c == tileColours[red]) { tileStats[x].i = true; }
    else if (tileStats[x].c == tileColours[blue] && (tileStats[tileStats[x - mx] ? x - mx : x].c == tileColours[yellow] ||
                                                     tileStats[tileStats[x + mx] ? x + mx : x].c == tileColours[yellow] || 
                                                     tileStats[tileStats[x - 1] ? x - 1 : x].c == tileColours[yellow] ||
                                                     tileStats[tileStats[x + 1] ? x + 1 : x].c == tileColours[yellow])) {
      tileStats[x].i = true;
    }
  }
  st = new Date();
  tTemp = setInterval("var min=parseInt((new Date().getTime()-st)/60000),sec=parseInt((new Date().getTime()-st)/1000)-(60*min);document.title='Oranges: '+min+':'+(sec<10?'0':'')+sec", 250);
  console.log("Oranges: Puzzle loaded! Time started!");
}
