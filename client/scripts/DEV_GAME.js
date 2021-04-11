import {
  socket
} from "/scripts/socketInit.js";

import {
  PLAYER,
  ACC_buildPage,
  clearButtons
} from "/scripts/accPage.js";
import {
  startGame,
  returnToGame,
} from "/scripts/accPage_Room.js";


document.addEventListener("DOMContentLoaded", function(){

  socket.emit('DEV_newUser');

  socket.on('DEV__StartGameFromRoom',function(){
    const button = `
    <button id="startGameButton">START</button>
    `
    document.querySelector('body').insertAdjacentHTML('beforeEnd',button);
      document.querySelector('#startGameButton').onclick = function(){
        startGame('DEV_GAME');
      };
  });

  socket.on('DEV__ReturnToGameFromRoom',function(){
    const button = `
    <button id="returnGameButton">RETUN TO GAME</button>
    `
    document.querySelector('body').insertAdjacentHTML('beforeEnd',button);
      document.querySelector('#returnGameButton').onclick = function(){
        document.querySelector('#returnGameButton').remove();
        returnToGame('DEV_GAME');
      };
  });

});
