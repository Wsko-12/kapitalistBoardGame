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

function RoomEmit(message,data){
  for(let player in this.players){
    if(PLAYERS_ONLINE[player]){
      PLAYERS_ONLINE[player].emit(message,data)
    };
  };
};

function RoomInit(room){
  ROOMS_WAITING[room.id] = room;
  ROOMS_WAITING[room.id].inWait = Date.now();
  ROOMS_WAITING[room.id].emit = RoomEmit;
};



module.exports.Create = function(socket,newRoomPack){
  const room = ROOMNULL(newRoomPack);
  DB.ROOM_Create(room).then(result=>{
    socket.emit('ACC_NROOM_Create_True',result.ops[0]);
    RoomInit(result.ops[0])
  });
};
module.exports.Enter = function(socket,roomID){
  if(ROOMS_WAITING[roomID]){
      socket.emit('ACC_ROOM_Enter_True',ROOMS_WAITING[roomID]);
  }else{
    DB.ROOM_Find(roomID).then(result =>{
      RoomInit(result);
      socket.emit('ACC_ROOM_Enter_True',result);
    });
  };
};
module.exports.Join = function(socket,JoinRoomPack){
  const roomID = JoinRoomPack.roomID;
  const player = JoinRoomPack.login;
  const joined = JoinRoomPack.joined;
  //на всякий случай проверяем есть ли у нас
  if(ROOMS_WAITING[roomID]){
    //проверяем не присоединился ли уже
    if(!ROOMS_WAITING[roomID].players[player]){
      //проверяем есть ли места
      if(ROOMS_WAITING[roomID].playersMax - Object.keys(ROOMS_WAITING[roomID].players).length > 0){
        attachPlayer();
      }else{
        socket.emit('ACC_ROOM_Join_False',roomID)
      };
    };
  }else{
    //если нет
    DB.ROOM_Find(roomID).then(result =>{
      RoomInit(result);
      if(!ROOMS_WAITING[roomID].players[player]){
        //проверяем есть ли места
        if(ROOMS_WAITING[roomID].playersMax - Object.keys(ROOMS_WAITING[roomID].players).length > 0){
          attachPlayer();
        }else{
          socket.emit('ACC_ROOM_Join_False',roomID)
        };
      };
    });
  };
  function attachPlayer(){
    ROOMS_WAITING[roomID].players[player] = player;
    //выкидываем из другой игры
    if(PLAYERS_ONLINE[player].joined === null){
      PLAYERS_ONLINE[player].joined = roomID;
    }else{
      if(ROOMS_WAITING[PLAYERS_ONLINE[player].joined].players[player]){
        delete ROOMS_WAITING[PLAYERS_ONLINE[player].joined].players[player];
      }
      ROOMS_WAITING[PLAYERS_ONLINE[player].joined].emit('ACC_ROOM_automaticlyUpdate',PLAYERS_ONLINE[player].joined);
      PLAYERS_ONLINE[player].joined = roomID;
    }
    socket.emit('ACC_ROOM_Join_True',roomID);

    //автоматически обновляем страницу у всех кто присоединен к комнате
    //по новому методу
    ROOMS_WAITING[roomID].emit('ACC_ROOM_automaticlyUpdate',roomID);
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
    socket.emit('ACC_ROOM_Leave_True',roomID);
    PLAYERS_ONLINE[player].joined = null;
    ROOMS_WAITING[roomID].emit('ACC_ROOM_automaticlyUpdate',roomID);
  };
};


module.exports.BuildList = function(socket){
  const gamesArr = [];
  for(let room in ROOMS_WAITING){
    if(!ROOMS_WAITING[room].private || ROOMS_WAITING[room].owner === SOCKET_LIST[socket.id].login ){
      if(ROOMS_WAITING[room].playersMax - Object.keys(ROOMS_WAITING[room].players).length >0
      || ROOMS_WAITING[room].owner === SOCKET_LIST[socket.id].login
      || ROOMS_WAITING[room].players[SOCKET_LIST[socket.id].login]){
        gamesArr.push(ROOMS_WAITING[room]);
      };
    };
  };
  socket.emit('ACC_GAMES_BuildList_True',gamesArr);
};



const DEV_ROOM = {
  id:'DEV_GAME',
  status:"Waiting",
  owner:'test1',
  players:{test1:'test1',test2:'test2',test3:'test3',test4:'test4'},
  private:false,
  playersMax:4,
  creationDate:Date.now(),
  inWait:0,
};
RoomInit(DEV_ROOM);
