
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


function generateId(type,x){
	let letters = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnPpQqRrSsTtUuVvWwXxYyZz';
	let numbers = '12345678012345678901234567890';
	let lettersMix;
  let numbersMix;
	for(let i=0; i<10;i++){
              lettersMix += letters;
              numbersMix += numbers;
            }


	let mainArr = lettersMix.split('').concat(numbersMix.split(''));


	let shuffledArr = mainArr.sort(function(){
  						return Math.random() - 0.5;
					});
	let id = type +'_';
	for(let i=0; i<=x;i++){
		id += shuffledArr[i];
	};
	return id;
};



function userEventsFoo(){
  let mouse = {
    x:0,
    y:0,
  }


  function changeMouseCoord(e){
    if(e.type === 'mousemove'){
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    if(e.type === 'touchmove'){
      mouse.x = e.targetTouches[0].screenX;
      mouse.y = e.targetTouches[0].screenY;
    };
  };

  function getMouseCoord(){
    return {x:mouse.x,y:mouse.y};
  };

  return {
    changeMouseCoord,
    getMouseCoord
  };
};

const userEvents = userEventsFoo();

function buildingRoad(){
    let zIndex,xIndex;

  const meshFunctions = SCENE.temporaryMesh();
  meshFunctions.create('road');


  function checkMapIndex(){
    const parentMesh = meshFunctions.returnParentMesh();
    if(parentMesh){
      zIndex = parentMesh.indexses[0];
      xIndex = parentMesh.indexses[1];
      if(GAME.map.mapFlagsArr[zIndex][xIndex] === 2){
        if(GAME.playersJoined[PLAYER.login].balance > GAME_CONTENT.ROAD_COAST){
          return true
        }else{
          UI.messagesSection.showMessage.NotEnoughMoney(meshFunctions.getDOMCord());
          return false
        }

      }else{
        UI.messagesSection.showMessage.CantBuildHere(meshFunctions.getDOMCord());
        return false
      };
    };

  };

  function acceptBuild(){
    UI.balanceSection.smallNоtification.add((GAME_CONTENT.ROAD_COAST*-1),meshFunctions.getDOMCord());
    meshFunctions.remove();
    const pack = {
      player:PLAYER.login,
      indexses:[zIndex,xIndex],
      id:generateId('road',5),
    };

    SENDING.roadBuilding(pack);


  };

  return {
    meshFunctions,
    checkMapIndex,
    acceptBuild,
  };



};





function start() {

  UI.turnInterfaceSection.showSection(true);

};









function end() {
  UI.turnInterfaceSection.showSection(false);
  const gameID = GAME.id;
  socket.emit('GAME_turns_end',gameID);
};


export{
  start,
  userEvents,
  buildingRoad,
  end,
}
