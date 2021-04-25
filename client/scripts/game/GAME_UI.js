import * as SCENE from "./modules/scene.js";
import * as TURNS from "./modules/turns.js";
import * as SIT_PLACES from "/scripts/gameSettings/sittingPlace.js";
import * as RENDER_SETTINGS from '/scripts/gameSettings/RENDER.js';
import * as MAP_SETTINGS from "/scripts/gameSettings/map.js";

import * as GAME_CONTENT from "/scripts/gameSettings/content.js";
import {
  GAME
} from '/scripts/game/GAME.js';
import {
  PLAYER,
} from "/scripts/accPage.js";

function generateId(type, x) {
  let letters = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnPpQqRrSsTtUuVvWwXxYyZz';
  let numbers = '12345678012345678901234567890';
  let lettersMix;
  let numbersMix;
  for (let i = 0; i < 10; i++) {
    lettersMix += letters;
    numbersMix += numbers;
  }


  let mainArr = lettersMix.split('').concat(numbersMix.split(''));


  let shuffledArr = mainArr.sort(function() {
    return Math.random() - 0.5;
  });
  let id = type + '_';
  for (let i = 0; i <= x; i++) {
    id += shuffledArr[i];
  };
  return id;
};

function applyUserInteractionOnElement(element, event, foo) {
  if (event === 'move') {

    element.addEventListener('mousemove', function(e) {
      foo(e);
    });

    element.addEventListener('touchmove', function(e) {
      foo(e);
    });
  };
  if (event === 'click') {
    element.addEventListener('click', function(e) {
      foo(e);
    });
    // element.addEventListener('touchend',function(e) {
    //   foo(e);
    // });
  };
};

function clearUserInteractionOnElement(element, event) {
  if (event === 'move') {
    element.onmousemove = null;
    element.ontouchmove = null;
  };
  if (event === 'click') {
    element.onclick = null;
    element.ontouchend = null;

  };
};


const turnDeviceSection = {
  addSection: function() {
    const section = `<section id="turnDeviceSection"></section>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd', section);
    const child = `<div>turn your device to a horizontal position, please</div>`;
    document.querySelector('#turnDeviceSection').insertAdjacentHTML('beforeEnd', child);
  },
}


const cameraInterface = {
  addButton: function() {
    const changeFun = cameraInterface.changeCameraPosition();
    const changeCameraPositionBtn = `<button id="changeCameraPositionBtn">camera</button>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd', changeCameraPositionBtn);
    document.querySelector('#changeCameraPositionBtn').onclick = function() {
      changeFun.change();
    };

  },
  applyDoubleClickEvent: function() {
    const changeFun = cameraInterface.changeCameraPosition();
    document.body.addEventListener('dblclick', function() {
      changeFun.change();
    });
  },


  changeCameraPosition: function() {
    let cameraPosition = 'UserPlace';

    function change() {
      if (cameraPosition === 'UserPlace') {
        cameraPosition = 'Up';
        SCENE.CAMERA.anim.animateTo(0, SIT_PLACES.USER_SIT_DISTANCE * 2, 0);
        SCENE.CAMERA.lookAt(0, 0, 0);
      } else if (cameraPosition === 'Up') {
        cameraPosition = 'UserPlace';
        const sitCords = SCENE.takeSitCoord(PLAYER.login);
        SCENE.CAMERA.anim.animateTo(sitCords.x, sitCords.y, sitCords.z);
      };
    };
    return {
      change: change,
    };
  },
};



