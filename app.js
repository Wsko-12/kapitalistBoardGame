//auth 0.0.1

//friends 0.0.2



//lobby 0.0.1
// -дописать поиск приватных игр
// -сделать дизайн





const express = require('express');
const app = express();
const http = require('http').createServer(app);
const PORT = process.env.PORT || 3000;
const DB = require('./modules/db.js');
const AUTH = require('./modules/auth.js');
const FRIENDS = require('./modules/friends.js');

const GAME = require('./modules/GAME/game.js');



let DEV_PLAYERS_ONLINE = 0;
const DEV_PLAYERS = ['test1','test2','test3','test4'];



global.SOCKET_LIST = {};
global.PLAYERS_ONLINE = {};
global.ROOMS_WAITING = {};
global.GAMES = {};

const ROOMS = require('./modules/rooms.js');



DB.connectToDB().then(function() {
  console.log('База данных подключена');
});



http.listen(PORT, '0.0.0.0', () => {
  console.log('Сервер запущен');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/DEVindex.html');
});
app.use('/', express.static(__dirname + '/client'));









const io = require('socket.io')(http);

io.on('connection', function(socket) {
  global.SOCKET_LIST[socket.id] = socket;
  console.log('Кто-то зашел на сервер');


  socket.on('AUTH_Registration', function(userRegPack) {
    AUTH.register(userRegPack, socket);
  });
  socket.on('AUTH_LogIn', function(userLogPack) {
    AUTH.logIn(userLogPack, socket);
  });






  socket.on('ACC_CheckOnlineFriends', function(login) {
    FRIENDS.CheckOnlineFriends(socket,login);
  });
  socket.on('ACC_FriendsRequestsNumberUpdate', function(login) {
    FRIENDS.FriendsRequestsNumberUpdate(socket,login);
  });
  socket.on('ACC_FindFriend', function(findFriendRequest) {
    FRIENDS.FindFriend(socket,findFriendRequest);
  });
  socket.on('ACC_SendFriendRequest', function(sendFriendRequest_pack) {
    FRIENDS.SendFriendRequest(socket,sendFriendRequest_pack);
  });

  socket.on('ACC_CancelFriendRequest', function(pack) {
    FRIENDS.CancelFriendRequest(socket,pack);
  });

  socket.on('ACC_BuildRequestsList', function(login) {
    FRIENDS.BuildRequestsList(socket,login);
  });

  socket.on(`ACC_AddToFriend`, function(pack) {
    FRIENDS.AddToFriend(socket,pack);
  });

  socket.on(`ACC_deleteFriend`, function(pack) {
    FRIENDS.DeleteFriend(socket,pack);
  });


  socket.on('ACC_NROOM_Create',function(newRoomPack){
    ROOMS.Create(socket,newRoomPack);
  });

  socket.on('ACC_ROOM_Enter',function(roomID){
    ROOMS.Enter(socket,roomID)
  });

  socket.on('ACC_ROOM_Join',function(JoinRoomPack){
    ROOMS.Join(socket,JoinRoomPack);
  });

  socket.on('ACC_ROOM_Leave',function(LeaveRoomPack){
    ROOMS.Leave(socket,LeaveRoomPack);
  });


  socket.on('ACC_GAMES_BuildList',function() {
    ROOMS.BuildList(socket);
  });



  socket.on('GAME_buildGame',function(roomID){
    GAME.Build(socket,roomID);
  });
  socket.on('GAME_buildGame_EnteringGame',function(EnterGamePack){
    GAME.EnteringGame(EnterGamePack);
  });


  socket.on('GAME_generating_turns',function(pack){
      GAME.GenerationTurns(pack);
  });
  socket.on('GAME_generating_colors',function(pack){
    GAME.GenerationColors(pack);
  });
  socket.on('GAME_generating_mapLineGenerated',function(pack){
      GAME.GenerationMapLine(pack);
  });
  socket.on('GAME_generating_finished',function(pack){
      GAME.FinishGeneration(pack);
  });


  socket.on('GAME_rebuild',function(pack){
    GAME.ReturnToGame(pack);
  });
  socket.on('GAME_rebuild_sendInfo',function(pack){
    GAME.ReturnPlayerToGame(pack);
  });
  socket.on('GAME_rebuild_finished',function(pack){
    GAME.FinishRebuild(pack);
  });


  socket.on('GAME_turns_end',function(gameID){
    GAME.sendTurn(gameID);
  });


  socket.on('GAME_gamePlay_roadBuild',function(sendPack){
    GAME.gamePlaySends.buildingRoad(sendPack);
  });

  socket.on('GAME_gamePlay_factoryBuild',function(sendPack){
    GAME.gamePlaySends.buildingFactory(sendPack);
  });


  socket.on('GAME_gamePlay_makeProductionTurn',function(sendPack){
    
    GAME.gamePlaySends.applyProductionTurn(sendPack);
  });










  socket.on('DEV_newUser',function(){
    DEV_PLAYERS_ONLINE++;
    for(let user of DEV_PLAYERS){
      if(!PLAYERS_ONLINE[user]){
        AUTH.finishAutentification(socket,DEV_PLAYERS[DEV_PLAYERS.indexOf(user)]);
        break;
      };
    };

    if(Object.keys(PLAYERS_ONLINE).length === 4 && !GAMES.DEV_GAME){
      PLAYERS_ONLINE.test1.emit("DEV__StartGameFromRoom");
    };

    if(GAMES.DEV_GAME){
      socket.emit("DEV__ReturnToGameFromRoom");
    };

  });




  socket.on('disconnect', function() {
    //Проверяем залогинился ли уже
    if (SOCKET_LIST[socket.id].login) {
      let inGame = null;
      //Если да, то удаляем из онлайна у его друзей
      const disconLogin = SOCKET_LIST[socket.id].login

      //проходимся по всем его друзьям в онлайне
      PLAYERS_ONLINE[disconLogin].friends.all.online.forEach((friend) => {

        if (PLAYERS_ONLINE[friend]) { //если и у нас такой в онлайне есть, то:
          //удаляем у него
          const disconIndex = PLAYERS_ONLINE[friend].friends.all.online.indexOf(disconLogin);
          if (disconIndex > -1) {

            PLAYERS_ONLINE[friend].friends.all.online.splice(disconIndex, 1);
            //то что далее высылается новым способом
            //и высылаем ему сообщение
            //на всякий проверяем
            // if (SOCKET_LIST[PLAYERS_ONLINE[friend].socket]) {
            //   SOCKET_LIST[PLAYERS_ONLINE[friend].socket].emit('ACC_UpdateOnlineList_Disconnect', disconLogin);
            // };
          };
        };
      });
      //высылаем уведомление друзьям
      PLAYERS_ONLINE[disconLogin].emitFriends('ACC_UpdateOnlineList_Disconnect', disconLogin);



      //если был в комнате, то выкидываем
      if(PLAYERS_ONLINE[disconLogin].joined != null){
        if(ROOMS_WAITING[PLAYERS_ONLINE[disconLogin].joined]){
          delete ROOMS_WAITING[PLAYERS_ONLINE[disconLogin].joined].players[disconLogin]
          ROOMS_WAITING[PLAYERS_ONLINE[disconLogin].joined].emit('ACC_ROOM_automaticlyUpdate',PLAYERS_ONLINE[disconLogin].joined)
        };
      };

      //если был в игре, то выкидываем
      if(PLAYERS_ONLINE[disconLogin].inGame != null){
        inGame = PLAYERS_ONLINE[disconLogin].inGame;
        delete GAMES[PLAYERS_ONLINE[disconLogin].inGame].playersInGame[disconLogin]
      };


      //удаляем из онлайна
      delete PLAYERS_ONLINE[disconLogin];
      if(!!inGame){
        GAMES[inGame].emit('GAME_inGame_Disconected',disconLogin);
        GAMES[inGame].emitOwner('GAME_seatings_Regenerate');


        //если был его ход, то пересылаем другому ход
        if(GAMES[inGame].turns.line[GAMES[inGame].turns.index] === disconLogin){
          GAME.sendTurn(inGame);
        };
      };
    };
    //удаляем сокет
    delete SOCKET_LIST[socket.id];
    console.log('Socket disconnected');
  });
});




//постепенно очищать ROOMS_WAITING
function clearRoomWaiting(){
  const minutes = 5;
  for(let room in ROOMS_WAITING){
    if(Date.now() - ROOMS_WAITING[room].inWait > minutes*60*1000){
      ROOMS_WAITING[room].inWait = 0;
      DB.ROOMS_UpdateRoomFULL(room,ROOMS_WAITING[room]).then(result=>{
        delete ROOMS_WAITING[room];
      });
    };
  };
};
setInterval(clearRoomWaiting,60000);
