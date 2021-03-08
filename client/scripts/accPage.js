import {
  socket
} from "/scripts/socketInit.js";
import {sendNotification} from "/scripts/notifications.js";
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
      <input class="acc_input" placeholder="search login" name="searchdLogin">
      <button  class="acc_button" type="submit">Find</button>
    </form>
  </div>
  <div class="acc_friendsContainer-footer" >
    <div class="acc_friendsContainer-footer-top">
      <ul class="acc_friendsList" id="ACC_FriendList">


      </ul>
    </div>
    <div class="acc_friendsContainer-footer-bottom" id="ACC_FriendsRequestsButton">
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
function ACC_buildPage(player) {
  PLAYER = player;
  document.querySelector('#body').innerHTML = '';
  document.querySelector('#body').innerHTML = ACC_page;
  document.querySelector('#ACC_account_Login').innerHTML = player.login;
  document.querySelector('#ACC_button_Friends').onclick = buildFriendsContainer;
  buildFriendsContainer();

};
function clearButtons(){
  document.querySelector('#ACC_button_Friends').classList.remove('acc_button-checked');
  document.querySelector('#ACC_button_Games').classList.remove('acc_button-checked');
  document.querySelector('#ACC_button_NewGames').classList.remove('acc_button-checked');
};
let buildetListFriends = null;
let RequestsNumberUpdated = null;
function buildFriendsContainer() {
  document.querySelector('#ACC_Content').innerHTML = '';
  document.querySelector('#ACC_Content').innerHTML = ACC_friendsContainer;
  buildetListFriends = null;
  clearButtons();
  document.querySelector('#ACC_button_Friends').classList.add('acc_button-checked');
  let ACC_FindFriendForm = document.querySelector('#ACC_FindFriendForm');
  ACC_FindFriendForm.onsubmit = function FORM_findFriend(e){
    e.preventDefault();
    findFriend(this);
    clearButtons();
  };
  socket.emit('ACC_CheckOnlineFriends',PLAYER.login);
  function buildFriendsList(){
    if(buildetListFriends === null){
      setTimeout(buildFriendsList,10);
    }else{
      const list = document.querySelector('#ACC_FriendList');
      list.innerHTML = '';
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
      buildetListFriends = null;
      document.querySelector('#ACC_FriendsRequestsButton').onclick = null;
      document.querySelector('#ACC_FriendsRequestsButton').onclick = buildRequestContainer;
    };
  };
  buildFriendsList();
  RequestsNumberUpdated === null
  socket.emit('ACC_FriendsRequestsNumberUpdate',PLAYER.login);
  updateRequestNumber();
};
function updateRequestNumber(){
  if(RequestsNumberUpdated === null){
    setTimeout(updateRequestNumber,10);
  }else{
    document.querySelector('#ACC_FriendsRequestsNumber').innerHTML = RequestsNumberUpdated;
    RequestsNumberUpdated = null;
  };
};
function findFriend(DOM){
  const findFriendRequest = {
    from:PLAYER.login,
    search:DOM.searchdLogin.value,
  };
  socket.emit('ACC_FindFriend',findFriendRequest);
};
function findFriend_False(){
  const ACC_FriendList = document.querySelector('#ACC_FriendList');
  ACC_FriendList.innerHTML = '';
  const listItem = `
      <li class="acc_friendsList-item">
      <div class="acc_friendsList-item-left">
        <div class="acc_friendsList-item-login">
          No results
        </div>
      </div>
      </li>
    `;
    ACC_FriendList.insertAdjacentHTML('beforeEnd',listItem);
};
function findFriend_True(findFriend_result){
  const ACC_FriendList = document.querySelector('#ACC_FriendList');
  ACC_FriendList.innerHTML = '';
    let offline = `style="display:none;"` ;
    if(findFriend_result.online){
      offline = '';
    };
    const listItem = `
    <li class="acc_friendsList-item" id="ACC_FindFriendListItem_${findFriend_result.login}">
      <div class="acc_friendsList-item-left">
        <div class="acc_friendsList-item-login">
          ${findFriend_result.login}
        </div>
        <div class="acc_friendsList-item-online" ${offline}>
          online
        </div>
      </div>
      <button class="acc_friendsList-item-button" id="ACC_sendFriendRequest_${findFriend_result.login}" data-login="${findFriend_result.login}">
         add
      </button>
  </li>
      `;
    ACC_FriendList.insertAdjacentHTML('beforeEnd',listItem);
    document.querySelector(`#ACC_sendFriendRequest_${findFriend_result.login}`).onclick = function(){sendFriendRequest(this.dataset.login);};
    if(PLAYER.friends.sends.indexOf(findFriend_result.login) > -1){
      sendFriendRequest_True(findFriend_result.login);
    };
};
function sendFriendRequest(friend){
  const sendFriendRequest_pack = {
    from:PLAYER.login,
    to:friend,
  };
  socket.emit('ACC_SendFriendRequest',sendFriendRequest_pack);
};
function sendFriendRequest_True(friend){
  document.querySelector(`#ACC_sendFriendRequest_${friend}`).remove();
  if(PLAYER.friends.sends.indexOf(friend) === -1){
    PLAYER.friends.sends.push(friend);
  };
  const cancelButton = `
  <button class="acc_friendsList-item-button" id="ACC_cancelFriendRequest_${friend}" data-login="${friend}">
     cancel
  </button>
  `
  document.querySelector(`#ACC_FindFriendListItem_${friend}`).insertAdjacentHTML('beforeEnd',cancelButton);
  document.querySelector(`#ACC_cancelFriendRequest_${friend}`).onclick = function(){canselFriendRequest(friend)};
};
function canselFriendRequest(friend){
    const pack = {
    user:PLAYER.login,
    friend:friend,
  };
    socket.emit('ACC_CancelFriendRequest',pack);
};
function cancelFriendRequest_True(friend){
  if(PLAYER.friends.sends.indexOf(friend) > -1){
    PLAYER.friends.sends.splice(PLAYER.friends.sends.indexOf(friend),1);
  };
  document.querySelector(`#ACC_cancelFriendRequest_${friend}`).remove();
  const addButton = `
  <button class="acc_friendsList-item-button" id="ACC_sendFriendRequest_${friend}" data-login="${friend}">
     add
  </button>
  `
  document.querySelector(`#ACC_FindFriendListItem_${friend}`).insertAdjacentHTML('beforeEnd',addButton);
  document.querySelector(`#ACC_sendFriendRequest_${friend}`).onclick = function(){sendFriendRequest(friend);};
};
let buildetRequestsList = null;
function buildRequestContainer(){
    buildetRequestsList = null
    clearButtons();
    const ACC_RequestContant = `
    <div class='acc_requestsContainer'>
      <div class="acc_requestsContainer-title">
        Requests
      </div>
      <ul class='acc_friendsList-list' style="width:90%;margin:auto" id="ACC_addFriendList">

      </ul>
    </div>
    `;
    document.querySelector('#ACC_Content').innerHTML = '';
    document.querySelector('#ACC_Content').innerHTML = ACC_RequestContant;
    socket.emit('ACC_BuildRequestsList',PLAYER.login);
    function buildRequestsList(){
      if(buildetRequestsList === null){
        setTimeout(buildRequestsList,10);
      }else{
        buildetRequestsList.online.forEach((friend =>{
          const list = `
          <li class = 'acc_friendsList-item' id="ACC_addFriendList_item_${friend}">
            <div class="acc_friendsList-item-left">
              <div class="acc_friendsList-item-login">
                ${friend}
              </div>
              <div class="acc_friendsList-item-online">
                online
              </div>
            </div>
            <button class="acc_friendsList-item-button" id="ACC_addFriend_button_${friend}" data-login="${friend}">
               +
            </button>
          </li>
          `;
            document.querySelector('#ACC_addFriendList').insertAdjacentHTML('beforeEnd',list);
            document.querySelector(`#ACC_addFriend_button_${friend}`).onclick = function(){addFriend(friend)};
        }));
        buildetRequestsList.offline.forEach((friend =>{
          const list = `
          <li class = 'acc_friendsList-item' id="ACC_addFriendList_item_${friend}">
            <div class="acc_friendsList-item-left">
              <div class="acc_friendsList-item-login">
                ${friend}
              </div>
            </div>
            <button class="acc_friendsList-item-button" id="ACC_addFriend_button_${friend}" data-login="${friend}">
               +
            </button>
          </li>
          `;
          document.querySelector('#ACC_addFriendList').insertAdjacentHTML('beforeEnd',list);
          document.querySelector(`#ACC_addFriend_button_${friend}`).onclick = function(){addFriend(friend)};
        }));
        buildetRequestsList = null;
      };
    };
    buildRequestsList();
};
function addFriend(friend){
  let pack = {
    user: PLAYER.login,
    friend:friend,
  };
  socket.emit(`ACC_AddToFriend`,pack);
};
function deleteFriend(friend){
  document.querySelector(`#ACC_FriendsListItem_${friend}`).remove();
  const pack = {
    user:PLAYER.login,
    friend:friend,
  };
  socket.emit('ACC_deleteFriend',pack);
};
document.addEventListener("DOMContentLoaded", function(){
  socket.on('ACC_CheckOnlineFriends_True',function(friendsObj){
    PLAYER.friends.all = friendsObj;
    buildetListFriends = friendsObj;
  });
  socket.on('ACC_FriendsRequestsNumberUpdate_True',function(playerRequestsArr){
    PLAYER.friends.requests = playerRequestsArr;
    RequestsNumberUpdated = playerRequestsArr.length;
  });
  socket.on('ACC_BuildRequestsList_True',function(pack){
    PLAYER.friends.requests = pack.requestsArr;
    buildetRequestsList = pack.requestsBuildetObj;
  });
  socket.on('ACC_UpdateOnlineList_Disconnect',function(friendDisconnected){
    const disconIndex = PLAYER.friends.all.online.indexOf(friendDisconnected);
    if(disconIndex > -1){
      PLAYER.friends.all.online.splice(friendDisconnected, 1);
    };
    sendNotification('friendOffline',friendDisconnected,true);
  });
  socket.on('ACC_UpdateOnlineList_Connected',function(friendConnected){
    const cconnectedIndex = PLAYER.friends.all.online.indexOf(friendConnected);
    if(cconnectedIndex === -1){
      PLAYER.friends.all.online.push(friendConnected, 1);
    };
    sendNotification('friendOnline',friendConnected,true);
  });
  socket.on('ACC_FriendsRequestNotification',function(friend){
    sendNotification('friendsRequest',friend,true);
    if(document.querySelector('#ACC_FriendsRequestsNumber')){
        socket.emit('ACC_FriendsRequestsNumberUpdate',PLAYER.login);
        updateRequestNumber();
    };
  });
  socket.on('ACC_FriendsAddNotification',function(friend){
    socket.emit('ACC_CheckOnlineFriends',PLAYER.login);
    sendNotification('friendsAdd',friend,true);
  });
  socket.on('ACC_FindFriend_False',function(){
    findFriend_False();
  });
  socket.on('ACC_FindFriend_True',function(findFriend_result){
    findFriend_True(findFriend_result);
    PLAYER.friends.sends = findFriend_result.sendsArr;
  });
  socket.on('ACC_sendFriendRequest_True',function(friend){
    sendFriendRequest_True(friend);
  });
  socket.on('ACC_CancelFriendRequest_True',function(friend){
    cancelFriendRequest_True(friend);
  });
  socket.on('ACC_AddToFriend_True',function(pack){
    PLAYER.friends.all.all = pack.friendArr;
    if(document.querySelector(`#ACC_addFriendList_item_${pack.friend}`)){
      document.querySelector(`#ACC_addFriendList_item_${pack.friend}`).remove()
    };
  });
  socket.on(`ACC_deleteFriend_True`, function(pack){
    PLAYER.friends.all.all = pack.friendArr;
    if(document.querySelector(`#ACC_FriendsListItem_${pack.friend}`)){
      document.querySelector(`#ACC_FriendsListItem_${pack.friend}`).remove()
    };
  });
  socket.on('ACC_friendAddedFromFind',function(friend){
    if(document.querySelector(`#ACC_FindFriendListItem_${friend}`)){
      document.querySelector(`#ACC_FindFriendListItem_${friend}`).remove();
    };
    if(document.querySelector('#ACC_FriendsRequestsNumber')){
        socket.emit('ACC_FriendsRequestsNumberUpdate',PLAYER.login);
        updateRequestNumber();
    };
  });
});
export {
  ACC_buildPage
};