const balanceSection = {
  updateCount: 50,
  updateSpeed: 10,

  addSection: function() {
    const section = `<section id="balanceSection"></section>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd', section);

    const balanceDiv = `<div id="playerBalanceDiv" class="nonSelectText">${GAME.playersJoined[PLAYER.login].balance}$</div>`;
    document.querySelector('#balanceSection').insertAdjacentHTML('beforeEnd', balanceDiv);
  },
  updateBalance: function() {
    const balanceDiv = document.querySelector('#playerBalanceDiv');
    const balanceDivValue = parseInt(balanceDiv.innerHTML)

    const playerBalance = GAME.playersJoined[PLAYER.login].balance

    const updateCount = balanceSection.updateCount;
    if (playerBalance > balanceDivValue) {
      if (balanceDivValue + updateCount < playerBalance) {
        balanceDiv.innerHTML = balanceDivValue + updateCount + "$";
        balanceDiv.style.color = 'green'
        setTimeout(function() {
          balanceSection.updateBalance();
        }, balanceSection.updateSpeed)
      } else {
        balanceDiv.innerHTML = playerBalance + "$";
        balanceDiv.style.color = 'white'
      };
    };

    if (playerBalance < balanceDivValue) {
      if (balanceDivValue - updateCount > playerBalance) {
        balanceDiv.innerHTML = balanceDivValue - updateCount + "$";
        balanceDiv.style.color = 'red';
        setTimeout(function() {
          balanceSection.updateBalance();
        }, balanceSection.updateSpeed)
      } else {
        balanceDiv.innerHTML = playerBalance + "$";
        balanceDiv.style.color = 'white'
      };
    };
  },
  smallNоtification: {
    add: function(value, position,color) {
      const section = document.querySelector('#balanceSection');
      const id = generateId('balanceNotification', 5);

      let colorCss= value > 0 ? 'green' : 'red';
      if(color){
        colorCss = color;
      };
      (typeof value === 'number') ? value = value+'$':false;
      const notification = `<div id="${id}" style="top:${position.y}px;left:${position.x}px;color:${colorCss}" class="balanceSmallNоtification">${value}</div>`;
      const upShift = document.body.clientHeight / 10;
      section.insertAdjacentHTML('beforeEnd', notification);
      const notificationDiv = document.querySelector(`#${id}`);
      setTimeout(function() {
        notificationDiv.style.top = (position.y - upShift) + "px";
        notificationDiv.style.opacity = 0;
      }, 20)

      function remove() {
        document.querySelector(`#${id}`).remove();
      }
      setTimeout(function() {
        remove();
      }, 3000)
    },
  },
};

const messagesSection = {
  addSection: function() {
    const section = `<section id="messagesSection"></section>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd', section);
  },


  showMessage: {
    setElementPosition: function setElementPosition(elementID, position) {
      const element = document.querySelector(`#${elementID}`);
      element.style.left = position.x - element.clientWidth / 2 + 'px';
      element.style.top = position.y - element.clientHeight / 2 + 'px';
    },

    NotEnoughMoney: function NotEnoughMoney(position) {

      const div = `<div id="messagesSection_notEnoughMoney" class="messagesSection-message">
    Not enough money </div>`

      function show() {
        if (!document.querySelector('#messagesSection_notEnoughMoney')) {
          document.querySelector('#messagesSection').insertAdjacentHTML('beforeEnd', div);

          messagesSection.showMessage.setElementPosition('messagesSection_notEnoughMoney', position);

          setTimeout(hide, 2000);
        };
      };

      function hide() {
        document.querySelector('#messagesSection_notEnoughMoney').remove();
      };
      show();
    },


    CantBuildHere: function CantBuildHere(position) {
      const div = `<div id="messagesSection_cantBuildHere" class="messagesSection-message">
    You can't build here </div>`

      function show() {
        if (!document.querySelector('#messagesSection_cantBuildHere')) {
          document.querySelector('#messagesSection').insertAdjacentHTML('beforeEnd', div);

          messagesSection.showMessage.setElementPosition('messagesSection_cantBuildHere', position);

          setTimeout(hide, 2000);
        };
      };

      function hide() {
        document.querySelector('#messagesSection_cantBuildHere').remove();
      };
      show();
    },
  },
};


const playersNamesSection = {
  addSection: function() {
    const section = `<section id="playersNamesSection"></section>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd', section);
    playersNamesSection.rebuildDives();
  },
  rebuildDives: function() {
    document.querySelector('#playersNamesSection').innerHTML = '';
    for (let player in GAME.playersInGame) {
      if (player != PLAYER.login) {
        const style = `
          color:${SIT_PLACES.USER_COLORS.css[GAME.playersJoined[player].colorIndex]};position:absolute
        `
        const playerDiv = `<div style="${style}" class="playerNameDiv nonSelectText" id="playerNameDiv_${player}">${player}</div>`;
        document.querySelector('#playersNamesSection').insertAdjacentHTML('beforeEnd', playerDiv);
      };
    };
  },
};


const cityNamesSection = {
  addSection: function() {
    const section = `<section id="cityNamesSection"></section>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd', section);

    for (let city in GAME.map.cities) {

      const cityDiv = `<div class="cityNameDiv nonSelectText" id="cityNameDiv_${city}" >${city}</div>`;
      document.querySelector('#cityNamesSection').insertAdjacentHTML('beforeEnd', cityDiv);
      document.querySelector(`#cityNameDiv_${city}`).onclick = function() {
        stocksSection.showCard(`${city}`);
      };
      stocksSection.createCard(GAME.map.cities[city]);
    };
  },
};

