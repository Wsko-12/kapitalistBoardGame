import {
  socket
} from "/scripts/socketInit.js";
import {
  sendNotification
} from "/scripts/notifications.js";
import {
  PLAYER,
  ACC_buildPage,
  clearButtons
} from "/scripts/accPage.js";
import {GAME}from "/scripts/game/GAME.js"
import * as MAP_SETTINGS from "/scripts/gameSettings/map.js"
import * as GLOBAL_GAME_SETTINGS from "/scripts/gameSettings/GLOBAL_GAME_SETTINGS.js"








function GAME_GENERATION(){
    Generation_Turns();
   // buildTurns();
   // generateMap();
   // generateSeating();
};

function Generation_Turns(){
  const pack = {
    game:GAME.id,
    turns:{
      line:[],
      index:0,
    },
  };
  for(let player in GAME.playersJoined){
    pack.turns.line.push(player);
  };
  socket.emit('GAME_generating_Turns',pack);
};



function ApplyTurnsPack(pack,){
  GAME.turns = pack;
};


function Generation_MapLineArr(){
  const MapLineArr = [];
  for(let cell in MAP_SETTINGS.MAP_CELL_AMOUNT){
    for(let count = 0; count < MAP_SETTINGS.MAP_CELL_AMOUNT[cell];count++){
			MapLineArr.push(cell)
		};
  };
  function makeRandomArr(a, b) {
  		return Math.random() - 0.5;
	}
  MapLineArr.sort(makeRandomArr);

  const pack = {
    game: GAME.id,
    MapLineArr:MapLineArr,
  };

  socket.emit('GAME_generating_MapLine_Generated',pack);
};

function ApplyMapLineArr(MapLineArr){
  GAME.map.mapLine = MapLineArr;
  MakeMapNamesArr(MapLineArr);
};


function MakeMapNamesArr(MapLineArr){
  let mapNamesArr = [];
  for(let z = 0;z<MAP_SETTINGS.MAP_NULL_ARR.length;z++){
    mapNamesArr.push([]);
    for(let x=0;x<MAP_SETTINGS.MAP_NULL_ARR[z].length;x++){
      mapNamesArr[z].push(0);
    };
  };
  let mapArrNames_index = 0;
  for(let z=0;z<mapNamesArr.length;z++){
      for(let x = 0; x < mapNamesArr[z].length;x++){
        mapNamesArr[z][x] = MapLineArr[mapArrNames_index];
        mapArrNames_index++;
      };
  };
  GAME.map.mapNamesArr = mapNamesArr;
  MakeMapFlagsArr(mapNamesArr);
};

function MakeMapFlagsArr(mapNamesArr){
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
         case 'MetallPlant':
         case 'ChemicalPlant' :
         case 'PaperPlant' :
         case 'GlassPlant' :
         case 'BuildingPlant' :
         case 'FurniturePlant':
               flag = 4;
           break;

       };
       mapFlagsArr[z].push(flag);
    };
  };
  GAME.map.mapFlagsArr = mapFlagsArr;
  MakeCitiesDesignate(mapNamesArr);
};




function MakeCitiesDesignate(mapNamesArr){
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

  makeMapBuildings();
};
function makeMapBuildings(){
  const buildingsArr = []
  for(let z = 0;z<MAP_SETTINGS.MAP_NULL_ARR.length;z++){
    buildingsArr.push([]);
    for(let x=0;x<MAP_SETTINGS.MAP_NULL_ARR[z].length;x++){
      buildingsArr.push(0);
    };
  };



  for(let z = 0; z < mapNamesArr.length;z++){
    for(let x = 0; x < mapNamesArr[z].length;x++){
      if(mapNamesArr[z][x] === 'MetallPlant'){
        buildProcessingFactory('MetallPlant',z,x);
      };
      if(mapNamesArr[z][x] === 'ChemicalPlant'){
        buildProcessingFactory('ChemicalPlant',z,x);
      };
      if(mapNamesArr[z][x] === 'PaperPlant'){
        buildProcessingFactory('PaperPlant',z,x);
      };
      if(mapNamesArr[z][x] === 'GlassPlant'){
        buildProcessingFactory('GlassPlant',z,x);
      };
      if(mapNamesArr[z][x] === 'BuildingPlant'){
        buildProcessingFactory('BuildingPlant',z,x);
      };
      if(mapNamesArr[z][x] === 'FurniturePlant'){
        buildProcessingFactory('FurniturePlant',z,x);
      };
    };
  };


  function buildProcessingFactory(type,z,x){






  };







};












