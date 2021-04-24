import {
  socket
} from '/scripts/socketInit.js';
import {
  PLAYER,
} from '/scripts/accPage.js';
import {
  GAME
} from '/scripts/game/GAME.js';

import * as MAP_SETTINGS from '/scripts/gameSettings/map.js';

import * as SIT_PLACES from "/scripts/gameSettings/sittingPlace.js";
import * as SCENE from "./scene.js";
import * as GAME_CONTENT from "/scripts/gameSettings/content.js"


function start() {
  generateTurns();
};

function generateTurns() {
  const pack = {
    game: GAME.id,
    turns: {
      line: [],
      index: -1,
    },
  };
  for (let player in GAME.playersJoined) {
    pack.turns.line.push(player);
  };
  socket.emit('GAME_generating_turns', pack);
  generatePlayerColors();
};


function generatePlayerColors() {
  let index = 0;
  const pack = {
    game: GAME.id,
    colors: {},
  };
  for (let player in GAME.playersJoined) {
    pack.colors[player] = index;
    index++;
  };
  socket.emit('GAME_generating_colors', pack);
};

function applyPlayerColors(colorsObj) {
  for (let player in GAME.playersJoined) {
    GAME.playersJoined[player].colorIndex = colorsObj[player];
  };
};


function generateMapLineArr() {
  const MapLineArr = [];
  for (let cell in MAP_SETTINGS.MAP_CELL_AMOUNT) {
    for (let count = 0; count < MAP_SETTINGS.MAP_CELL_AMOUNT[cell]; count++) {
      MapLineArr.push(cell)
    };
  };

  function makeRandomArr(a, b) {
    return Math.random() - 0.5;
  }
  MapLineArr.sort(makeRandomArr);

  const pack = {
    game: GAME.id,
    MapLineArr: MapLineArr,
  };

  socket.emit('GAME_generating_mapLineGenerated', pack);
};

function applyTurns(pack) {
  GAME.turns = pack;
};

function applyMapLineArr(MapLineArr, Regenerate) {
  GAME.map.mapLine = MapLineArr;
  buildMapNamesArr(MapLineArr, Regenerate);
};




function buildMapNamesArr(MapLineArr, Regenerate) {
  let mapNamesArr = [];
  for (let z = 0; z < MAP_SETTINGS.MAP_NULL_ARR.length; z++) {
    mapNamesArr.push([]);
    for (let x = 0; x < MAP_SETTINGS.MAP_NULL_ARR[z].length; x++) {
      mapNamesArr[z].push(0);
    };
  };
  let mapArrNames_index = 0;
  for (let z = 0; z < mapNamesArr.length; z++) {
    for (let x = 0; x < mapNamesArr[z].length; x++) {
      mapNamesArr[z][x] = MapLineArr[mapArrNames_index];
      mapArrNames_index++;
    };
  };
  GAME.map.mapNamesArr = mapNamesArr;
  buildMapFlagsArr(mapNamesArr, Regenerate);
};

function buildMapFlagsArr(mapNamesArr, Regenerate) {
  const mapFlagsArr = [];
  for (let z = 0; z < mapNamesArr.length; z++) {
    mapFlagsArr.push([]);
    for (let x = 0; x < mapNamesArr[z].length; x++) {
      let flag;
      switch (mapNamesArr[z][x]) {
        case 'city':
          flag = 0;
          break;
        case 'sand_block':
        case 'mountain_block':
        case 'swamps_block':
        case 'sea_block':
          flag = 1;
          break;
        case 'meadow':
        case 'sand':
        case 'forest':
        case 'mountain':
        case 'swamps':
        case 'sea':
          flag = 2;
          break;
          // case 'MetallPlant':
          // case 'ChemicalPlant' :
          // case 'PaperPlant' :
          // case 'GlassPlant' :
          // case 'BuildingPlant' :
          // case 'FurniturePlant':
          //       flag = 4;
          //   break;

      };
      mapFlagsArr[z].push(flag);
    };
  };
  GAME.map.mapFlagsArr = mapFlagsArr;
  buildCitiesDesignate(mapNamesArr, Regenerate);
};




