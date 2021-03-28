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
import {GAME}from "/scripts/game/GAME.js";
import {
  ApplyMapLineArr
}from "/scripts/game/GAME_Generations.js";


function SEND_ALL(pack){
  pack.gameInfo = {};
  pack.gameInfo.playersJoined = GAME.playersJoined;
  pack.gameInfo.playersInGame = GAME.playersInGame;
  //....
  //дописать что надо будет выслать еще

  socket.emit('GAME_return_GetInfo_True',pack);


};

function APPLY_ALL(returnGamePack){
  for(let key in returnGamePack){
    GAME[key] = returnGamePack[key];
  };
  ApplyMapLineArr(returnGamePack.map.mapLine,true);
};




export{
  SEND_ALL,APPLY_ALL
}
