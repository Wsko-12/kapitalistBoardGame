
function gameNULL(){
  const gameNULLOBJ = {
    id: '', //Start

    emit: GameEmit,
    emitOwner: GameEmitOwner,
    emitSecondOwner: GameEmitSecondOwner,

    started: false, //EnterGame -> sendPlayersGameStartingEnd
    playersJoined: {}, //Start
    owner: '', //Start
    owners: [], //Start
    ownerIndex: 0,
    playersInGame: {}, //EnterGame







    generated: false,

    turns: {//GenerationTurns
      line: [],
      index: 0,
    },
    map:{
      mapLine:[],//GenerationMapLine
      mapNamesArr:[],//generate client
      mapFlagsArr:[],//generate client
      cities:{//generate client
        Westown:{
          z:0,
          x:0,
        },
        Northfield:{
          z:0,
          x:0,
        },
        Southcity:{
          z:0,
          x:0,
        },
      },
      buildings:[],//generate client
    },
  };
  return gameNULLOBJ;
};


function playerNULL(login){
  const playerNULLOBJ = {
    login:login,
    balance:0,
    factories:{
      processing:{},
      production:{},
    },
    garage:{},

  };

  return playerNULLOBJ;
};


function makePlayersObj(objFromRoom){
  const newObj = {}
  for(let login in objFromRoom){
    newObj[login] = playerNULL(login);
  }
  return newObj;
};



function GameEmit(message, data) {
  for (let player in this.playersInGame) {
    if (PLAYERS_ONLINE[player]) {
      PLAYERS_ONLINE[player].emit(message, data);
    };
  };
};

function GameEmitOwner(message, data) {
  if (this.playersInGame[this.owner]) {
    if (PLAYERS_ONLINE[this.owner]) {
      PLAYERS_ONLINE[this.owner].emit(message, data);
    }
  } else {
    this.emitSecondOwner(message, data)
  };
};

function GameEmitSecondOwner(message, data) {
  for (let player of this.owners) {
    if (PLAYERS_ONLINE[player] && this.playersInGame[player]) {
      ownerIndex = this.owners.indexOf(player);
      PLAYERS_ONLINE[player].emit(message, data);
      break;
    };
  };
};







function sendPlayersGameStartingEnd(EnterGamePack) {
  GAMES[EnterGamePack.game].started = true;
  GAMES[EnterGamePack.game].emit('GAME_starting_End');
};

function sendOwnerStartGenerateGame(EnterGamePack) {
  GAMES[EnterGamePack.game].emitOwner('GAME_generating_Start');
};



module.exports.StartDevGame = function() {
  const gameServer = gameNULL();
  gameServer.id = 'DEV_GAME';
  const temp = {
    test1: 'test1',
    test2: 'test2',
    test3: 'test3',
    test4: 'test4',
  };
  gameServer.playersJoined = makePlayersObj(temp);
  gameServer.owner = 'test1';
  const gameClient = {};


  for (let player in gameServer.playersJoined) {
    gameServer.owners.push(player);
  }

  for (let key in gameServer) {
    gameClient[key] = gameServer[key];
  }
  delete gameClient.emit, gameClient.emitOwner, gameClient.emitSecondOwner;


  global.GAMES[gameServer.id] = gameServer;

  // ROOMS_WAITING[roomID].emit('GAME_starting_True',gameClient);
  // delete ROOMS_WAITING[roomID]
}

module.exports.Start = function(socket, roomID) {
  const gameServer = gameNULL();
  gameServer.id = roomID;
  gameServer.playersJoined =makePlayersObj(ROOMS_WAITING[roomID].players);
  gameServer.owner = ROOMS_WAITING[roomID].owner;

  const gameClient = {};

  for (let player in gameServer.playersJoined) {
    ameServer.owners.push(player);
  }

  for (let key in gameServer) {
    gameClient[key] = gameServer[key];
  }

  delete gameClient.emit, gameClient.emitOwner, gameClient.emitSecondOwner;


  GAMES[gameServer.id] = gameServer;

  ROOMS_WAITING[roomID].emit('GAME_starting_True', gameClient);
  delete ROOMS_WAITING[roomID]
};

module.exports.EnterGame = function(EnterGamePack) {

  PLAYERS_ONLINE[EnterGamePack.login].inGame = EnterGamePack.game;

  GAMES[EnterGamePack.game].playersInGame[EnterGamePack.login] = {
    login:EnterGamePack.login,
    generatedStatus:false,
  };

  GAMES[EnterGamePack.game].emit('GAME_starting_UserEntered', GAMES[EnterGamePack.game].playersInGame);

  //если все игроки в игре
  if (Object.keys(GAMES[EnterGamePack.game].playersJoined).length === Object.keys(GAMES[EnterGamePack.game].playersInGame).length) {
    sendPlayersGameStartingEnd(EnterGamePack);
    sendOwnerStartGenerateGame(EnterGamePack);
  };
};



module.exports.GenerationTurns = function(pack){
  GAMES[pack.game].turns = pack.turns
  GAMES[pack.game].emit('GAME_generating_Turns_True',pack.turns);
  GAMES[pack.game].emitOwner('GAME_generating_MapLine');
};

module.exports.GenerationMapLine = function(pack){
  GAMES[pack.game].map.mapLine = pack.MapLineArr;
  GAMES[pack.game].emit('GAME_generating_MapLine_True',pack.MapLineArr);
};

module.exports.FinishGeneration = function(pack){
  GAMES[pack.game].playersInGame[pack.login].generatedStatus = true;
  for(let player in GAMES[pack.game].playersInGame){
    if(!GAMES[pack.game].playersInGame[player].generatedStatus){
      return;
    };
  };
  GAMES[pack.game].emit('GAME_scene_Start');
};
