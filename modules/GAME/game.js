


function GameEmit(message,data){
  for(let player in this.playersInGame){
    if(PLAYERS_ONLINE[player]){
      PLAYERS_ONLINE[player].emit(message,data);
    };
  };
};

function GameEmitOwner(message,data){
  if(this.playersInGame[this.owner]){
    PLAYERS_ONLINE[this.playersInGame[this.owner]].emit(message,data);
  }
};
module.exports.StartDevGame = function(){
  const gameServer = {
    id:'DEV_GAME',
    playersJoined:{test1:'test1',test2:'test2',test3:'test3',test4:'test4',},
    playersInGame:{},
    owner:'test1',
    emit:GameEmit,
    emitOwner:GameEmitOwner,
  };
  const gameClient = {};

  for (let key in gameServer) {
    gameClient[key] = gameServer[key];
  }
  delete gameClient.emit, gameClient.emitOwner;


  global.GAMES[gameServer.id] = gameServer;

  // ROOMS_WAITING[roomID].emit('GAME_starting_True',gameClient);
  // delete ROOMS_WAITING[roomID]
}

module.exports.Start = function(socket, roomID){
  const gameServer = {
    id:roomID,
    playersJoined:ROOMS_WAITING[roomID].players,
    playersInGame:{},
    owner:ROOMS_WAITING[roomID].owner,
    emit:GameEmit,
    emitOwner:GameEmitOwner,
  };
  const gameClient = {};

  for (let key in gameServer) {
    gameClient[key] = gameServer[key];
  }
  delete gameClient.emit, gameClient.emitOwner;


  GAMES[gameServer.id] = gameServer;

  ROOMS_WAITING[roomID].emit('GAME_starting_True',gameClient);
  delete ROOMS_WAITING[roomID]
};

module.exports.EnterGame = function(EnterGamePack){
    // const EnterGamePack = {
    //   login:PLAYER.login,
    //   game:GAME.id,
    // };

    GAMES[EnterGamePack.game].playersInGame[EnterGamePack.login] = EnterGamePack.login;

    GAMES[EnterGamePack.game].emit('GAME_starting_UserEntered',GAMES[EnterGamePack.game].playersInGame);

    //если все игроки в игре
    if(Object.keys(GAMES[EnterGamePack.game].playersJoined).length === Object.keys(GAMES[EnterGamePack.game].playersInGame).length){
      GAMES[EnterGamePack.game].emitOwner('GAME_StartGenerateGame');
    };
};
