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

`






function buildGameContainer(){
  document.querySelector('#ACC_Content').innerHTML = '';
  document.querySelector('#ACC_Content').innerHTML = ACC_gamesContainer;
  clearButtons();
  document.querySelector('#ACC_button_Games').classList.add('acc_button-checked');

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
  }
  socket.emit('ACC_ROOM_Join',JoinRoomPack);
  LOADING_Screen(true);
};
function LeaveRoom(roomID){
  const LeaveRoomPack = {
    roomID:roomID,
    login:PLAYER.login,
  }
  socket.emit('ACC_ROOM_Leave',LeaveRoomPack);
  LOADING_Screen(true);
};

function LeaveRoomOnClick(roomID,click){
  document.querySelector('#ACC_ROOM_JoinButton').onclick = function(){JoinRoomOnClick(roomID,true)};
  document.querySelector('#ACC_ROOM_JoinButton').innerHTML = 'Join';
  if(click){
    LeaveRoom(roomID);
  }
};
function JoinRoomOnClick(roomID,click){
  document.querySelector('#ACC_ROOM_JoinButton').onclick = function(){LeaveRoomOnClick(roomID,true)};
  document.querySelector('#ACC_ROOM_JoinButton').innerHTML = 'Leave';
  //нужно для постороения комнаты. Во время стройки он проверяет есть ли игрок уже в списке если есть то только меняет кнопку(click = false)
  if(click){
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
  <div id="ACC_ROOM_RefreshButton_${room.id}-container">
    <button id="ACC_ROOM_RefreshButton">Refresh</button>
    <div id="ACC_ROOM_id">${room.id}</div>
    <div id="ACC_ROOM_status">${room.status}</div>
    <div>
      <div>
        <div>
          Wait:
        </div>
        <div id="ACC_ROOM_waitCount">
            ${room.playersMax-Object.keys(room.players).length}
        </div>
      </div>
      <button id="ACC_ROOM_JoinButton">JOIN</button>
      <div>
        <ul id="ACC_ROOM_list">
        </ul>
      </div>

    </div>
  </div>
`


  document.querySelector('#ACC_Content').innerHTML = roomDOM;
  document.querySelector('#ACC_ROOM_JoinButton').onclick = function(){JoinRoomOnClick(room.id,true)};
  document.querySelector('#ACC_ROOM_RefreshButton').onclick = function(){RefreshRoom(room.id)};

  for(let player in room.players){
    const playerItem = `
      <li id="ACC_ROOM_list-item">
        ${player}
      <li>
    `;
    document.querySelector('#ACC_ROOM_list').insertAdjacentHTML('beforeEnd',playerItem);
  };


  if(room.players[PLAYER.login]){
    //просто подменяем кнопку(click = false)
    JoinRoomOnClick(room.id,false)
  };
  //если owner, то вкидываем кнопку начинать игру
  if(room.owner = PLAYER.login){
    const startButton = `
    <button id="ACC_ROOM_StartGameButton" data-roomId="${room.id}">Start Game</button>
    `
    document.querySelector(`#ACC_ROOM_RefreshButton_${room.id}-container`).insertAdjacentHTML('beforeEnd',startButton);
    document.querySelector('#ACC_ROOM_StartGameButton').onclick = function(){
      startGame(room.id);
    };
  };
};








function startGame(roomID){
  console.log('start game ',roomID)
}


document.addEventListener("DOMContentLoaded", function(){
  socket.on('ACC_NROOM_Create_True',function(room){
    viewedRoom = null;
    EnterRoom(room.id);
    //имитация нажатия на кнопку join. Замыкание чтобы дожидаться ответа от сервера
    function automaticlyJoinRoom(){
      if(viewedRoom!= null){
        //имитируем клик
        JoinRoomOnClick(room.id,true);
      }else{
        setTimeout(automaticlyJoinRoom,100);
      };
    }
    automaticlyJoinRoom();
  });
  socket.on('ACC_ROOM_Enter_True',function(room){
    EnterRoom_True(room);
    LOADING_Screen(false);
  });
  socket.on('ACC_ROOM_Join_True',function(roomID){
    RefreshRoom(roomID);
  });
  socket.on('ACC_ROOM_Leave_True',function(roomID){
    RefreshRoom(roomID);
  });
  socket.on('ACC_ROOM_automaticlyUpdate',function(roomID){
    //когда кто-то присоединяется к комнате или покинул ее, у него автоматом сработает Refresh
    //проверяем на той ли он странице
    if(document.querySelector(`#ACC_ROOM_RefreshButton_${roomID}-container`)){
      RefreshRoom(roomID);
    };
  });
});

export {
  buildNewGameContainer,
  buildGameContainer
};
