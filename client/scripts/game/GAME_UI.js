
import * as SCENE from "./modules/scene.js";
import * as SIT_PLACES from "/scripts/gameSettings/sittingPlace.js";
import * as RENDER_SETTINGS from '/scripts/gameSettings/RENDER.js';
import {
  GAME
} from '/scripts/game/GAME.js';
import {
  PLAYER,
} from "/scripts/accPage.js";

function changeCameraPosition(){
  let cameraPosition = 'UserPlace';

  function change(){
    if(cameraPosition === 'UserPlace'){
      cameraPosition = 'Up';
      SCENE.CAMERA.anim.animateTo(0,SIT_PLACES.USER_SIT_DISTANCE*2,0);
      SCENE.CAMERA.lookAt(0,0,0);
    }else if(  cameraPosition === 'Up'){
      cameraPosition = 'UserPlace';
      const sitCords = SCENE.takeSitCoord(PLAYER.login);
      SCENE.CAMERA.anim.animateTo(sitCords.x,sitCords.y,sitCords.z);
    };
  };
  return {
    change: change,
  }
};


function addChangeCameraButton(){
  const changeFun = changeCameraPosition();
  const changeCameraPositionBtn = `<button id="changeCameraPositionBtn" style="position:fixed;top:0px;right:0px;">camera</button>`;
  document.querySelector('#body').insertAdjacentHTML('beforeEnd',changeCameraPositionBtn);
  document.querySelector('#changeCameraPositionBtn').onclick = function(){
    changeFun.change();
  };
};




function addPlayersNamesDiv(){
  const playerNames = `<div style="position:fixed;pointer-events:none;width:100vw;height:100vh;" id="playersNamesDiv"></div>`;
  document.querySelector('#body').insertAdjacentHTML('beforeEnd',playerNames);
  rebuildPlayersNamesDives();
};


function rebuildPlayersNamesDives(){
  document.querySelector('#playersNamesDiv').innerHTML = '';

  for(let player in GAME.playersInGame){
    if(player != PLAYER.login){
      const style = `
        position:absolute;color:${SIT_PLACES.USER_COLORS.css[GAME.playersJoined[player].colorIndex]};text-shadow:0 0 2px black;font-size:2vw
      `
      const playerDiv = `<div style="${style}" id="playerNameDiv_${player}">${player}</div>`;
      document.querySelector('#playersNamesDiv').insertAdjacentHTML('beforeEnd',playerDiv);
    }
  };

};



function addCityNamesDiv(){
  const cityNames = `<div style="position:fixed;pointer-events:none;width:100vw;height:100vh;" id="cityNamesDiv"></div>`;
  document.querySelector('#body').insertAdjacentHTML('beforeEnd',cityNames);

  for(let city in GAME.map.cities){
      const style = `
        position:absolute;color:white;text-shadow:0 0 2px black;font-size:1vw;
      `
      const cityDiv = `<div style="${style}" id="cityNameDiv_${city}">${city}</div>`;
      document.querySelector('#cityNamesDiv').insertAdjacentHTML('beforeEnd',cityDiv);
    };
};





function buildGameUI(){
  RENDER_SETTINGS.initRenderSettingsMenu();
  addChangeCameraButton();
  addPlayersNamesDiv();
  addCityNamesDiv();



};
export{
buildGameUI,
rebuildPlayersNamesDives,

};
