const DB = require('./db.js');


function ROOMNULL(newRoomPack){
  const room = {
    id:newRoomPack.id,
    status:"Waiting",
    owner:newRoomPack.owner,
    players:{},
    private:newRoomPack.private,
    playersMax:newRoomPack.playersCount,
    creationDate:Date.now(),
    inWait:0,
  };
  return room;
};


module.exports.Create = function(socket,newRoomPack){
  const room = ROOMNULL(newRoomPack);
  DB.ROOM_Create(room).then(result=>{
    socket.emit('ACC_NROOM_Create_True',result.ops[0]);
    ROOMS_WAITING[result.ops[0].id] = result.ops[0];
    ROOMS_WAITING[result.ops[0].id].inWait = Date.now();
  });
};
module.exports.Enter = function(socket,roomID){
  if(ROOMS_WAITING[roomID]){
      socket.emit('ACC_ROOM_Enter_True',ROOMS_WAITING[roomID]);
  }else{
    DB.ROOM_Find(roomID).then(result =>{
      ROOMS_WAITING[result.id] = result;
      ROOMS_WAITING[result.id].inWait = Date.now();
      socket.emit('ACC_ROOM_Enter_True',result);
    });
  };
};
module.exports.Join = function(socket,JoinRoomPack){
  const roomID = JoinRoomPack.roomID;
  const player = JoinRoomPack.login;
  //на всякий случай проверяем есть ли у нас
  if(ROOMS_WAITING[roomID]){
    //проверяем не присоединился ли уже
    if(!ROOMS_WAITING[roomID].players[player]){
      attachPlayer();
    }
  }else{
    //если нет
    DB.ROOM_Find(roomID).then(result =>{
      ROOMS_WAITING[result.id] = result;
      ROOMS_WAITING[result.id].inWait = Date.now();
      if(!ROOMS_WAITING[roomID].players[player]){
        attachPlayer();
      };
    });
  };
  function attachPlayer(){
    ROOMS_WAITING[roomID].players[player] = player;
    console.log(`${player} attached in ${roomID}`);
    socket.emit('ACC_ROOM_Join_True',roomID);
    //автоматически обновляем страницу у всех кто присоединен к комнате
    for(let playerJoined in ROOMS_WAITING[roomID].players){
      //у присоединенного не обновляем
      if(playerJoined != player){
        //ищем в онлайне ли
        if(PLAYERS_ONLINE[playerJoined]){
          SOCKET_LIST[PLAYERS_ONLINE[playerJoined].socket].emit('ACC_ROOM_automaticlyUpdate',roomID);
        };
      };
    };
  };
};
module.exports.Leave = function(socket,LeaveRoomPack){
  const roomID = LeaveRoomPack.roomID;
  const player = LeaveRoomPack.login;
  if(ROOMS_WAITING[roomID]){
    //проверяем присоединился ли уже
    if(ROOMS_WAITING[roomID].players[player]){
      detachPlayer();
    };
  }else{
    //если нет
    DB.ROOM_Find(roomID).then(result =>{
      ROOMS_WAITING[result.id] = result;
      ROOMS_WAITING[result.id].inWait = Date.now();
      if(ROOMS_WAITING[roomID].players[player]){
        detachPlayer();
      };
    });
  };
  function detachPlayer(){
    delete ROOMS_WAITING[roomID].players[player];
    console.log(`${player} detached from ${roomID}`);
    socket.emit('ACC_ROOM_Leave_True',roomID);

    for(let playerJoined in ROOMS_WAITING[roomID].players){
      //ищем в онлайне ли
      if(PLAYERS_ONLINE[playerJoined]){
        SOCKET_LIST[PLAYERS_ONLINE[playerJoined].socket].emit('ACC_ROOM_automaticlyUpdate',roomID);
      };
    };
  };
};