const factoryNamesSection  = {
  addSection: function() {
    const section = `<section id="factoryNamesSection"></section>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd', section);
  },
  addDiv:function(pack){
    const div = `<div class="factoryNameDiv nonSelectText" id="factoryNameDiv_${pack.factoryIndex}">${pack.factoryTitle}</div>`;
    document.querySelector('#factoryNamesSection').insertAdjacentHTML('beforeEnd', div);
    return document.querySelector(`#factoryNameDiv_${pack.factoryIndex}`);
  },
  addPlayerNameDiv:function(pack){
    const div = `<div class="factoryNameDiv nonSelectText" id="factoryNameDiv_${pack.factoryIndex}" style = "color:${SIT_PLACES.USER_COLORS.css[GAME.playersJoined[pack.owner].colorIndex]}">${pack.owner}</div>`;
    document.querySelector('#factoryNamesSection').insertAdjacentHTML('beforeEnd', div);
    return document.querySelector(`#factoryNameDiv_${pack.factoryIndex}`);
  },

};

const stocksSection = {
  addSection: function() {
    const section = `<section class="stockSection" id="stockSection"></section>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd', section);
  },

  createCard: function(obj) {
    let list = '';

    for (let product in obj.stocks) {
      let process = '';
      obj.stocks[product].stock.forEach((item, i) => {
        let processCeilDiv = `
        <div class="stockCart_list-item-productCeil" id="stockCard_${obj.title}_${product}_process_${i}">
        </div>
        `
        process += processCeilDiv;
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
    document.querySelector('#stockSection').insertAdjacentHTML('beforeEnd', stockDiv);

  },




  showCard: function(title) {
    for (let child of document.querySelector(`#stockSection`).children) {
      child.style.display = 'none';
    };

    function rebuildStockCard() {
      let searchedObj;
      if (title === 'Westown' || title === 'Northfield' || title === 'Southcity') {
        searchedObj = GAME.map.cities[title].stocks
      };
      for (let product in searchedObj) {
        searchedObj[product].stock.forEach((item, i) => {
          const element = document.querySelector(`#stockCard_${title}_${product}_process_${i}`);
          if (item === 1) {
            element.innerHTML = '';
            element.classList.add(`Ceil-Full-${product}`);
          } else {
            element.classList.remove(`Ceil-Full-${product}`);
            element.innerHTML = searchedObj[product].price[i] + `$`;
          };
        });
      };
    };


    rebuildStockCard();
    document.querySelector(`#stockCard_${title}`).style.display = 'block';
    document.querySelector(`#stockSection`).style.pointerEvents = 'auto';
    document.querySelector(`#stockSection`).onclick = function() {
      stocksSection.hideCard(title);
    };
  },
  hideCard: function(title) {
    document.querySelector(`#stockSection`).style.pointerEvents = 'none';
    document.querySelector(`#stockCard_${title}`).style.display = 'none';
  },


};
const factoriesBankSection = {
  addSection: function() {
    const section = `<section id="factoryBankSection"></section>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd', section);
  },

  domCards: {},

  buildAllCards: function() {
    for (let factory in GAME.gameBank.factories) {
      factoriesBankSection.buildFactoryCard(GAME.gameBank.factories[factory]);
    };
  },

  buildFactoryCard: function(factoryObj) {
    const cardContent = factoryCardDOMBuilder.build(factoryObj);

    if (!factoriesBankSection.domCards[factoryObj.factoryType]) {
      factoriesBankSection.domCards[factoryObj.factoryType] = {};
    }
    factoriesBankSection.domCards[factoryObj.factoryType][factoryObj.id] = {
      content: cardContent,
      title: factoryObj.title + " #" + factoryObj.index,
    }

  },
  deleteDomCard:function(factoryType,factoryIndex){
    delete factoriesBankSection.domCards[factoryType][factoryIndex];
  },

  showSection: function(bool) {
    const section = document.querySelector('#factoryBankSection');
    if (bool) {
      section.style.display = 'flex';
      section.style.pointerEvents = 'auto';
      rebuildSection();
    } else {
      section.style.display = 'none';
      section.style.pointerEvents = 'none';
    };






    function rebuildSection() {
      const container = `<div id="factoryBankContainer"></div>`;
      section.innerHTML = '';
      section.insertAdjacentHTML('beforeEnd', container);
      const closeBtn = `<button id="closeFactoryBankSection">X</button>`;
      document.querySelector('#factoryBankContainer').insertAdjacentHTML('beforeEnd', closeBtn);
      document.querySelector('#closeFactoryBankSection').onclick = null;
      document.querySelector('#closeFactoryBankSection').onclick = function() {
        factoriesBankSection.showSection(false);
      }

      for (let factoryType in factoriesBankSection.domCards) {
        if(Object.keys(factoriesBankSection.domCards[factoryType]).length > 0){
          const thisFactoryTypeContainer = `
              <div class="factoryTypeContainer" id="factoryTypeContainer_${factoryType}" data-factoryType="${factoryType}">
                <div style="width:100%;height:90%" id="factoryTypeContainer_${factoryType}_contentBox">
                </div>
              </div>
            `
          document.querySelector('#factoryBankContainer').insertAdjacentHTML('beforeEnd', thisFactoryTypeContainer);
          document.querySelector(`#factoryTypeContainer_${factoryType}_contentBox`).onclick = function() {
            factoriesBankSection.showSection(false);
            turnInterfaceSection.buildFactorySection(factoryType);
          };

          let index = 1;
          for (let factory in GAME.gameBank.factories) {
            if (GAME.gameBank.factories[factory].factoryType === factoryType) {
              const factoryCard = factoriesBankSection.domCards[factoryType][GAME.gameBank.factories[factory].id].content;
              const cardCount = GAME_CONTENT.FACTORIES[factoryType].count;
              document.querySelector(`#factoryTypeContainer_${factoryType}_contentBox`).insertAdjacentHTML('afterBegin', factoryCard);
              document.querySelector(`#${GAME.gameBank.factories[factory].id}`).style.transform = `translate(${(cardCount-index)*2}vw,${(cardCount-index)*2}vw) scale(0.6)`
              index++;
            };
          };
        };
      };
    };
  },
};


