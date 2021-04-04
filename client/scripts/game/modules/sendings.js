import {
  socket
} from "/scripts/socketInit.js";
import {
  PLAYER
} from "/scripts/accPage.js";
import {GAME}from "/scripts/game/GAME.js";
import {
  applyMapLineArr
} from "./generation.js";


function SEND_ALL(pack){
  pack.gameInfo = {};
  pack.gameInfo.playersJoined = GAME.playersJoined;
  pack.gameInfo.playersInGame = GAME.playersInGame;
  //....
  //дописать что надо будет выслать еще

  socket.emit('GAME_rebuild_sendInfo',pack);

};

function APPLY_ALL(returnGamePack){
  for(let key in returnGamePack){
    GAME[key] = returnGamePack[key];
  };
  console.log(GAME)
  GAME.playersInGame[PLAYER.login] = {login:PLAYER.login};
  applyMapLineArr(returnGamePack.map.mapLine,true);
};




export{
  SEND_ALL,APPLY_ALL
}
