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
import * as SCENE from "./scene.js";


function SEND_ALL(pack){
  pack.gameInfo = {};
  pack.gameInfo.playersJoined = GAME.playersJoined;
  pack.gameInfo.playersInGame = GAME.playersInGame;
  pack.gameInfo.mapStativeObjects = GAME.map.stativeObjects;
  //....
  //дописать что надо будет выслать еще

  socket.emit('GAME_rebuild_sendInfo',pack);

};

function APPLY_ALL(returnGamePack){
  for(let key in returnGamePack){
    GAME[key] = returnGamePack[key];
  };
  GAME.playersInGame[PLAYER.login] = {login:PLAYER.login};
  applyMapLineArr(returnGamePack.map.mapLine,true);


  
};






function roadBuilding(pack){
  const sendPack = {
    pack:pack,
    gameID:GAME.id,
  };
  socket.emit('GAME_gamePlay_roadBuild',sendPack);
};



export{
  SEND_ALL,APPLY_ALL,roadBuilding
}
