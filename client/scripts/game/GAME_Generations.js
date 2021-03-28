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
import * as SCENE from "/scripts/game/GAME_Scene.js"
import * as MAP_SETTINGS from "/scripts/gameSettings/map.js"









function GAME_GENERATION(){
    Generation_Turns();
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



function ApplyTurnsPack(pack){
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

function ApplyMapLineArr(MapLineArr,Regenerate){
  GAME.map.mapLine = MapLineArr;
  MakeMapNamesArr(MapLineArr,Regenerate);
};


function MakeMapNamesArr(MapLineArr,Regenerate){
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
  MakeMapFlagsArr(mapNamesArr,Regenerate);
};

function MakeMapFlagsArr(mapNamesArr,Regenerate){
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
  MakeCitiesDesignate(mapNamesArr,Regenerate);
};




function MakeCitiesDesignate(mapNamesArr,Regenerate){
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
    socket.emit('GAME_REgenerating_Finished',pack);
  }else{
    socket.emit('GAME_generating_Finished',pack)
  };
};


document.addEventListener("DOMContentLoaded", function(){

  socket.on('GAME_generating_Turns_True',function(pack){
    ApplyTurnsPack(pack);
  });

  socket.on('GAME_generating_MapLine',function(){
    Generation_MapLineArr();
  });

  socket.on('GAME_generating_MapLine_True',function(MapLineArr){
    ApplyMapLineArr(MapLineArr,false);
  });


  socket.on('GAME_scene_Start',function(){
    SCENE.GAME_Scene_Init();
  });

  socket.on('GAME_scene_RegenerateStart',function(){
    SCENE.GAME_Scene_Init();
  });



});
export{
  GAME_GENERATION,
  ApplyMapLineArr,
};
