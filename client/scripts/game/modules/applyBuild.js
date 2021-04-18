import * as UI from '/scripts/game/GAME_UI.js';
import {
  socket
} from "/scripts/socketInit.js";
import {
  GAME
} from "/scripts/game/GAME.js";
import * as SCENE from "./scene.js";
import {
  PLAYER,
} from "/scripts/accPage.js";
import * as GAME_CONTENT from '/scripts/gameSettings/content.js';
import * as SENDING from './sendings.js';





function buildRoad(pack){

  GAME.playersJoined[pack.player].balance -= GAME_CONTENT.ROAD_COAST;
  UI.balanceSection.updateBalance();

  GAME.map.mapFlagsArr[pack.indexses[0]][pack.indexses[1]] = 3;

  const roadObj = {
    type:'road',
    indexses:pack.indexses,
    id:pack.id,
  };

  GAME.map.stativeObjects.push(roadObj);

  SCENE.buildGameObject.road(pack);

};

export{
  buildRoad,
}
