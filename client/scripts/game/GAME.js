import {
  socket
} from "/scripts/socketInit.js";
import {
  PLAYER,
} from "/scripts/accPage.js";





import * as BUILD from './modules/build.js';
import * as SENDING from './modules/sendings.js';
import * as GENERATION from './modules/generation.js'
import * as SCENE from "./modules/scene.js";






let GAME = {};





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







  socket.on('GAME_inGame_Disconected',function(disconLogin){
    delete GAME.playersInGame[disconLogin];
    SCENE.takeSitPlace();
  });
  socket.on('GAME_inGame_Conected',function(conLogin){
    GAME.playersInGame[conLogin] = conLogin;
    SCENE.takeSitPlace();
  });


});

export{
  buildGameStart,rebuildGame,GAME,
};