function buildCitiesDesignate(mapNamesArr, Regenerate) {
  let cityCounter = 0;
  for (let z = 0; z < mapNamesArr.length; z++) {
    for (let x = 0; x < mapNamesArr[z].length; x++) {
      if (mapNamesArr[z][x] === 'city') {
        GAME.map.cities[MAP_SETTINGS.MAP_CITIES[cityCounter]].z = z;
        GAME.map.cities[MAP_SETTINGS.MAP_CITIES[cityCounter]].x = x;
        cityCounter++
      };
    };
  };
  const pack = {
    login: PLAYER.login,
    game: GAME.id,
  }
  buildCityStocks(Regenerate);




  GAME.generated = true;



  if (Regenerate) {
    socket.emit('GAME_rebuild_finished', pack);
  } else {
    socket.emit('GAME_generating_finished', pack)
  };
};


function buildCityStocks(Regenerate) {
  for (let city in GAME.map.cities) {
    GAME.map.cities[city].updateAllStocks = updateAllStocks;
    GAME.map.cities[city].getPrice = getPrice;
    GAME.map.cities[city].sellProduct = sellProduct;
    for (let product in GAME_CONTENT.PRODUCTS) {
      GAME.map.cities[city].stocks[product] = {};
      GAME.map.cities[city].stocks[product].stock = [];
      for (let i = 0; i < GAME_CONTENT.PRODUCTS[product].demand; i++) {
        GAME.map.cities[city].stocks[product].stock.push(0);
      };
      GAME.map.cities[city].stocks[product].price = buildPrice(product);
    };
  };


  function buildPrice(product) {
    const priceArr = [];

    for (let i = 0; i < GAME_CONTENT.PRODUCTS[product].demand; i++) {
      priceArr.push(0);
    };
    for (let i = 0; i < priceArr.length; i++) {
      //[x-75,x-50,x-25,x,x+25]
      const price = GAME_CONTENT.PRODUCTS[product].price
      priceArr[i] = price + (0.25 * price * (i - (priceArr.length - 2)));
    };

    return priceArr;
  };


  function updateAllStocks() {
    for (let product in this.stocks) {
      this.stocks[product].stock.unshift(0);
      this.stocks[product].stock.pop();
    };
  };


  function getPrice(product){
    for(let i=0;i<this.stocks[product].stock.length;i++){
      if(this.stocks[product].stock[i] === 1){
        if(i === 0){
          return 0;
        }else{
          return this.stocks[product].price[i-1];
        }
      }
      else{
        return this.stocks[product].price[this.stocks[product].price.length-1];
      };
    };
  };
  function sellProduct(product){
    const prise = this.getPrice(product);
    this.stocks[product].stock[0] = 1;
    return prise;

  };

  buildFactories(Regenerate);

};

function buildFactories(Regenerate) {

  if (Object.keys(GAME.gameBank.factories).length === 0 && !Regenerate) {
    for (let factoryType in GAME_CONTENT.FACTORIES) {
      const thisFactory = GAME_CONTENT.FACTORIES[factoryType];

      for (let i = 1; i <= thisFactory.count; i++) {

        const factoryObj = {
          id: factoryType + '_' + i,
          parent: thisFactory.parent,
          product: thisFactory.product,
          storage: thisFactory.storage,
          process: thisFactory.process,
          coast: thisFactory.coast,
          salary: thisFactory.salary,
          type: thisFactory.type,
          title: thisFactory.title,
          factoryType: factoryType,
          index: i,
          ceil: thisFactory.ceil,
        }
        GAME.gameBank.factories[factoryType + '_' + i] = factoryObj;
      };
    };
  }
};


document.addEventListener("DOMContentLoaded", function() {
  socket.on('GAME_generating_generateMapLine', function() {
    generateMapLineArr();
  });

  socket.on('GAME_generating_applyTurns', function(pack) {
    applyTurns(pack);
  });
  socket.on('GAME_generating_applyColors', function(colorsObj) {
    applyPlayerColors(colorsObj);
  });


  socket.on('GAME_generating_applyMapLine', function(MapLineArr) {
    applyMapLineArr(MapLineArr, false);
  });



  socket.on('GAME_scene_Start', function() {
    SCENE.initializeScene();
  });

  socket.on('GAME_scene_RegenerateStart', function() {
    SCENE.initializeScene();
    GAME.map.stativeObjects.forEach((item) => {
      if (item.type === 'road') {
        SCENE.buildGameObject.road(item);
      };
      if(item.type === 'factory'){
        SCENE.buildGameObject.factory(item);
      };
    });


  });



});

export {
  start,
  applyMapLineArr,
}
