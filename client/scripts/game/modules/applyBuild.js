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


class playerFactoryObj {
  constructor(pack) {
    const globalFactory = GAME_CONTENT.FACTORIES[pack.factoryType];

    this.factoryType = pack.factoryType;
    this.factoryTitle = pack.factoryTitle;
    this.id = pack.id;
    this.owner = pack.owner;
    this.process = [];
    this.storage = [];
    this.product = globalFactory.product;
    this.coast = globalFactory.coast;
    this.salary = globalFactory.salary;
    this.title = globalFactory.title;
    this.ceil = globalFactory.ceil;




    for(let proccessIndex = 0;proccessIndex<globalFactory.process;proccessIndex++){
      this.process.push(0);
    };

    for(let storageIndex = 0;storageIndex<globalFactory.storage;storageIndex++){
      this.storage.push(0);
    };
  };

  makeProductionTurn(){
    GAME.playersJoined[this.owner].balance -= this.salary;
    if(PLAYER.login === this.owner){
      UI.balanceSection.smallNоtification.add((this.salary*-1),SCENE.getDOMCordByMesh(GAME.renderGroups.factories[this.id].mesh));
    };


    function makeTurn(self){
      //если склад не заполнен
      if(self.storage.includes(0)){
        //если производство еще не началось
        if(!self.process.includes(1)){
          self.process[0] = 1;
        }else{
          //если последний шаг производства
          if(self.process[self.process.length - 1] === 1){
            self.process[self.process.length - 1] = 0;
            self.storage.unshift(self.storage.pop());
            self.storage[0] = 1;
            makeTurn(self);
          }else{
            self.process.unshift(self.process.pop())
          };
        };
      }else{
        if(PLAYER.login === self.owner){
          setTimeout(function(){
            UI.balanceSection.smallNоtification.add('Storage full!',SCENE.getDOMCordByMesh(GAME.renderGroups.factories[self.id].mesh),'#ff0091');
          },500);

        };
      };
    };
    makeTurn(this);
  };
};






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


function buildFactory(pack){



  GAME.playersJoined[pack.owner].balance -= GAME_CONTENT.FACTORIES[pack.factoryType].coast;
  GAME.playersJoined[pack.owner].factories.processing[pack.id] = new playerFactoryObj(pack);
  UI.balanceSection.updateBalance();


  delete GAME.gameBank.factories[pack.factoryIndex];
  UI.factoriesBankSection.deleteDomCard(pack.factoryType,pack.factoryIndex);

  GAME.map.mapFlagsArr[pack.indexses[0]][pack.indexses[1]] = 4;

  const factoryObj = {
    type:'factory',
    indexses:pack.indexses,
    id:pack.id,
    factoryType:pack.factoryType,
    owner:pack.owner,
    factoryTitle:pack.factoryTitle,
    factoryIndex:pack.factoryIndex,
  };


  GAME.map.stativeObjects.push(factoryObj);

  SCENE.buildGameObject.factory(pack);
  if(pack.owner === PLAYER.login){
    UI.playerInventorySection.rebuildSection();
  };
};

export{
  buildRoad,
  buildFactory,
  playerFactoryObj,
}
