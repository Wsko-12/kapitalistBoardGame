
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
          mesh:null,
          stock:null,
        },
        Northfield:{
          z:0,
          x:0,
          mesh:null,
          stock:null,
        },
        Southcity:{
          z:0,
          x:0,
          mesh:null,
          stock:null,
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
    colorIndex:null,
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









module.exports.Build = function(socket, roomID) {
  const gameServer = gameNULL();
  gameServer.id = roomID;
  gameServer.playersJoined = makePlayersObj(ROOMS_WAITING[roomID].players);
  gameServer.owner = ROOMS_WAITING[roomID].owner;

  const gameClient = {};

  for (let player in gameServer.playersJoined) {
    gameServer.owners.push(player);
  }

  for (let key in gameServer) {
    gameClient[key] = gameServer[key];
  }

  delete gameClient.emit, gameClient.emitOwner, gameClient.emitSecondOwner;


  GAMES[gameServer.id] = gameServer;

  ROOMS_WAITING[roomID].emit('GAME_buildGame_Continue', gameClient);
  delete ROOMS_WAITING[roomID]
};

module.exports.EnteringGame = function(EnterGamePack) {

  PLAYERS_ONLINE[EnterGamePack.login].inGame = EnterGamePack.game;

  GAMES[EnterGamePack.game].playersInGame[EnterGamePack.login] = {
    login:EnterGamePack.login,
    generatedStatus:false,
  };

  GAMES[EnterGamePack.game].emit('GAME_buildGame_UserEntered', GAMES[EnterGamePack.game].playersInGame);

  //если все игроки в игре
  if (Object.keys(GAMES[EnterGamePack.game].playersJoined).length === Object.keys(GAMES[EnterGamePack.game].playersInGame).length) {
    sendPlayersGameStartingEnd(EnterGamePack);
    sendOwnerStartGenerateGame(EnterGamePack);
  };
};

function sendPlayersGameStartingEnd(EnterGamePack) {
  GAMES[EnterGamePack.game].started = true;
  GAMES[EnterGamePack.game].emit('GAME_buildGame_Finish');
};

function sendOwnerStartGenerateGame(EnterGamePack) {
  GAMES[EnterGamePack.game].emitOwner('GAME_generating_Start');
};




module.exports.GenerationTurns = function(pack){
  GAMES[pack.game].turns = pack.turns
  GAMES[pack.game].emit('GAME_generating_applyTurns',pack.turns);
  GAMES[pack.game].emitOwner('GAME_generating_generateMapLine');
};

module.exports.GenerationMapLine = function(pack){
  GAMES[pack.game].map.mapLine = pack.MapLineArr;
  GAMES[pack.game].emit('GAME_generating_applyMapLine',pack.MapLineArr);
};

module.exports.FinishGeneration = function(pack){
  GAMES[pack.game].playersInGame[pack.login].generatedStatus = true;
  for(let player in GAMES[pack.game].playersInGame){
    if(!GAMES[pack.game].playersInGame[player].generatedStatus){
      return;
    };
  };
  GAMES[pack.game].generated = true;
  GAMES[pack.game].emit('GAME_scene_Start');

};

module.exports.GenerationColors = function(pack){
  GAMES[pack.game].emit('GAME_generating_applyColors',pack.colors);
};



module.exports.ReturnToGame = function(pack){
  GAMES[pack.game].emitOwner('GAME_rebuild_getInfo',pack);
};

module.exports.ReturnPlayerToGame = function(pack){
  if(PLAYERS_ONLINE[pack.login]){
    const returnGamePack = gameNULL();
    delete returnGamePack.emit, returnGamePack.emitOwner, returnGamePack.emitSecondOwner;

    returnGamePack.id = pack.game;

    returnGamePack.generated = GAMES[pack.game].generated;
    returnGamePack.started = GAMES[pack.game].started;

    returnGamePack.owner = GAMES[pack.game].owner;
    returnGamePack.owners = GAMES[pack.game].owners;
    returnGamePack.ownerIndex = GAMES[pack.game].ownerIndex;
    returnGamePack.turns = GAMES[pack.game].turns;
    returnGamePack.map.mapLine = GAMES[pack.game].map.mapLine;


    returnGamePack.playersJoined = pack.gameInfo.playersJoined;
    returnGamePack.playersInGame = pack.gameInfo.playersInGame;

    PLAYERS_ONLINE[pack.login].inGame = pack.game;
    PLAYERS_ONLINE[pack.login].emit('GAME_rebuild_finish',returnGamePack);
  };
};

module.exports.FinishRebuild = function(pack){
  GAMES[pack.game].emit('GAME_inGame_Conected', pack.login);


  GAMES[pack.game].playersInGame[pack.login] = {
    login: pack.login,
    generatedStatus: true,
  };


  if(PLAYERS_ONLINE[pack.login]){
    PLAYERS_ONLINE[pack.login].emit('GAME_buildGame_UserEntered',GAMES[pack.game].playersInGame);
    PLAYERS_ONLINE[pack.login].emit('GAME_scene_RegenerateStart');
  };

};
