import {
  socket
} from "/scripts/socketInit.js";
import {
  PLAYER
} from "/scripts/accPage.js";
import {
  GAME
} from "/scripts/game/GAME.js";





function continueBuild(gameClient) {
  for (let key in gameClient) {
    GAME[key] = gameClient[key];
  };
  const EnterGamePack = {
    login: PLAYER.login,
    game: GAME.id,
  };
  socket.emit('GAME_buildGame_EnteringGame', EnterGamePack);
};

function userEntered(playersInGame){
  GAME.playersInGame = playersInGame;

  for(let player in GAME.playersInGame){
    delete GAME.playersInGame[player].generatedStatus;
  };
};

function finish(){
  GAME.started = true;
};

export {
  continueBuild,
  userEntered,
  finish,
}
