
import * as SCENE from "./modules/scene.js";
import * as SIT_PLACES from "/scripts/gameSettings/sittingPlace.js";
import * as RENDER_SETTINGS from '/scripts/gameSettings/RENDER.js';

import * as GAME_CONTENT from "/scripts/gameSettings/content.js"
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
  const playerNames = `<section id="playersNamesSection"></section>`;
  document.querySelector('#body').insertAdjacentHTML('beforeEnd',playerNames);
  rebuildPlayersNamesDives();
};


function rebuildPlayersNamesDives(){
  document.querySelector('#playersNamesSection').innerHTML = '';

  for(let player in GAME.playersInGame){
    if(player != PLAYER.login){
      const style = `
        color:${SIT_PLACES.USER_COLORS.css[GAME.playersJoined[player].colorIndex]};position:absolute
      `
      const playerDiv = `<div style="${style}" class="playerNameDiv nonSelectText" id="playerNameDiv_${player}">${player}</div>`;
      document.querySelector('#playersNamesSection').insertAdjacentHTML('beforeEnd',playerDiv);
    };
  };
};



function addCityNamesDiv(){
  const cityNames = `<section id="cityNamesSection"></section>`;
  document.querySelector('#body').insertAdjacentHTML('beforeEnd',cityNames);

  for(let city in GAME.map.cities){

      const cityDiv = `<div class="cityNameDiv nonSelectText" id="cityNameDiv_${city}" >${city}</div>`;
      document.querySelector('#cityNamesSection').insertAdjacentHTML('beforeEnd',cityDiv);
      document.querySelector(`#cityNameDiv_${city}`).onclick = function(){
        showStockCard(`${city}`);
      };
      createStockCard(GAME.map.cities[city])
    };

};


function createStockCard(obj){

  let list= '';

  for(let product in obj.stocks){
    let process = '';
    obj.stocks[product].stock.forEach((item, i) => {
      let processCeilDiv = `
      <div class="stockCart_list-item-productCeil" id="stockCard_${obj.title}_${product}_process_${i}">
      </div>
      `
      process+=processCeilDiv;
    });

    const endProcessDiv = `
    <div class="stockCart_list-item-end stockCart_list-item-productCeil">
      x
    </div>
    `
    const productListItem = `
    <li class="stockCart_list-item">
      <div class="stockCart_list-item-title">${product}</div>
      ${process}
      ${endProcessDiv}
    </li>
    `
    list += productListItem;
  };



  const stockDiv = `
  <div class="stockCard" id="stockCard_${obj.title}">
    <div class="stockCard_title">
      ${obj.title}
    </div>
    <div class="stockCard_content">
      <ul class="stockCart_list" id="stockCard_${obj.title}_list">
        ${list}
      </ul>
    </div>
  </div>
  `
  document.querySelector('#stockSection').insertAdjacentHTML('beforeEnd',stockDiv);
};

function showStockCard(title){
  for(let child of document.querySelector(`#stockSection`).children){
    child.style.display = 'none';
  };

  function rebuildStockCard(){
    let searchedObj;
    if(title === 'Westown' || title === 'Northfield' || title === 'Southcity'){
      searchedObj = GAME.map.cities[title].stocks
    };
    for(let product in searchedObj){
      searchedObj[product].stock.forEach((item, i) => {
        console.log(searchedObj)
        if(item === 1){
            document.querySelector(`#stockCard_${title}_${product}_process_${i}`).innerHTML = product[0];
        }else{
          document.querySelector(`#stockCard_${title}_${product}_process_${i}`).innerHTML = searchedObj[product].price[i]+`$`;
        };
      });
    };
  };


  rebuildStockCard();
  document.querySelector(`#stockCard_${title}`).style.display = 'block';
  document.querySelector(`#stockSection`).style.pointerEvents = 'auto';
  document.querySelector(`#stockSection`).onclick = function(){
    hideStockCard(title);
  };
};
function hideStockCard(title){
  document.querySelector(`#stockSection`).style.pointerEvents = 'none';
  document.querySelector(`#stockCard_${title}`).style.display = 'none';
};

function addStockDiv(){
  const stockSection = `<section class="stockSection" id="stockSection"></section>`;
  document.querySelector('#body').insertAdjacentHTML('beforeEnd',stockSection);
};



function buildGameUI(){
  RENDER_SETTINGS.initRenderSettingsMenu();
  addChangeCameraButton();
  addPlayersNamesDiv();
  addStockDiv();
  addCityNamesDiv();




};
export{
buildGameUI,
rebuildPlayersNamesDives,

};
