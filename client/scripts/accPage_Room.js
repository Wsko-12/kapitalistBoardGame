import {
  socket
} from "/scripts/socketInit.js";
import {
  sendNotification
} from "/scripts/notifications.js";
import {
  PLAYER,
  ACC_buildPage,
  clearButtons
} from "/scripts/accPage.js";
function generateId(type,x){
    let letters = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnPpQqRrSsTtUuVvWwXxYyZz';

    let numbers = '0123456789';
    let lettersMix,numbersMix;
    for(let i=0; i<100;i++){
      lettersMix += letters;
      numbersMix += numbers;
    }

    let mainArr = lettersMix.split('').concat(numbersMix.split(''));
    let shuffledArr = mainArr.sort(function(){
                        return Math.random() - 0.5;
                    });
    let id = type +'_';
    for(let i=0; i<=x;i++){
        id += shuffledArr[i];

    };
    return id;
};



let viewedRoom = null;

const ACC_newGameContainer = `
<form id="NG_CreateGameForm">
  <div>
    <div>
      Players:
    </div>
    <div>
      <input id="NG_CreateGameForm_radio_btn-1" type="radio" name="ng_playersCount" value="1" checked>
      <label for="NG_CreateGameForm_radio_btn-1">1</label>
    </div>

    <div>
      <input id="NG_CreateGameForm_radio_btn-2" type="radio" name="ng_playersCount" value="2">
      <label for="NG_CreateGameForm_radio_btn-2">2</label>
    </div>

    <div>
      <input id="NG_CreateGameForm_radio_btn-3" type="radio" name="ng_playersCount" value="3">
      <label for="NG_CreateGameForm_radio_btn-3">3</label>
    </div>

    <div>
      <input id="NG_CreateGameForm_radio_btn-4" type="radio" name="ng_playersCount" value="4">
      <label for="NG_CreateGameForm_radio_btn-4">4</label>
    </div>
    </div>
    <div>
      <div>
        Private Game:
      </div>
    <input type="checkbox" name="ng_PrivvateGame" value="true">
  </div>
  <button type="submit" >Create game</button>
</form>
`
const ACC_gamesContainer = `
<div class="acc_roomList_container">
  <div class="acc_roomList_container-header">
    <form class="acc_roomList_searchform" id="G_FindRoomForm">
      <input type="text" name="roomID">
      <button type="submit">find</button>
    </form>
  </div>
  <div class="acc_roomList_container-body">
    <ul id="G_GamesList">

    </ul>
  </div>
  <div class="acc_roomList_container-footer">

  </div>
</div>

`








function buildGameContainer(){
  document.querySelector('#ACC_Content').innerHTML = '';
  document.querySelector('#ACC_Content').innerHTML = ACC_gamesContainer;
  clearButtons();
  document.querySelector('#ACC_button_Games').classList.add('acc_button-checked');
  document.querySelector('#G_FindRoomForm').onsubmit = function(e){
    e.preventDefault();
    // id комнаты: e.target.roomID.value
  };
  socket.emit('ACC_GAMES_BuildList');
};

function buildGameList(gamesArr){
  gamesArr.forEach((game) => {
    let waitingCount = game.playersMax - Object.keys(game.players).length;
    if(waitingCount === 0){
      waitingCount = `start`
    };

    const listItem = `
    <li class="acc_roomList-item">
      <div class="">
        ROOM ID: ${game.id}
      </div>
      <div class="">
        Status: ${game.status} ${waitingCount}
      </div>
      <button type="button" name="button" id="G_LookRoom_${game.id}">LOOK</button>
    </li>
    `
    document.querySelector('#G_GamesList').insertAdjacentHTML('beforeEnd',listItem);
    document.querySelector(`#G_LookRoom_${game.id}`).onclick = function(){
      EnterRoom(game.id);
    };
  });


};



function buildNewGameContainer() {
  document.querySelector('#ACC_Content').innerHTML = '';
  document.querySelector('#ACC_Content').innerHTML = ACC_newGameContainer;

  clearButtons();
  document.querySelector('#ACC_button_NewGame').classList.add('acc_button-checked');


  document.querySelector('#NG_CreateGameForm').onsubmit = function(e){
    e.preventDefault();
    CreateRoom(e);
  };
};

function CreateRoom(e){

    const newRoomPack = {
      id:generateId("G",6),
      playersCount: Number.parseInt(NG_CreateGameForm.ng_playersCount.value),
      private:NG_CreateGameForm.ng_PrivvateGame.checked,
      owner:PLAYER.login,
    };
    socket.emit('ACC_NROOM_Create',newRoomPack);
    LOADING_Screen(true);
};
function JoinRoom(roomID){
  const JoinRoomPack = {
    roomID:roomID,
    login:PLAYER.login,
    joined:PLAYER.joined,
  }
  socket.emit('ACC_ROOM_Join',JoinRoomPack);
  // LOADING_Screen(true);
};
function LeaveRoom(roomID){
  const LeaveRoomPack = {
    roomID:roomID,
    login:PLAYER.login,
  }
  socket.emit('ACC_ROOM_Leave',LeaveRoomPack);
  // LOADING_Screen(true);
};