const playerInventorySection = {
  section:null,
  factoryCardsDiv:null,
  addSection: function(){
    const section = `<section id="playerInventorySection">
      <div id="playerInventorySection_factoryCards"></div>
    </section>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd', section);
    playerInventorySection.section = document.querySelector('#playerInventorySection');
    playerInventorySection.factoryCardsDiv = document.querySelector('#playerInventorySection_factoryCards');
  },
  rebuildSection:function(){
    playerInventorySection.factoryCardsDiv.innerHTML = '';
    const playerFactories = GAME.playersJoined[PLAYER.login].factories.processing;
    for(let factory in playerFactories){
      const factoryObj = playerFactories[factory];

      const domCard = factoryCardDOMBuilder.build(factoryObj,'factoryCardInventary','position:relative;scale(0.5)');
      const factoryCardContainer = `
        <div class="factoryCardContainer" id="playerInventorySection_factoryCardContainer_${factory}">
          ${domCard}
        </div>
      `;
      playerInventorySection.factoryCardsDiv.insertAdjacentHTML('beforeEnd',factoryCardContainer);
      factoryCardDOMBuilder.updateCard(factoryObj);

      playerInventorySection.updateCards();



    };
  },
  updateCards:function(){
    const playerFactories = GAME.playersJoined[PLAYER.login].factories.processing;
    for(let factory in playerFactories){
      const factoryObj = playerFactories[factory];
      factoryCardDOMBuilder.updateCard(factoryObj);


      //таймаут нужен при релогине, чтобы DOM успевал набиться
      setTimeout(function(){
        if(factoryObj.storage.includes(1) && GAME.turns.currentTurn === PLAYER.login){//&& player have car
          const color = MAP_SETTINGS.MAP_CELL_COLOR_CSS[GAME_CONTENT.FACTORIES[factoryObj.factoryType].ceil]
          const sellButton = `<button id="playerInventorySection_sellButton_${factory}" class="playerInventorySection_sellButton" style="background-color:${color}">Sell</button>`;
          if(!document.querySelector(`#playerInventorySection_sellButton_${factory}`)){
            document.querySelector(`#playerInventorySection_factoryCardContainer_${factory}`).insertAdjacentHTML('beforeEnd',sellButton);
            document.querySelector(`#playerInventorySection_sellButton_${factory}`).onclick = function(){
              alert(factoryObj.id);
            }
          }
        }else{
          if(document.querySelector(`#playerInventorySection_sellButton_${factory}`)){
            document.querySelector(`#playerInventorySection_sellButton_${factory}`).remove();
          };
        };
      });
    };
  },
};

