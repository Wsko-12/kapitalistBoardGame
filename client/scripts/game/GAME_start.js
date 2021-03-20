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

let GAME = {};





function GAME_start(roomID){
  socket.emit('GAME_starting',roomID);
};
document.addEventListener("DOMContentLoaded", function(){

socket.on('GAME_starting_True',function(gameNULL){
  const GAME_WAIT_DIV = `
    <div style="margin:auto" id="GameWaitingNotificationDiv">
    </div>

  `
  document.querySelector("#body").innerHTML = '';
  document.querySelector("#body").insertAdjacentHTML('beforeEnd',GAME_WAIT_DIV);

  GAME = gameNULL;
  const EnterGamePack = {
    login:PLAYER.login,
    game:GAME.id,
  };
  socket.emit('GAME_starting_EnterGame',EnterGamePack)
  let waitingString = "waiting:";
  for(let player in GAME.playersJoined){
    waitingString += player+',';
  };

  document.querySelector('#GameWaitingNotificationDiv').innerHTML = waitingString;
});



  socket.on('GAME_starting_UserEntered',function(playersInGame){
    GAME.playersInGame = playersInGame;
    console.log(GAME);
    let waitingString = "waiting:";
    for(let player in GAME.playersJoined){
      if(!GAME.playersInGame[player]){
        waitingString += player+',';
      };
    };


    document.querySelector('#GameWaitingNotificationDiv').innerHTML = waitingString;

  });

  socket.on('GAME_StartGenerateGame',function(){
    console.log('start generate');
  });


});

export{
  GAME_start
};