function LeaveRoomOnClick(roomID){
  if(viewedRoom.players[PLAYER.login]){
    LeaveRoom(roomID);
  };
};
function JoinRoomOnClick(roomID){
  if(viewedRoom.playersMax-Object.keys(viewedRoom.players).length > 0){
    JoinRoom(roomID);
  };
};
function RefreshRoom(roomID){
  EnterRoom(roomID);
  LOADING_Screen(true);
};

function EnterRoom(roomID){
  viewedRoom = null;
  document.querySelector('#ACC_Content').innerHTML = '';
  socket.emit('ACC_ROOM_Enter',roomID);
};

function EnterRoom_True(room){
  viewedRoom = room;
  const roomDOM = `
  <div id="ACC_ROOM_${room.id}-container">
    <button id="ACC_ROOM_RefreshButton">Refresh</button>
    <div id="ACC_ROOM_id">${room.id}</div>
    <div id="ACC_ROOM_status">${room.status}</div>
    <div>
      <div>
        <div>
          Wait:
        </div>
        <div id="ACC_ROOM_waitCount">
            ${room.playersMax-Object.keys(room.players).length > 0 ? room.playersMax-Object.keys(room.players).length : 'waiting start'}
        </div>
      </div>
      <div id="ACC_ROOM_Button_container">
      </div>
      <div>
        <ul id="ACC_ROOM_list">
        </ul>
      </div>

    </div>
  </div>
`


  document.querySelector('#ACC_Content').innerHTML = roomDOM;

  document.querySelector('#ACC_ROOM_RefreshButton').onclick = function(){RefreshRoom(room.id)};


  //кнопка Join/Leave
  if(room.players[PLAYER.login]){
    if(room.owner != PLAYER.login){
      document.querySelector('#ACC_ROOM_Button_container').innerHTML = '<button id="ACC_ROOM_LeaveButton">LEAVE</button>';
      document.querySelector('#ACC_ROOM_LeaveButton').onclick = function(){LeaveRoomOnClick(room.id)};
    }
  }else{
    if(room.playersMax-Object.keys(room.players).length > 0){
      document.querySelector('#ACC_ROOM_Button_container').innerHTML = '<button id="ACC_ROOM_JoinButton">JOIN</button>';
      document.querySelector('#ACC_ROOM_JoinButton').onclick = function(){JoinRoomOnClick(room.id)};
    };
  };

  for(let player in room.players){
    const playerItem = `
      <li id="ACC_ROOM_list-item">
        ${player}
      <li>
    `;
    document.querySelector('#ACC_ROOM_list').insertAdjacentHTML('beforeEnd',playerItem);
  };

  //если owner, то вкидываем кнопку начинать игру
   if(room.owner === PLAYER.login && room.playersMax-Object.keys(room.players).length === 0){
       const startButton = `
       <button id="ACC_ROOM_StartGameButton" data-roomId="${room.id}">Start Game</button>
       `
       document.querySelector(`#ACC_ROOM_${room.id}-container`).insertAdjacentHTML('beforeEnd',startButton);
       document.querySelector('#ACC_ROOM_StartGameButton').onclick = function(){
         startGame(room.id);
       };
   };
};








function startGame(roomID){
};


document.addEventListener("DOMContentLoaded", function(){
  socket.on('ACC_NROOM_Create_True',function(room){
    viewedRoom = null;
    // buildGameContainer();
    // LOADING_Screen(false);
    EnterRoom(room.id);

    setTimeout(function(){
      if(viewedRoom){
        JoinRoomOnClick(room.id);
      };
    },100);
  });
  socket.on('ACC_ROOM_Enter_True',function(room){
    EnterRoom_True(room);
    LOADING_Screen(false);
  });

  socket.on('ACC_ROOM_Join_True',function(roomID){
    // не обновляем, есть автоапдейт
    // RefreshRoom(roomID);
    PLAYER.joinedRoom = roomID;
  });
  socket.on('ACC_ROOM_Join_False',function(roomID){
    RefreshRoom(roomID);
  });
  socket.on('ACC_ROOM_Leave_True',function(roomID){
    RefreshRoom(roomID);
  });
  socket.on('ACC_ROOM_automaticlyUpdate',function(roomID){
    //когда кто-то присоединяется к комнате или покинул ее, у него автоматом сработает Refresh
    //проверяем на той ли он странице
    if(document.querySelector(`#ACC_ROOM_${roomID}-container`)){
      RefreshRoom(roomID);
    };
  });

  socket.on('ACC_GAMES_BuildList_True',function(gamesArr){
    buildGameList(gamesArr);
  });
});

export {
  buildNewGameContainer,
  buildGameContainer
};
