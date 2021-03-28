import {
  socket
} from "/scripts/socketInit.js";
import {
  sendNotification
} from "/scripts/notifications.js";
import {
  GAME_GENERATION
}from "/scripts/game/GAME_Generations.js";
import * as SENDING from "/scripts/game/GAME_Sendings.js";
import {
  PLAYER,
  ACC_buildPage,
  clearButtons
} from "/scripts/accPage.js";
import * as SCENE from "/scripts/game/GAME_Scene.js"

let GAME = {};





function GAME_START(roomID){
  socket.emit('GAME_starting',roomID);
};

function GameStart_Start(gameClient){
  GAME = gameClient;
  const EnterGamePack = {
    login:PLAYER.login,
    game:GAME.id,
  };
  socket.emit('GAME_starting_EnterGame',EnterGamePack)
};

function GameStart_EnterPlayer(playersInGame){
  GAME.playersInGame = playersInGame;

  for(let player in GAME.playersInGame){
    delete GAME.playersInGame[player].generatedStatus;
  };
};


function GameStart_End(){
  GAME.started = true;
};



function GAME_RETURN(gameID){
  const pack = {
    game:gameID,
    login:PLAYER.login,
  }
  socket.emit('GAME_return',pack);
};



















document.addEventListener("DOMContentLoaded", function(){

  socket.on('GAME_starting_True',function(gameClient){
    GameStart_Start(gameClient);
  });

  socket.on('GAME_starting_UserEntered',function(playersInGame){
    GameStart_EnterPlayer(playersInGame);
  });
  socket.on('GAME_starting_End',function(){
    GameStart_End();
  });

  socket.on('GAME_generating_Start',function(){
    GAME_GENERATION();
  });






  socket.on('GAME_return_GetInfo',function(pack){
    SENDING.SEND_ALL(pack);
  });

  socket.on('GAME_return_firstStep',function(returnGamePack){
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
  GAME_START,GAME,GAME_RETURN,
};