// function generateSeating(){
//   let count = Object.keys(GAME.playersInGame).length;
//   let index = 0;
//   for(let player in GAME.playersInGame){
//     GAME.playersInGame[player] = {};
//     GAME.playersInGame[player].position = {};
//     GAME.playersInGame[player].position.x = MAP_SETTINGS.USER_SIT_POSITIONS[count][index].x;
//     GAME.playersInGame[player].position.z = MAP_SETTINGS.USER_SIT_POSITIONS[count][index].z;
//     index++;
//   };
//
//   const pack = {
//     game: GAME.id,
//     sits:GAME.playersInGame,
//   }
//   socket.emit('GAME_seatings_Generated',pack);
//
//   if(!GAME.generated){
//     socket.emit('GAME_GENERATED',GAME.id);
//   }
// };


function buildTurns(){
  const usersTurns = {
    line:[],
    tern:0,
  };
  for(let player in GAME.playersJoined){
    usersTurns.line.push(player);
  };
  let pack = {
    game:GAME.id,
    turns:usersTurns,
  }
  socket.emit('GAME_turns_Buildet',pack);
};
function generateMap(){
  const mapArrNames = [];
  for(let cell in MAP_SETTINGS.MAP_CELL_AMOUNT){
    for(let count = 0; count < MAP_SETTINGS.MAP_CELL_AMOUNT[cell];count++){
			mapArrNames.push(cell)
		};
  };
  function makeRandomArr(a, b) {
  		return Math.random() - 0.5;
	}
  mapArrNames.sort(makeRandomArr);


  const MAP_ARR = [];
  let mapArrNames_index = 0;
  for(let zIndex = 0; zIndex < MAP_SETTINGS.MAP_NULL_ARR.length;zIndex++){
    MAP_ARR.push([]);
    for(let xIndex = 0; xIndex < MAP_SETTINGS.MAP_NULL_ARR[zIndex].length;xIndex++){
      MAP_ARR[zIndex].push(mapArrNames[mapArrNames_index]);
      mapArrNames_index++;
    };
  };

  let generatedMapPack = {
    game:GAME.id,
    map:MAP_ARR,
  };
  socket.emit('GAME_map_Generated',generatedMapPack);
};

function buildMapFlagsArr(MapArr){
  const MAP_FLAGS_ARR = [];
  for(let zIndex = 0; zIndex < MapArr.length;zIndex++){
    MAP_FLAGS_ARR.push([]);
    for(let xIndex = 0; xIndex < MapArr[zIndex].length;xIndex++){
      let flag;
      switch (MapArr[zIndex][xIndex]) {
        case 'sand_block' :
        case 'mountain_block' :
        case 'swamps_block':
        case 'sea_block':
          flag = 1;
          break;
        case 'city':
            flag = 0;
            break;
        case 'meadow':
        case 'sand' :
        case 'forest' :
        case 'mountain' :
        case 'swamps' :
        case 'sea':
              flag = 2;
        break;
      };
      MAP_FLAGS_ARR[zIndex].push(flag);
    };
  };


  GAME.map.flags = MAP_FLAGS_ARR;

};
function disignateCities(){
  let cityCounter = 0;
  for(let zIndex = 0; zIndex < GAME.map.names.length;zIndex++){
    for(let xIndex = 0; xIndex < GAME.map.names[zIndex].length;xIndex++){
      if(GAME.map.names[zIndex][xIndex] === 'city'){
        GAME.map.cities[MAP_SETTINGS.MAP_CITIES[cityCounter]][0] = zIndex;
        GAME.map.cities[MAP_SETTINGS.MAP_CITIES[cityCounter]][1] = xIndex;
        cityCounter++
      };
    };
  };
  let pack = {
    game: GAME.id,
    citiesObj: GAME.map.cities
  };
  socket.emit('GAME_starting_designateСities_True',pack)
};

document.addEventListener("DOMContentLoaded", function(){

  socket.on('GAME_generating_Turns_True',function(pack){
    ApplyTurnsPack(pack);
  });

  socket.on('GAME_generating_MapLine',function(){
    Generation_MapLineArr();
  });

  socket.on('GAME_generating_MapLine_True',function(MapLineArr){
    ApplyMapLineArr(MapLineArr);
  });





  // socket.on('GAME_map_Generated_True',function(MapArr){
  //     GAME.map.names = MapArr;
  //     buildMapFlagsArr(MapArr);
  // });
  // socket.on('GAME_starting_designateСities',function(){
  //   disignateCities();
  // });
  //
  // socket.on('GAME_starting_designateСities_True_True',function(citiesObj){
  //   GAME.map.cities = citiesObj;
  // });
  //
  // socket.on('GAME_seatings_Generated_True',function(playerSits){
  //   GAME.playersInGame = playerSits;
  //   console.log(GAME);
  // });
  // socket.on('GAME_seatings_Regenerate',function(){
  //   generateSeating();
  // });
  //
  // socket.on('GAME_GENERATED_True',function(){
  //   GAME.generated = true;
  // });



});
export{
  GAME_GENERATION,
};
