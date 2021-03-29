import {
  socket
} from '/scripts/socketInit.js';
import {
  PLAYER,
} from '/scripts/accPage.js';
import {
  GAME
} from '/scripts/game/GAME.js';

import * as MAP_SETTINGS from '/scripts/gameSettings/map.js';

import * as SCENE from "./scene.js"


function start() {
  generateTurns();
};

function generateTurns() {
  const pack = {
    game: GAME.id,
    turns: {
      line: [],
      index: 0,
    },
  };
  for (let player in GAME.playersJoined) {
    pack.turns.line.push(player);
  };
  socket.emit('GAME_generating_turns', pack);
};

function generateMapLineArr() {
  const MapLineArr = [];
  for (let cell in MAP_SETTINGS.MAP_CELL_AMOUNT) {
    for (let count = 0; count < MAP_SETTINGS.MAP_CELL_AMOUNT[cell]; count++) {
      MapLineArr.push(cell)
    };
  };

  function makeRandomArr(a, b) {
    return Math.random() - 0.5;
  }
  MapLineArr.sort(makeRandomArr);

  const pack = {
    game: GAME.id,
    MapLineArr: MapLineArr,
  };

  socket.emit('GAME_generating_mapLineGenerated', pack);
};

function applyTurns(pack) {
  GAME.turns = pack;
};

function applyMapLineArr(MapLineArr, Regenerate) {
  GAME.map.mapLine = MapLineArr;
  buildMapNamesArr(MapLineArr, Regenerate);
};




function buildMapNamesArr(MapLineArr, Regenerate) {
  let mapNamesArr = [];
  for (let z = 0; z < MAP_SETTINGS.MAP_NULL_ARR.length; z++) {
    mapNamesArr.push([]);
    for (let x = 0; x < MAP_SETTINGS.MAP_NULL_ARR[z].length; x++) {
      mapNamesArr[z].push(0);
    };
  };
  let mapArrNames_index = 0;
  for (let z = 0; z < mapNamesArr.length; z++) {
    for (let x = 0; x < mapNamesArr[z].length; x++) {
      mapNamesArr[z][x] = MapLineArr[mapArrNames_index];
      mapArrNames_index++;
    };
  };
  GAME.map.mapNamesArr = mapNamesArr;
  buildMapFlagsArr(mapNamesArr,Regenerate);
};

function buildMapFlagsArr(mapNamesArr,Regenerate){
  const mapFlagsArr = [];
  for(let z=0;z<mapNamesArr.length;z++){
    mapFlagsArr.push([]);
    for(let x=0;x<mapNamesArr[z].length;x++){
      let flag;
       switch (mapNamesArr[z][x]) {
         case 'city':
               flag = 0;
           break;
         case 'sand_block' :
         case 'mountain_block' :
         case 'swamps_block':
         case 'sea_block':
              flag = 1;
           break;
         case 'meadow':
         case 'sand' :
         case 'forest' :
         case 'mountain' :
         case 'swamps' :
         case 'sea':
               flag = 2;
           break;
         // case 'MetallPlant':
         // case 'ChemicalPlant' :
         // case 'PaperPlant' :
         // case 'GlassPlant' :
         // case 'BuildingPlant' :
         // case 'FurniturePlant':
         //       flag = 4;
         //   break;

       };
       mapFlagsArr[z].push(flag);
    };
  };
  GAME.map.mapFlagsArr = mapFlagsArr;
  buildCitiesDesignate(mapNamesArr,Regenerate);
};




function buildCitiesDesignate(mapNamesArr,Regenerate){
  let cityCounter = 0;
  for(let z = 0; z <mapNamesArr.length;z++){
    for(let x = 0; x < mapNamesArr[z].length;x++){
      if(mapNamesArr[z][x] === 'city'){
        GAME.map.cities[MAP_SETTINGS.MAP_CITIES[cityCounter]].z = z;
        GAME.map.cities[MAP_SETTINGS.MAP_CITIES[cityCounter]].x = x;
        cityCounter++
      };
    };
  };
  const pack = {
    login:PLAYER.login,
    game:GAME.id,
  }
  GAME.generated = true;


  if(Regenerate){
    socket.emit('GAME_rebuild_finished',pack);
  }else{
    socket.emit('GAME_generating_finished',pack)
  };
};





document.addEventListener("DOMContentLoaded", function() {
  socket.on('GAME_generating_generateMapLine', function() {
    generateMapLineArr();
  });

  socket.on('GAME_generating_applyTurns', function(pack) {
    applyTurns(pack);
  });


  socket.on('GAME_generating_applyMapLine', function(MapLineArr) {
    applyMapLineArr(MapLineArr, false);
  });


  socket.on('GAME_scene_Start', function() {
    SCENE.initializeScene();
  });

  socket.on('GAME_scene_RegenerateStart', function() {
    SCENE.initializeScene();
  });



});

export {
  start,
  applyMapLineArr,
}
