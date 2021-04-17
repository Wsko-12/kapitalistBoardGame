
import * as SCENE from "./modules/scene.js";
import * as TURNS from "./modules/turns.js";
import * as SIT_PLACES from "/scripts/gameSettings/sittingPlace.js";
import * as RENDER_SETTINGS from '/scripts/gameSettings/RENDER.js';

import * as GAME_CONTENT from "/scripts/gameSettings/content.js";
import {
  GAME
} from '/scripts/game/GAME.js';
import {
  PLAYER,
} from "/scripts/accPage.js";


function applyUserInteractionOnElement(element,event,foo){
  if(event === 'move'){

    element.addEventListener('mousemove',function(e) {
      foo(e);
    });

    element.addEventListener('touchmove',function(e){
      foo(e);
    });
  };
  if(event === 'click'){
    element.addEventListener('click',function(e) {
      foo(e);
    });
    // element.addEventListener('touchend',function(e) {
    //   foo(e);
    // });
  };
};

function clearUserInteractionOnElement(element,event){
  if(event === 'move'){
    element.onmousemove = null;
    element.ontouchmove = null;
  };
  if(event === 'click'){
    element.onclick = null;
    element.ontouchend = null;

  };
};


const turnDeviceSection = {
  addSection:function(){
    const section = `<section id="turnDeviceSection"></section>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd',section);
    const child = `<div>turn your device to a horizontal position, please</div>`;
    document.querySelector('#turnDeviceSection').insertAdjacentHTML('beforeEnd',child);
  },
}


const cameraInterface = {
  addButton:function(){
    const changeFun = cameraInterface.changeCameraPosition();
    const changeCameraPositionBtn = `<button id="changeCameraPositionBtn" style="">camera</button>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd',changeCameraPositionBtn);
    document.querySelector('#changeCameraPositionBtn').onclick = function(){
      changeFun.change();
    };

  },
  applyDoubleClickEvent:function(){
    const changeFun = cameraInterface.changeCameraPosition();
    document.body.addEventListener('dblclick',function(){
      changeFun.change();
    });
  },


  changeCameraPosition:function(){
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
    };
  },
};





const messagesSection = {
  addSection: function(){
    const section = `<section id="messagesSection"></section>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd',section);
  },


  showMessage:{
    setElementPosition:function setElementPosition(elementID,position){
      const element = document.querySelector(`#${elementID}`);
      element.style.left = position.x - element.clientWidth/2 + 'px';
      element.style.top = position.y - element.clientHeight/2 + 'px';
    },

    NotEnoughMoney: function NotEnoughMoney(position){

      const div = `<div id="messagesSection_notEnoughMoney" class="messagesSection-message">
    Not enough money </div>`
      function show(){
        if(!document.querySelector('#messagesSection_notEnoughMoney')){
          document.querySelector('#messagesSection').insertAdjacentHTML('beforeEnd',div);

          messagesSection.showMessage.setElementPosition('messagesSection_notEnoughMoney',position);

          setTimeout(hide,2000);
        };
      };
      function hide(){
        document.querySelector('#messagesSection_notEnoughMoney').remove();
      };
      show();
    },


    CantBuildHere: function CantBuildHere(position){
      const div = `<div id="messagesSection_cantBuildHere" class="messagesSection-message">
    You can't build here </div>`
      function show(){
        if(!document.querySelector('#messagesSection_cantBuildHere')){
          document.querySelector('#messagesSection').insertAdjacentHTML('beforeEnd',div);

          messagesSection.showMessage.setElementPosition('messagesSection_cantBuildHere',position);

          setTimeout(hide,2000);
        };
      };
      function hide(){
        document.querySelector('#messagesSection_cantBuildHere').remove();
      };
      show();
    },
  },
};


const playersNamesSection = {
  addSection:function(){
    const section = `<section id="playersNamesSection"></section>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd',section);
    playersNamesSection.rebuildDives();
  },
  rebuildDives:function(){
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
  },
};


const cityNamesSection = {
  addSection:function(){
    const section = `<section id="cityNamesSection"></section>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd',section);

    for(let city in GAME.map.cities){

        const cityDiv = `<div class="cityNameDiv nonSelectText" id="cityNameDiv_${city}" >${city}</div>`;
        document.querySelector('#cityNamesSection').insertAdjacentHTML('beforeEnd',cityDiv);
        document.querySelector(`#cityNameDiv_${city}`).onclick = function(){
          stocksSection.showCard(`${city}`);
        };
        stocksSection.createCard(GAME.map.cities[city]);
      };
  },
};


const stocksSection = {
  addSection:function(){
    const section = `<section class="stockSection" id="stockSection"></section>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd',section);
  },

  createCard:function(obj){
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

  },




  showCard:function(title){
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
            const  element = document.querySelector(`#stockCard_${title}_${product}_process_${i}`);
          if(item === 1){
              element.innerHTML = product[0];
              element.classList.add('stockCart_list-item-productCeil-full');
          }else{

            element.classList.remove('stockCart_list-item-productCeil-full');
            element.innerHTML = searchedObj[product].price[i]+`$`;
          };
        });
      };
    };


    rebuildStockCard();
    document.querySelector(`#stockCard_${title}`).style.display = 'block';
    document.querySelector(`#stockSection`).style.pointerEvents = 'auto';
    document.querySelector(`#stockSection`).onclick = function(){
      stocksSection.hideCard(title);
    };
  },
  hideCard:function(title){
    document.querySelector(`#stockSection`).style.pointerEvents = 'none';
    document.querySelector(`#stockCard_${title}`).style.display = 'none';
  },


};


