const express = require('express');
const app = express();
const http = require('http').createServer(app);
const PORT = process.env.PORT || 3000;
const DB = require('./modules/db.js');
const AUTH = require('./modules/auth.js');
const FRIENDS = require('./modules/friends.js');
const ROOMS = require('./modules/rooms.js');
global.SOCKET_LIST = {};
global.PLAYERS_ONLINE = {};
global.ROOMS_WAITING = {};


DB.connectToDB().then(function() {

});



http.listen(PORT, '0.0.0.0', () => {

});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/', express.static(__dirname + '/client'));









const io = require('socket.io')(http);

io.on('connection', function(socket) {
  global.SOCKET_LIST[socket.id] = socket;



  socket.on('AUTH_Registration', function(userRegPack) {
    AUTH.register(userRegPack, socket);
  });
  socket.on('AUTH_LogIn', function(userLogPack) {
    AUTH.logIn(userLogPack, socket);
  });






  socket.on('ACC_CheckOnlineFriends', function(login) {
    FRIENDS.CheckOnlineFriends(socket, login);
  });
  socket.on('ACC_FriendsRequestsNumberUpdate', function(login) {
    FRIENDS.FriendsRequestsNumberUpdate(socket, login);
  });
  socket.on('ACC_FindFriend', function(findFriendRequest) {
    FRIENDS.FindFriend(socket, findFriendRequest);
  });
  socket.on('ACC_SendFriendRequest', function(sendFriendRequest_pack) {
    FRIENDS.SendFriendRequest(socket, sendFriendRequest_pack);
  });

  socket.on('ACC_CancelFriendRequest', function(pack) {
    FRIENDS.CancelFriendRequest(socket, pack);
  });

  socket.on('ACC_BuildRequestsList', function(login) {
    FRIENDS.BuildRequestsList(socket, login);
  });

  socket.on(`ACC_AddToFriend`, function(pack) {
    FRIENDS.AddToFriend(socket, pack);
  });

  socket.on(`ACC_deleteFriend`, function(pack) {
    FRIENDS.DeleteFriend(socket, pack);
  });


  socket.on('ACC_NROOM_Create', function(newRoomPack) {
    ROOMS.Create(socket, newRoomPack);
  });

  socket.on('ACC_ROOM_Enter', function(roomID) {
    ROOMS.Enter(socket, roomID)
  });

  socket.on('ACC_ROOM_Join', function(JoinRoomPack) {
    ROOMS.Join(socket, JoinRoomPack);
  });

  socket.on('ACC_ROOM_Leave', function(LeaveRoomPack) {
    ROOMS.Leave(socket, LeaveRoomPack);
  });


  socket.on('ACC_GAMES_BuildList', function() {
    ROOMS.BuildList(socket);
  });





  socket.on('disconnect', function() {
    //Проверяем залогинился ли уже
    if (SOCKET_LIST[socket.id].login) {
      //Если да, то удаляем из онлайна у его друзей
      const disconLogin = SOCKET_LIST[socket.id].login


      PLAYERS_ONLINE[disconLogin].friends.all.online.forEach((friend) => {

        if (PLAYERS_ONLINE[friend]) {
          const disconIndex = PLAYERS_ONLINE[friend].friends.all.online.indexOf(disconLogin);
          if (disconIndex > -1) {
            PLAYERS_ONLINE[friend].friends.all.online.splice(disconIndex, 1);
          };
        };
      });

      PLAYERS_ONLINE[disconLogin].emitFriends('ACC_UpdateOnlineList_Disconnect', disconLogin);




      if (PLAYERS_ONLINE[disconLogin].joined != null) {
        delete ROOMS_WAITING[PLAYERS_ONLINE[disconLogin].joined].players[disconLogin]
        ROOMS_WAITING[PLAYERS_ONLINE[disconLogin].joined].emit('ACC_ROOM_automaticlyUpdate', PLAYERS_ONLINE[disconLogin].joined)
      };



      delete PLAYERS_ONLINE[disconLogin];
    };

    delete SOCKET_LIST[socket.id];

  });
});





function clearRoomWaiting() {
  const minutes = 5;
  for (let room in ROOMS_WAITING) {
    if (Date.now() - ROOMS_WAITING[room].inWait > minutes * 60 * 1000) {
      ROOMS_WAITING[room].inWait = 0;
      DB.ROOMS_UpdateRoomFULL(room, ROOMS_WAITING[room]).then(result => {
        delete ROOMS_WAITING[room];
      });
    };
  };
};
setInterval(clearRoomWaiting, 60000);
