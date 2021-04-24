import {
  socket
} from "/scripts/socketInit.js";
import {
  PLAYER
} from "/scripts/accPage.js";
import {
  GAME
} from "/scripts/game/GAME.js";
import {
  applyMapLineArr
} from "./generation.js";
import * as SCENE from "./scene.js";
import{
  playerFactoryObj
} from './applyBuild.js';
import * as UI from '/scripts/game/GAME_UI.js';


function SEND_ALL(pack) {
  pack.gameInfo = {};

  pack.gameInfo.playersJoined = GAME.playersJoined;
  pack.gameInfo.playersInGame = GAME.playersInGame;
  pack.gameInfo.mapStativeObjects = GAME.map.stativeObjects;


  pack.gameInfo.gameBank = GAME.gameBank;
  if(Object.keys(GAME.gameBank).length === 0){
    pack.gameInfo.gameBank = 'empty';
  }
  //....
  //дописать что надо будет выслать еще
  socket.emit('GAME_rebuild_sendInfo', pack);
};

function APPLY_ALL(returnGamePack) {
  for (let key in returnGamePack) {
    GAME[key] = returnGamePack[key];
  };
  GAME.playersInGame[PLAYER.login] = {
    login: PLAYER.login
  };
  applyMapLineArr(returnGamePack.map.mapLine, true);




  //востанавливаемм сохраненные классы
  for(let player in GAME.playersJoined){
    for(let factory in GAME.playersJoined[player].factories.processing){
      const savedProcess = GAME.playersJoined[player].factories.processing[factory].process;
      const savedStorage = GAME.playersJoined[player].factories.processing[factory].storage;


      //имитация пака, типа он пришел с сервера во время игры
      const packImitation = {
        factoryType:GAME.playersJoined[player].factories.processing[factory].factoryType,
        id:GAME.playersJoined[player].factories.processing[factory].id,
        owner:GAME.playersJoined[player].factories.processing[factory].owner,
      }
      GAME.playersJoined[player].factories.processing[factory] = new playerFactoryObj(packImitation);
      GAME.playersJoined[player].factories.processing[factory].process = savedProcess;
      GAME.playersJoined[player].factories.processing[factory].storage = savedStorage;
    }
  };
};






function roadBuilding(pack) {
  const sendPack = {
    pack: pack,
    gameID: GAME.id,
  };
  socket.emit('GAME_gamePlay_roadBuild', sendPack);
};


function factoryBuilding(pack){
  const sendPack = {
    pack: pack,
    gameID: GAME.id,
  };
  socket.emit('GAME_gamePlay_factoryBuild', sendPack);
}



function makeCityConsumptionTurn() {
  const sendPack = {
    player: PLAYER.login,
    gameID: GAME.id,
  };
  socket.emit('GAME_gamePlay_makeCityConsumptionTurn', sendPack);
};
function applyCityConsumptionTurn() {
 for(let city in GAME.map.cities){
   GAME.map.cities[city].updateAllStocks();
 };
};

function makeProductionTurn(){
  const sendPack = {
    player: PLAYER.login,
    gameID: GAME.id,
  };
  socket.emit('GAME_gamePlay_makeProductionTurn', sendPack);
};


function applyProductionTurn(player){
  const playerFactories = GAME.playersJoined[player].factories.processing;
  for(let factory in playerFactories){
    playerFactories[factory].makeProductionTurn();
  };
  UI.balanceSection.updateBalance();





};

export {
  SEND_ALL,
  APPLY_ALL,
  roadBuilding,
  factoryBuilding,
  makeProductionTurn,
  applyProductionTurn,
  makeCityConsumptionTurn,
  applyCityConsumptionTurn,
}
