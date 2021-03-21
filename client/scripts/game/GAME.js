import {
  socket
} from "/scripts/socketInit.js";
import {
  sendNotification
} from "/scripts/notifications.js";
import {
  GAME_GENERATION
}from "/scripts/game/GAME_Generations.js";
import {
  PLAYER,
  ACC_buildPage,
  clearButtons
} from "/scripts/accPage.js";

let GAME = {};





function GAME_START(roomID){
  socket.emit('GAME_starting',roomID);
};

function waitingScreen(on){
  const screen = `
  <div id="waitingGameScreen">
    <div id="waitingGameScreen_Titile">Waiting Players:</div>
    <div id="waitingGameScreen_Players"></div>
  </div>`
  if(on){
    document.querySelector('#body').innerHTML = screen;
    for(let player in GAME.playersJoined){
      if(GAME.playersInGame[player] === undefined){
        document.querySelector('#waitingGameScreen_Players').innerHTML += player + ', ';
      };
    };

  }else{
    document.querySelector('#body').innerHTML = '';
  };
};


function GameStart_Start(gameClient){
  waitingScreen(true);
  GAME = gameClient;
  const EnterGamePack = {
    login:PLAYER.login,
    game:GAME.id,
  };
  socket.emit('GAME_starting_EnterGame',EnterGamePack)
};

function GameStart_EnterPlayer(playersInGame){
  GAME.playersInGame = playersInGame;
  waitingScreen(true);
};


function GameStart_End(){
  GAME.started = true;
  waitingScreen(false);
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

  socket.on('GAME_inGame_Disconected',function(disconLogin){
    delete GAME.playersInGame[disconLogin];
  });

});

export{
  GAME_START,GAME
};
