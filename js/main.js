"use strict";

const FONT_FAMILY = 'bbt';
const FONT_SIZE = 128;
const SCREEN_WIDTH = 80;
const SCREEN_HEIGHT = 24;
const MAP_WIDTH = 60;
const MAP_HEIGHT = 22;
const MAX_TOTAL_ENTS = 800;
const MAP_SEEDS = [12345,
                   54321,
                   1234,
                   4321];
const MAX_FOV = 13;
let memMap = powerArray(MAP_WIDTH, MAP_HEIGHT, MAP_SEEDS.length-1);
for (var x = 0; x < MAP_WIDTH; x++)
  for (var y = 0; y < MAP_HEIGHT; y++)
    for (var z = 0; z < MAP_SEEDS.length-1; z++)
      memMap[x][y][z] = false;
let map = {};
let data = {};
let entities = [];
let showNonFovMap = false;
let showNonFovEnts = false;
let showMemMap = true;
var display = new ROT.Display({width:SCREEN_WIDTH, height:SCREEN_HEIGHT, fontSize:FONT_SIZE, fontFamily: FONT_FAMILY});
var container = display.getContainer();
document.body.appendChild(container);

function main() {
  generateMap(MAP_SEEDS[0], map);
  let player = new Entity(1, 1, 0, 0, 2, 1, 'white', 'black', '\u263A', 1);
  entities.push(player);
  var npc;
  for (var i = 0; i <= MAX_TOTAL_ENTS; i++) {
    var x = ROT.RNG.getUniformInt(1, MAP_WIDTH-2);
    var y = ROT.RNG.getUniformInt(1, MAP_HEIGHT-2);
    var z = 0;
    var mapI = ROT.RNG.getUniformInt(0, MAP_SEEDS.length-1);
    var height = 2;//could use floats if implemented. > getRandomArbitrary(0.1, 99.99);
    var width = 1;//could use floats if implemented. > getRandomArbitrary(0.1, 99.99);
    var fovRange = -1;
    npc = new Entity(x, y, z, mapI, height, width, 'white', 'black', '\u263B', fovRange);
    entities.push(npc);
  };
  var fov = new ROT.FOV.PreciseShadowcasting(lightPasses);
  renderGame(fov, entities);
  document.querySelector("html").onkeypress = function(e){
    display.clear();
    if(e.key=="w") {
      if (lightPasses(player.x, player.y-1)) {
        player.y--;
      };
    }
    else if(e.key=="s") {
      if (lightPasses(player.x, player.y+1)) {
        player.y++;
      };
    }
    else if(e.key=="a") {
      if (lightPasses(player.x-1, player.y)) {
        player.x--;
      };
    }
    else if(e.key=="d") {
      if (lightPasses(player.x+1, player.y)) {
        player.x++;
      };
    }
    else if(e.key=="q") {
      if (lightPasses(player.x-1, player.y-1)) {
        player.x--;
        player.y--;
      };
    }
    else if(e.key=="e") {
      if (lightPasses(player.x+1, player.y-1)) {
        player.x++;
        player.y--;
      };
    }
    else if(e.key=="z") {
      if (lightPasses(player.x-1, player.y+1)) {
        player.x--;
        player.y++;
      };
    }
    else if(e.key=="x") {
      if (lightPasses(player.x+1, player.y+1)) {
        player.x++;
        player.y++;
      };
    }
    else if(e.key=="1") {
      if (player.mapI > 0) {
        generateMap(MAP_SEEDS[player.mapI-1], map), player.mapI--;
      };
    }
    else if(e.key=="2") {
      if (player.mapI < MAP_SEEDS.length-1) {
        generateMap(MAP_SEEDS[player.mapI+1], map), player.mapI++;
      };
    }
    else if (e.key=="3") {
      if (showNonFovMap == false) showNonFovMap = true;
      else showNonFovMap = false;
    }
    else if (e.key=="4") {
      if (showNonFovEnts == false) showNonFovEnts = true;
      else showNonFovEnts = false;
    }
    else if (e.key=="5") {
      if (showMemMap == false) showMemMap = true;
      else showMemMap = false;
    }
    else if (e.key=="6") {
      if (player.fovRange < MAX_FOV) player.fovRange++;
    }
    else if (e.key=="7") {
      if (player.fovRange > 0) player.fovRange--;
    }
    renderGame(fov, entities);
  };
};

function drawFovMap(map, display) {
   for (var key in map) {
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    display.draw(x, y, map[key]);
  };
};

function drawMemMap(map, display) {
   for (var key in map) {
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    if (memMap[x][y][entities[0].mapI])
      display.draw(x, y, map[key]);
  };
};

function renderGame(fov, entities) {
  if (showNonFovMap) drawFovMap(map, display);
  if (showMemMap) drawMemMap(map, display);
  if (showNonFovEnts)
    for (var i = entities.length-1; i >= 1; i--) {
      if (entities[i].mapI == entities[0].mapI)
      display.drawText(entities[i].x, entities[i].y, "%c{"+entities[i].fgColour+"}%b{"+entities[i].bgColour+"}"+entities[i].glyph);
    };
  fov.compute(entities[0].x, entities[0].y, entities[0].fovRange, function(x, y, r, visibility) {
    var ch = (r ? map[x+","+y] : entities[0].glyph);
    var color = (data[x+","+y] ? "#333": "#666");
    display.draw(x, y, ch, '#fff', color);
    memMap[x][y][entities[0].mapI] = true;
    for (var i = entities.length-1; i >= 0; i--) {
      if (entities[i].x == x && entities[i].y == y && entities[i].mapI == entities[0].mapI)
      display.drawText(entities[i].x, entities[i].y, "%c{"+entities[i].fgColour+"}%b{"+entities[i].bgColour+"}"+entities[i].glyph);
    };
  });
};

function generateMap(seed, map) {
  ROT.RNG.setSeed(seed);
  var w = MAP_WIDTH;
  var h = MAP_HEIGHT;
  var digger = new ROT.Map.Digger(w, h);
  var dm = new ROT.Map.DividedMaze(w, h);
  var callback1 = function(x, y, value) {
    var key = x+","+y;
    data[x+","+y] = value;
    if (value) {
      map[key] = "\u2591"; }
    else {
      map[key] = ".";
    };
  };
  var callback2 = function(x, y, value) {
    var key = x+","+y;
    data[x+","+y] = value;
    if (value) {
      map[key] = "\u2592"; }
    else {
      map[key] = "*";
    };
  };
  //digger.create(callback1.bind(this)); 
  dm.create(callback1.bind(this));
};

function lightPasses(x, y) {
  var key = x+","+y;
  if (key in data) { return (data[key] == 0); }
  return false;
};

function powerArray(length) {
  let array = new Array(length ?? 0)
  let i = length;
  // If the parameters are more than one, we iterate over them one by one 
  // and using line 2 of this function, we create inner arrays.
  if (arguments.length > 1) {  
    let dimensions = Array.prototype.slice.call(arguments, 1);
    // We recall the `powerArray` function for the rest of the parameters / dimensions.
    while(i--) array[length - 1 - i] = powerArray.apply(this, dimensions);
  };
  return array;
};

/*
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
};
*/
main();