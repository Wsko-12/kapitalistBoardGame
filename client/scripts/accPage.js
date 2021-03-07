import {
  socket
} from "/scripts/socketInit.js";

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
        <div class="acc_button acc_container-button" id="ACC_button_NewGames" name="new">
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



const ACC_friendsContainer = `
 <div class="acc_friendsContainer">
  <div class="acc_friendsContainer-header">
    <form id="ACC_FindFriendForm" style="display:flex;width:100%">
      <input class="acc_input" placeholder="friend login" name="login">
      <button  class="acc_button" type="submit">Find</button>
    </form>
  </div>
  <div class="acc_friendsContainer-footer">
    <div class="acc_friendsContainer-footer-top">
      <ul class="acc_friendsList" id="ACC_FriendList">


      </ul>
    </div>
    <div class="acc_friendsContainer-footer-bottom">
      <div class="acc_friendsContainer-footer-bottom-container">
        <div class="">
          Requests:
        </div>
        <div id="ACC_FriendsRequestsNumber">

        </div>
      </div>
    </div>
  </div>
</div>
`


function clearButtons(){
  document.querySelector('#ACC_button_Friends').classList.remove('acc_button-checked');
  document.querySelector('#ACC_button_Games').classList.remove('acc_button-checked');
  document.querySelector('#ACC_button_NewGames').classList.remove('acc_button-checked');
}



//выношу их из-за бага с замыканием
let buildetListFriends = null;
let RequestsNumberUpdated = null;


function deleteFriend(whom){
  console.log(`${PLAYER.login} want to delete ${whom}`);
  document.querySelector(`#ACC_FriendsListItem_${whom}`).remove();
};

function buildFriendsContainer() {
    document.querySelector('#ACC_Content').innerHTML = '';
  document.querySelector('#ACC_Content').innerHTML = ACC_friendsContainer;

  clearButtons();
  document.querySelector('#ACC_button_Friends').classList.add('acc_button-checked');




  socket.emit('ACC_CheckOnlineFriends',PLAYER.friends.all.all);


  function buildFriendsList(){

    if(buildetListFriends === null){
      //если с сервера еще не пришел ответ, то ждем дальше
      //ответы внизу скрипта, чтобы не было замыкания
      setTimeout(buildFriendsList,10);
    }else{
      //если пришел, то обрабатываем

      const list = document.querySelector('#ACC_FriendList');
      PLAYER.friends.all.online = buildetListFriends.online;
      buildetListFriends.online.forEach((item) => {
        list.insertAdjacentHTML('beforeEnd',`
          <li class="acc_friendsList-item" id="ACC_FriendsListItem_${item}">
            <div class="acc_friendsList-item-left">
              <div class="acc_friendsList-item-login">
                ${item}
              </div>
              <div class="acc_friendsList-item-online">
                online
              </div>
            </div>
            <button class="acc_friendsList-item-button" id="ACC_delete_${item}" data-login="${item}">
               ✖
            </button>
        </li>
        `);
        document.querySelector(`#ACC_delete_${item}`).onclick = function(){deleteFriend(this.dataset.login)};
      });
      PLAYER.friends.all.offline = buildetListFriends.offline;
      buildetListFriends.offline.forEach((item) => {
        list.insertAdjacentHTML('beforeEnd',`
          <li class="acc_friendsList-item" id="ACC_FriendsListItem_${item}">
            <div class="acc_friendsList-item-left">
              <div class="acc_friendsList-item-login">
                ${item}
              </div>
            </div>
            <button class="acc_friendsList-item-button" id="ACC_delete_${item}" data-login="${item}">
               ✖
            </button>
        </li>
        `);
        document.querySelector(`#ACC_delete_${item}`).onclick = function(){deleteFriend(this.dataset.login)};
      });

      //и чистим для следующего вызова buildFriendsContainer
      buildetListFriends = null;
    };
  };
  buildFriendsList();





  socket.emit('ACC_FriendsRequestsNumberUpdate',PLAYER.login);
  function updateRequestNumber(){
    if(RequestsNumberUpdated === null){
      //если с сервера еще не пришел ответ, то ждем дальше
      //ответы внизу скрипта, чтобы не было замыкания
      setTimeout(updateRequestNumber,10);
    }else{
      document.querySelector('#ACC_FriendsRequestsNumber').innerHTML = RequestsNumberUpdated;
      //и чистим для следующего вызова buildFriendsContainer
      RequestsNumberUpdated = null;
    };
  };
  updateRequestNumber();
};




function ACC_buildPage(player) {
  PLAYER = player;
  document.querySelector('#body').innerHTML = '';
  document.querySelector('#body').innerHTML = ACC_page;

  document.querySelector('#ACC_account_Login').innerHTML = player.login;

  document.querySelector('#ACC_button_Friends').onclick = buildFriendsContainer;
  // document.querySelector('#ACC_button_Games').classList.remove('acc_button-checked');
  // document.querySelector('#ACC_button_NewGames').classList.remove('acc_button-checked');

  //запускаем сразу, чтобы пришло всем друзьям уведомление
  buildFriendsContainer();

};



document.addEventListener("DOMContentLoaded", function(blaa) {
  //вынес эти функции, так как было замыкание
  socket.on('ACC_CheckOnlineFriends_True',function(friendsObj){
    buildetListFriends = friendsObj;
  });


  socket.on('ACC_FriendsRequestsNumberUpdate_True',function(playerUpdatetInfo){
    PLAYER = playerUpdatetInfo;
    RequestsNumberUpdated = playerUpdatetInfo.friends.requests.length;
  });
  socket.on('ACC_UpdateOnlineList_Disconnect',function(friendDisconnected){
    const disconIndex = PLAYER.friends.all.online.indexOf(friendDisconnected);
    if(disconIndex > -1){
      PLAYER.friends.all.online.splice(friendDisconnected, 1);
    };
    console.log(`friend disconnected: ${friendDisconnected}`);
  });
  socket.on('ACC_UpdateOnlineList_Connected',function(friendConnected){
    const cconnectedIndex = PLAYER.friends.all.online.indexOf(friendConnected);
    if(cconnectedIndex === -1){
      PLAYER.friends.all.online.push(friendConnected, 1);
    };
    console.log(`friend connected: ${friendConnected}`);
  });
});




export {
  ACC_buildPage
};