const turnInterfaceSection = {
  addSection:function(){
    const section = `<section id="turnInterfaceSection"></section>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd',section);
    document.querySelector('#turnInterfaceSection').style.display = 'none';
  },

  showSection:function(show){
    const section = document.querySelector('#turnInterfaceSection');
    const bodySection = document.querySelector('#body');
    const userEvents = TURNS.userEvents;
    if(show){
      //показываем
      section.style.display = 'flex';
      turnInterfaceSection.rebuildSection();
    }else{
      //прячем
      section.style.display = 'none';
      clearUserInteractionOnElement(bodySection, 'move');
      //чистим, чтобы не пользовался функциями
      section.innerHTML = '';
    };
  },
  rebuildSection:function(){
    const section = document.querySelector('#turnInterfaceSection');
    section.innerHTML = '';



    const mouseEventsCeaper = '<div id="turnInterfaceSection_mouseEventsCeaper"></div>';
    section.insertAdjacentHTML('beforeEnd',mouseEventsCeaper);
    document.querySelector('#turnInterfaceSection_mouseEventsCeaper').style.pointerEvents = 'none';

    const endTurnBtn = '<button id="endTurnButton">END TURN</button>';
    section.insertAdjacentHTML('beforeEnd',endTurnBtn);
    document.querySelector('#endTurnButton').onclick = function(){
      TURNS.end();
    };


    const buildRoadBtn = '<button id="buildRoadBtn">BuildRoad</button>';
    section.insertAdjacentHTML('beforeEnd',buildRoadBtn);
    document.querySelector('#buildRoadBtn').onclick = function(){
      turnInterfaceSection.buildRoadSection();
    };
  },





  buildRoadSection:function(){
    const buildingRoadAPI = TURNS.buildingRoad();
    const section = document.querySelector('#turnInterfaceSection');
    const bodySection = document.querySelector('#body');
    bodySection.style.pointerEvents = 'auto';

    section.innerHTML = '';

    const mouseEventsCeaper = '<div id="turnInterfaceSection_mouseEventsCeaper"></div>';
    section.insertAdjacentHTML('beforeEnd',mouseEventsCeaper);
    const mouseCeaper = document.querySelector('#turnInterfaceSection_mouseEventsCeaper');
    mouseCeaper.style.pointerEvents = 'auto';

    const cancelBtn = '<button id="cancelBuildRoadBtn">cancel</button>';
    section.insertAdjacentHTML('beforeEnd',cancelBtn);

    document.querySelector('#cancelBuildRoadBtn').onclick = function(){
      turnInterfaceSection.rebuildSection();

      clearUserInteractionOnElement(mouseCeaper, 'move');
      clearUserInteractionOnElement(mouseCeaper, 'click');

      bodySection.style.pointerEvents = 'none';
      buildingRoadAPI.meshFunctions.remove();
    };

    applyUserInteractionOnElement(mouseCeaper, 'move', TURNS.userEvents.changeMouseCoord);
    applyUserInteractionOnElement(mouseCeaper,'move',function(){
      buildingRoadAPI.meshFunctions.moveMeshToMesh(TURNS.userEvents.getMouseCoord(),'mapGroup');
    });
    applyUserInteractionOnElement(mouseCeaper,'click',function(){
      if(buildingRoadAPI.checkMapIndex()){
        confirmBuildBlock();
      };
    });

    function confirmBuildBlock(){
      const position = buildingRoadAPI.meshFunctions.getDOMCord();
      const buildHereDiv = `
        <div style="position:absolute;left:${position.x}px;top:${position.y}px;" >
          <button id="acceptBuildRoadBtn">build</button>
          <button id="cancelBuildRoadBtn">cancel</button>
        </div>
      `
      document.querySelector('#turnInterfaceSection').innerHTML = '';
      document.querySelector('#turnInterfaceSection').insertAdjacentHTML('beforeEnd',buildHereDiv);

      document.querySelector('#acceptBuildRoadBtn').onclick = function(){
        buildingRoadAPI.acceptBuild();
        turnInterfaceSection.rebuildSection();
      };
      document.querySelector('#cancelBuildRoadBtn').onclick = function(){
        buildingRoadAPI.meshFunctions.remove();
        turnInterfaceSection.buildRoadSection();
      };
    };
  },

};
















function buildGameUI(){
  turnDeviceSection.addSection();
  RENDER_SETTINGS.initRenderSettingsMenu();
  cameraInterface.addButton();
  cameraInterface.applyDoubleClickEvent();

  playersNamesSection.addSection();
  stocksSection.addSection();
  cityNamesSection.addSection();
  messagesSection.addSection();
  turnInterfaceSection.addSection();
};
export{
buildGameUI,
messagesSection,
playersNamesSection,
stocksSection,
turnInterfaceSection,
turnDeviceSection,
};
