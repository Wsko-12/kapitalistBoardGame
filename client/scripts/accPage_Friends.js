import {
  socket
} from "/scripts/socketInit.js";
import {sendNotification} from "/scripts/notifications.js";
import {PLAYER,ACC_buildPage,clearButtons} from "/scripts/accPage.js";
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
//выстраивание контейнера friends
//выношу их из-за бага с замыканием
let buildetListFriends = null;
let RequestsNumberUpdated = null;
function buildFriendsContainer() {
  document.querySelector('#ACC_Content').innerHTML = '';
  document.querySelector('#ACC_Content').innerHTML = ACC_friendsContainer;
  buildetListFriends = null;

  clearButtons();
  document.querySelector('#ACC_button_Friends').classList.add('acc_button-checked');


  //на форму с поиском по логину выставляем функцию
  let ACC_FindFriendForm = document.querySelector('#ACC_FindFriendForm');
  ACC_FindFriendForm.onsubmit = function FORM_findFriend(e){
    e.preventDefault();
    findFriend(this);
    clearButtons();
  };

  socket.emit('ACC_CheckOnlineFriends',PLAYER.login);


  function buildFriendsList(){

    if(buildetListFriends === null){
      //если с сервера еще не пришел ответ, то ждем дальше
      //ответы внизу скрипта, чтобы не было замыкания
      setTimeout(buildFriendsList,10);
    }else{
      //если пришел, то обрабатываем

      const list = document.querySelector('#ACC_FriendList');
      //чистим список
      list.innerHTML = '';
      //добавляем ему игроков в онлайн
      PLAYER.friends.all.online = buildetListFriends.online;
      //набиваем спиок онлайновыми игроками
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
      //добавляем ему игроков в офлайн
      PLAYER.friends.all.offline = buildetListFriends.offline;
      //набиваем спиок офлайновымми игроками
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

      //на кнопку Запросы цепляем функцию. Но сначала чистим ее на всякий
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
    //если с сервера еще не пришел ответ, то ждем дальше
    //ответы внизу скрипта, чтобы не было замыкания
    setTimeout(updateRequestNumber,10);
  }else{
    document.querySelector('#ACC_FriendsRequestsNumber').innerHTML = RequestsNumberUpdated;
    //и чистим для следующего вызова buildFriendsContainer
    RequestsNumberUpdated = null;
  };
};







//пользователь ищет логин друга
function findFriend(DOM){
  //берем из форм логин кого ищют и кто ищет
  const findFriendRequest = {
    from:PLAYER.login,
    search:DOM.searchdLogin.value,
  };
    //отправляем запрос на сервер
  socket.emit('ACC_FindFriend',findFriendRequest);
};
//Сервер не нашел игрока по логину. Вызываеется по ответу с сервера
function findFriend_False(){
  //чистим список
  const ACC_FriendList = document.querySelector('#ACC_FriendList');
  ACC_FriendList.innerHTML = '';
  //и пихаем в него элемент "Нет результата"
  const listItem = `
      <li class="acc_friendsList-item">
      <div class="acc_friendsList-item-left">
        <div class="acc_friendsList-item-login">
          No results
        </div>
      </div>
      </li>
    `
    ACC_FriendList.insertAdjacentHTML('beforeEnd',listItem);

};
//Сервер нашел игрока по логину. Вызываеется по ответу с сервера
function findFriend_True(findFriend_result){
  //чистим список
  const ACC_FriendList = document.querySelector('#ACC_FriendList');
  ACC_FriendList.innerHTML = '';
    //и пихаем в него элемент с результатом
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
      `
    ACC_FriendList.insertAdjacentHTML('beforeEnd',listItem);
    document.querySelector(`#ACC_sendFriendRequest_${findFriend_result.login}`).onclick = function(){sendFriendRequest(this.dataset.login);};
    //проверяем не выслан ли уже запрос
    if(PLAYER.friends.sends.indexOf(findFriend_result.login) > -1){
      //если выслан, то меняем кнопку
      sendFriendRequest_True(findFriend_result.login);
    };
};


//пользователь высылает запрос к другому игроку
function sendFriendRequest(friend){
  const sendFriendRequest_pack = {
    from:PLAYER.login,
    to:friend,
  };
  socket.emit('ACC_SendFriendRequest',sendFriendRequest_pack);
};
//пользователь выслал запрос другому игроку. Вызываеется по ответу с сервера
function sendFriendRequest_True(friend){
  //удаляем кнопку добавить
  document.querySelector(`#ACC_sendFriendRequest_${friend}`).remove();
  //добавляем в свои sends
  if(PLAYER.friends.sends.indexOf(friend) === -1){
    PLAYER.friends.sends.push(friend);
  }
  //создаем кнопку отменить
  const cancelButton = `
  <button class="acc_friendsList-item-button" id="ACC_cancelFriendRequest_${friend}" data-login="${friend}">
     cancel
  </button>
  `

    //добавляем кнопку отменить
  document.querySelector(`#ACC_FindFriendListItem_${friend}`).insertAdjacentHTML('beforeEnd',cancelButton);
  document.querySelector(`#ACC_cancelFriendRequest_${friend}`).onclick = function(){canselFriendRequest(friend)};
};



//пользователь отмменяет запрос к другому игроку
function canselFriendRequest(friend){
    const pack = {
    user:PLAYER.login,
    friend:friend,
  };
    socket.emit('ACC_CancelFriendRequest',pack);
};
//пользователь отмменил запрос к другому игроку. Вызываеется по ответу с сервера
function cancelFriendRequest_True(friend){
  //убираем из своих sends
  if(PLAYER.friends.sends.indexOf(friend) > -1){
    PLAYER.friends.sends.splice(PLAYER.friends.sends.indexOf(friend),1);
  };
  //удаляем кнопку отменить
  document.querySelector(`#ACC_cancelFriendRequest_${friend}`).remove();
  const addButton = `
  <button class="acc_friendsList-item-button" id="ACC_sendFriendRequest_${friend}" data-login="${friend}">
     add
  </button>
  `
  //добавляем кнопку добавить
  document.querySelector(`#ACC_FindFriendListItem_${friend}`).insertAdjacentHTML('beforeEnd',addButton);
  document.querySelector(`#ACC_sendFriendRequest_${friend}`).onclick = function(){sendFriendRequest(friend);};
};





//Билд контейнера "Запросы"
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

    //скидываем на сервер чтобы он нашел кто онлайн
    socket.emit('ACC_BuildRequestsList',PLAYER.login);
      //дополнительная функция, чтобы успеть получить ответ от сервера для значка 'online'

    function buildRequestsList(){
      if(buildetRequestsList === null){
        //ответ еще не пришел
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
        //чистим для следующего вызова
        buildetRequestsList = null
      };
    };
    buildRequestsList();
};

