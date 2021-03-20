import {
  socket
} from "/scripts/socketInit.js";
import {sendNotification} from "/scripts/notifications.js";
import * as FRIENDS from "/scripts/accPage_Friends.js";
import * as ROOMS from "/scripts/accPage_Room.js";
let PLAYER;

const ACC_page = `
<section class="acc_section">
  <div class="acc_container">
    <div class="acc_container-header">
      <div class="acc_playerLogin" id="ACC_account_Login">
        iamwsko
      </div>
    </div>
    <div class="acc_container-footer">
      <div class="acc_container-footer-top">
        <div class="acc_button acc_container-button" id="ACC_button_Friends" name="friends">
          FRIEDS
        </div>
        <div class="acc_button acc_container-button" id="ACC_button_Games"  name="games">
          GAMES
        </div>
        <div class="acc_button acc_container-button" id="ACC_button_NewGame" name="new">
          NEW GAME
        </div>
      </div>
      <div class="acc_container-footer-bottom" id="ACC_Content">

      </div>
    </div>

  </div>
  <div class="acc_background"></div>
</section>
`;







//билд контейнера "Друзья"
function ACC_buildPage(player) {
  PLAYER = player;
  PLAYER.joinedRoom = null;
  document.querySelector('#body').innerHTML = '';
  document.querySelector('#body').innerHTML = ACC_page;
  document.querySelector('#ACC_account_Login').innerHTML = player.login;

  document.querySelector('#ACC_button_Friends').onclick = FRIENDS.buildFriendsContainer;
  document.querySelector('#ACC_button_NewGame').onclick = ROOMS.buildNewGameContainer;
  document.querySelector('#ACC_button_Games').onclick = ROOMS.buildGameContainer;
  //запускаем сразу, чтобы пришло всем друзьям уведомление
  FRIENDS.buildFriendsContainer();
};
function clearButtons(){
  document.querySelector('#ACC_button_Friends').classList.remove('acc_button-checked');
  document.querySelector('#ACC_button_Games').classList.remove('acc_button-checked');
  document.querySelector('#ACC_button_NewGame').classList.remove('acc_button-checked');
};



export {
  ACC_buildPage,
  PLAYER,
  clearButtons,
};