const factoryCardDOMBuilder = {
  build(factoryObj, addClass='', addStyle = '',){
    let processCeilsString = '';
    let storageCeilsString = '';

    let factoryProcess = (typeof factoryObj.process === 'number') ? factoryObj.process : factoryObj.process.length;
    let factoryStorage = (typeof factoryObj.storage === 'number') ? factoryObj.storage : factoryObj.storage.length;
    for (let processCeil = 0; processCeil < factoryProcess; processCeil++) {
      const processCeilHTML = `
      <div class="factoryCard-processBox">
        <div class="factoryCard-processCeil" id="factoryCard_${factoryObj.id}_process_${processCeil}">

        </div>
        <div class="factoryCard-processArrow">
          →
        </div>
      </div>
      `
      processCeilsString += processCeilHTML;
    };

    for (let storageCeil = 0; storageCeil < factoryStorage; storageCeil++) {
      const storageCeilHTML = `
      <div class="factoryCard-storageCeil" id="factoryCard_${factoryObj.id}_storage_${storageCeil}">

      </div>
      `
      storageCeilsString += storageCeilHTML;
    };

    const cardContent = `
    <div class="factoryCard ${addClass}" id='${factoryObj.id}' style="background-color:${MAP_SETTINGS.MAP_CELL_COLOR_CSS[factoryObj.ceil]}; ${addStyle}">
    <div class="factoryCard-header">
      <div class="factoryCard-salaryBox">
        <div class="factoryCard-salaryContainer">
          ${factoryObj.salary}$
        </div>
      </div>
      <div class="factoryCard-processContainer">
        ${processCeilsString}
      </div>
    </div>
    <div class="factoryCard-body">
      <div class="factoryCard-title">
        ${factoryObj.factoryTitle ?factoryObj.factoryTitle :factoryObj.title + " #" + factoryObj.index}
      </div>
      <div class="factoryCard-coastBox">
        <div style="margin-right:0.5vw">
          Coast:
        </div>
        <div class="">
          ${factoryObj.coast}$
        </div>
      </div>
      <div class="factoryCard-productBox">
        <div style="margin-right:0.5vw">
          Product:
        </div>
        <div class="">
          ${factoryObj.product}
        </div>
      </div>
    </div>
    <div class="factoryCard-footer">
      <div class="factoryCard-storageBox">
        ${storageCeilsString}
      </div>

    </div>
    </div>
    `;
    return cardContent;

  },

  updateCard(factoryObj){
    factoryObj.process.forEach((item, indx) => {
      const element = document.querySelector(`#factoryCard_${factoryObj.id}_process_${indx}`);
      if(element){
        if(item === 0){
           element.classList.remove(`Ceil-Full-${factoryObj.product}`);
        }else{
          element.classList.add(`Ceil-Full-${factoryObj.product}`);
        };
      };
    });

    factoryObj.storage.forEach((item, indx) => {
      const element = document.querySelector(`#factoryCard_${factoryObj.id}_storage_${indx}`);
      if(element){
        if(item === 0){
           element.classList.remove(`Ceil-Full-${factoryObj.product}`);
        }else{
          element.classList.add(`Ceil-Full-${factoryObj.product}`);
        };
      };
    });
  },
};