function addFriend(friend){
  let pack = {
    user: PLAYER.login,
    friend:friend,
  }
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

  //вынес эти функции, так как было замыкание
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

  //С сервера пришло уведомление что друг покинул
  socket.on('ACC_UpdateOnlineList_Disconnect',function(friendDisconnected){
    const disconIndex = PLAYER.friends.all.online.indexOf(friendDisconnected);
    if(disconIndex > -1){
      PLAYER.friends.all.online.splice(friendDisconnected, 1);
    };
    sendNotification('friendOffline',friendDisconnected,true);
  });

  //С сервера пришло уведомление что друг зашел в игру
  socket.on('ACC_UpdateOnlineList_Connected',function(friendConnected){
    const connectedIndex = PLAYER.friends.all.online.indexOf(friendConnected);
    if(connectedIndex === -1){
      PLAYER.friends.all.online.push(friendConnected, 1);
    };
    sendNotification('friendOnline',friendConnected,true);
  });

  //с сервера пришло уведомлеения о заявке в друзья
  socket.on('ACC_FriendsRequestNotification',function(friend){
    sendNotification('friendsRequest',friend,true);
    //если на странице есть элемент Requests
    if(document.querySelector('#ACC_FriendsRequestsNumber')){
        socket.emit('ACC_FriendsRequestsNumberUpdate',PLAYER.login);
        updateRequestNumber();
    };
  });
  //с сервера пришло уведомлеения о добавлении в друзья
  socket.on('ACC_FriendsAddNotification',function(friend){
    socket.emit('ACC_CheckOnlineFriends',PLAYER.login);
    sendNotification('friendsAdd',friend,true);
  });


  //Пришел ответ с сервера по поиску игрока
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
  //ситуакия когда человек искал поользователя, от которого у него уже был запрос
  socket.on('ACC_friendAddedFromFind',function(friend){
    if(document.querySelector(`#ACC_FindFriendListItem_${friend}`)){
      document.querySelector(`#ACC_FindFriendListItem_${friend}`).remove();
    };
    //если на странице есть элемент Requests
    if(document.querySelector('#ACC_FriendsRequestsNumber')){
        socket.emit('ACC_FriendsRequestsNumberUpdate',PLAYER.login);
        updateRequestNumber();
    };
  });
});
export{
  buildFriendsContainer
};
