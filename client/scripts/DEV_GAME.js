import {
  socket
} from "/scripts/socketInit.js";

import {
  PLAYER,
  ACC_buildPage,
  clearButtons
} from "/scripts/accPage.js";



document.addEventListener("DOMContentLoaded", function(){

  socket.emit('DEV_newUser');

});