const turnInterfaceSection = {
  addSection: function() {
    const section = `<section id="turnInterfaceSection"></section>`;
    document.querySelector('#body').insertAdjacentHTML('beforeEnd', section);
    document.querySelector('#turnInterfaceSection').style.display = 'none';
  },

  showSection: function(show) {
    const section = document.querySelector('#turnInterfaceSection');
    const bodySection = document.querySelector('#body');
    const userEvents = TURNS.userEvents;
    if (show) {
      //показываем
      section.style.display = 'flex';
      turnInterfaceSection.rebuildSection();
    } else {
      //прячем
      section.style.display = 'none';
      clearUserInteractionOnElement(bodySection, 'move');
      //чистим, чтобы не пользовался функциями
      section.innerHTML = '';
    };
  },
  rebuildSection: function() {
    const section = document.querySelector('#turnInterfaceSection');
    section.innerHTML = '';



    const mouseEventsCeaper = '<div id="turnInterfaceSection_mouseEventsCeaper"></div>';
    section.insertAdjacentHTML('beforeEnd', mouseEventsCeaper);
    document.querySelector('#turnInterfaceSection_mouseEventsCeaper').style.pointerEvents = 'none';

    const endTurnBtn = '<button id="endTurnButton">END TURN</button>';
    section.insertAdjacentHTML('beforeEnd', endTurnBtn);
    document.querySelector('#endTurnButton').onclick = function() {
      TURNS.end();
    };


    const buildRoadBtn = '<button id="buildRoadBtn">BuildRoad</button>';
    section.insertAdjacentHTML('beforeEnd', buildRoadBtn);
    document.querySelector('#buildRoadBtn').onclick = function() {
      turnInterfaceSection.buildRoadSection();
    };

    const factoryBankBtn = '<button id="buyFactoryBtn">buy a factory</button>';
    section.insertAdjacentHTML('beforeEnd', factoryBankBtn);
    document.querySelector('#buyFactoryBtn').onclick = function() {
      factoriesBankSection.showSection(true);
    };
  },


  buildRoadSection: function() {
    const buildingRoadAPI = TURNS.buildingRoad();
    const section = document.querySelector('#turnInterfaceSection');
    const bodySection = document.querySelector('#body');
    bodySection.style.pointerEvents = 'auto';

    section.innerHTML = '';

    const mouseEventsCeaper = '<div id="turnInterfaceSection_mouseEventsCeaper" style="width:100vw;height:100vh;pointer-events:auto;position:fixed"></div>';
    section.insertAdjacentHTML('beforeEnd', mouseEventsCeaper);
    const mouseCeaper = document.querySelector('#turnInterfaceSection_mouseEventsCeaper');

    const cancelBtn = '<button id="cancelBuildRoadBtn">cancel</button>';
    section.insertAdjacentHTML('beforeEnd', cancelBtn);

    document.querySelector('#cancelBuildRoadBtn').onclick = function() {
      turnInterfaceSection.rebuildSection();

      clearUserInteractionOnElement(mouseCeaper, 'move');
      clearUserInteractionOnElement(mouseCeaper, 'click');

      bodySection.style.pointerEvents = 'none';
      buildingRoadAPI.meshFunctions.remove();
    };

    applyUserInteractionOnElement(mouseCeaper, 'move', TURNS.userEvents.changeMouseCoord);
    applyUserInteractionOnElement(mouseCeaper, 'move', function() {
      buildingRoadAPI.meshFunctions.moveMeshToMesh(TURNS.userEvents.getMouseCoord(), 'mapGroup');
    });
    applyUserInteractionOnElement(mouseCeaper, 'click', function() {
      if (buildingRoadAPI.checkMapIndex()) {
        confirmBuildBlock();
      };
    });

    function confirmBuildBlock() {
      const position = buildingRoadAPI.meshFunctions.getDOMCord();
      const buildHereDiv = `
        <div style="position:absolute;left:${position.x}px;top:${position.y}px;" >
          <button id="acceptBuildRoadBtn">build</button>
          <button id="cancelBuildRoadBtn">cancel</button>
        </div>
      `
      document.querySelector('#turnInterfaceSection').innerHTML = '';
      document.querySelector('#turnInterfaceSection').insertAdjacentHTML('beforeEnd', buildHereDiv);

      document.querySelector('#acceptBuildRoadBtn').onclick = function() {




        buildingRoadAPI.acceptBuild();
        turnInterfaceSection.buildRoadSection();
      };
      document.querySelector('#cancelBuildRoadBtn').onclick = function() {
        buildingRoadAPI.meshFunctions.remove();
        turnInterfaceSection.buildRoadSection();
      };
    };
  },


  buildFactorySection:function(factoryType){
    const buildingFactoryAPI = TURNS.buildingFactory(factoryType);
    const section = document.querySelector('#turnInterfaceSection');

    section.innerHTML = '';
      const mouseEventsCeaper = '<div id="turnInterfaceSection_mouseEventsCeaper" style="width:100vw;height:100vh;pointer-events:auto;position:fixed"></div>';
    section.insertAdjacentHTML('beforeEnd', mouseEventsCeaper);
    const mouseCeaper = document.querySelector('#turnInterfaceSection_mouseEventsCeaper');
    mouseCeaper.style.pointerEvents = 'auto';
    const cancelBtn = '<button id="cancelBuildFactoryBtn">cancel</button>';
    section.insertAdjacentHTML('beforeEnd', cancelBtn);
    document.querySelector('#cancelBuildFactoryBtn').onclick = function() {
      turnInterfaceSection.rebuildSection();

      clearUserInteractionOnElement(mouseCeaper, 'move');
      clearUserInteractionOnElement(mouseCeaper, 'click');

      buildingFactoryAPI.meshFunctions.remove();
    };



    applyUserInteractionOnElement(mouseCeaper, 'move', TURNS.userEvents.changeMouseCoord);
    applyUserInteractionOnElement(mouseCeaper, 'move', function() {
      buildingFactoryAPI.meshFunctions.moveMeshToMesh(TURNS.userEvents.getMouseCoord(), 'mapGroup');
    });
    applyUserInteractionOnElement(mouseCeaper, 'click', function() {
      if (buildingFactoryAPI.checkMapIndex()) {
        confirmBuildBlock();
      };
    });
    function confirmBuildBlock() {
      const position = buildingFactoryAPI.meshFunctions.getDOMCord();
      const buildHereDiv = `
        <div style="position:absolute;left:${position.x}px;top:${position.y}px;" >
          <button id="acceptBuildRoadBtn">build</button>
          <button id="cancelBuildRoadBtn">cancel</button>
        </div>
      `
      document.querySelector('#turnInterfaceSection').innerHTML = '';
      document.querySelector('#turnInterfaceSection').insertAdjacentHTML('beforeEnd', buildHereDiv);

      document.querySelector('#acceptBuildRoadBtn').onclick = function() {
        const factoryIndex =  Object.keys(factoriesBankSection.domCards[factoryType])[0];
        const factoryTitle = factoriesBankSection.domCards[factoryType][factoryIndex].title;
        factoriesBankSection.deleteDomCard(factoryType,factoryIndex);
        buildingFactoryAPI.acceptBuild(factoryIndex,factoryTitle);
        turnInterfaceSection.rebuildSection();
      };
      document.querySelector('#cancelBuildRoadBtn').onclick = function() {
        buildingFactoryAPI.meshFunctions.remove();
        turnInterfaceSection.buildFactorySection(factoryType);
      };
    };
  },
};









function buildGameUI() {
  turnDeviceSection.addSection();
  RENDER_SETTINGS.initRenderSettingsMenu();

    playersNamesSection.addSection();
  playerInventorySection.addSection();
  balanceSection.addSection();
  balanceSection.updateBalance();
  cameraInterface.addButton();
  cameraInterface.applyDoubleClickEvent();


  factoriesBankSection.addSection();
  factoriesBankSection.buildAllCards();
  factoryNamesSection.addSection();
  playerInventorySection.rebuildSection();




  stocksSection.addSection();

  cityNamesSection.addSection();
  messagesSection.addSection();
  turnInterfaceSection.addSection();

};
export {
  buildGameUI,
  messagesSection,
  playersNamesSection,
  stocksSection,
  turnInterfaceSection,
  turnDeviceSection,
  balanceSection,
  factoriesBankSection,
  factoryNamesSection,
  playerInventorySection,
};
