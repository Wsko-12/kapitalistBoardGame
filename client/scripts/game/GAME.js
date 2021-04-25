import {
  socket
} from "/scripts/socketInit.js";
import {
  PLAYER,
} from "/scripts/accPage.js";





import * as BUILD from './modules/build.js';
import * as SENDING from './modules/sendings.js';
import * as GENERATION from './modules/generation.js';
import * as APPLY_BUILD from './modules/applyBuild.js';
import * as TURNS from './modules/turns.js';
import * as SCENE from "./modules/scene.js";
import * as UI from './GAME_UI.js';
import * as MAP_SETTINGS from "/scripts/gameSettings/map.js";







let GAME = {};

function getPositionByIndex(z,x){
  const RADIUS = MAP_SETTINGS.RADIUS;
  const ROUNDS = MAP_SETTINGS.ROUNDS;
  const position = {
    x:0,
    y:0,
    z:0,
  }
    //строим по оси z
  if(z % 2){
    //для нечетных по z
    position.z = (RADIUS + RADIUS/2) * z;
  }else{
    //для четных  по z
    position.z = (RADIUS + RADIUS/2) * z;
  }
  //строим левый край всей карты
  position.x += 0.86602540378 * RADIUS * Math.abs(z-ROUNDS);

  //выстраиваем их по x
  position.x += 0.86602540378 * RADIUS*2 * x;

  //центрируем всю карту по x
  position.x -= 0.86602540378 * RADIUS*2*ROUNDS;

  //центрируем всю карту по z
  position.z -= (RADIUS + RADIUS/2)*ROUNDS;


  return position;
};



function buildGameStart(roomID){
  GAME = {};
  socket.emit('GAME_buildGame',roomID);
};


function rebuildGame(gameID){
  const pack = {
    game:gameID,
    login:PLAYER.login,
  }
  socket.emit('GAME_rebuild',pack);
};



















document.addEventListener("DOMContentLoaded", function(){

  socket.on('GAME_buildGame_Continue',function(gameClient){
    BUILD.continueBuild(gameClient);
  });

  socket.on('GAME_buildGame_UserEntered',function(playersInGame){
    BUILD.userEntered(playersInGame);
  });
  socket.on('GAME_buildGame_Finish',function(){
    BUILD.finish();
  });

  socket.on('GAME_generating_Start',function(){
    GENERATION.start();
  });






  socket.on('GAME_rebuild_getInfo',function(pack){
    SENDING.SEND_ALL(pack);
  });

  socket.on('GAME_rebuild_finish',function(returnGamePack){
    SENDING.APPLY_ALL(returnGamePack);
  });



  socket.on('GAME_turns_start',function() {
    TURNS.start();
  });
  socket.on('GAME_turns_currentTurn',function(player){
    GAME.turns.currentTurn = player;
  });




  socket.on('GAME_gamePlay_buildRoad',function(pack){
    APPLY_BUILD.buildRoad(pack);
  });
  socket.on('GAME_gamePlay_buildFactory',function(pack){
    APPLY_BUILD.buildFactory(pack);
  });
  socket.on('GAME_gamePlay_applyProductionTurn',function(player){
    SENDING.applyProductionTurn(player);
  });

  socket.on('GAME_gamePlay_applyCityConsumptionTurn',function(){
    SENDING.applyCityConsumptionTurn();
  });



  socket.on('GAME_inGame_Disconected',function(disconLogin){
    delete GAME.playersInGame[disconLogin];
    SCENE.takeSitPlace();
    SCENE.BUILD_PLAYERS_MESH.build();
    UI.playersNamesSection.rebuildDives();

  });
  socket.on('GAME_inGame_Conected',function(conLogin){
    GAME.playersInGame[conLogin] = conLogin;
    SCENE.takeSitPlace();
    SCENE.BUILD_PLAYERS_MESH.build();
    UI.playersNamesSection.rebuildDives();



  });


});

export{
  buildGameStart,rebuildGame,GAME,getPositionByIndex
};
