const express = require('express');
const app = express();
const http = require('http').createServer(app);
const PORT = process.env.PORT || 3000;
const DB = require('./modules/db.js');
const AUTH = require('./modules/auth.js');
const FRIENDS = require('./modules/friends.js');
global.SOCKET_LIST = {};
global.PLAYERS_ONLINE = {};


DB.connectToDB().then(function() {
  console.log('База данных подключена');
});



http.listen(PORT, '0.0.0.0', () => {
  console.log('Сервер запущен');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
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


  socket.on('disconnect', function() {
    //Проверяем залогинился ли уже
    if (SOCKET_LIST[socket.id].login) {
      //Если да, то удаляем из онлайна у его друзей
      const disconLogin = SOCKET_LIST[socket.id].login


      //проходимся по всем его друзьям в онлайне
      PLAYERS_ONLINE[disconLogin].friends.all.online.forEach((friend) => {

        if (PLAYERS_ONLINE[friend]) { //если и у нас такой в онлайне есть, то:
          //удаляем у него
          const disconIndex = PLAYERS_ONLINE[friend].friends.all.online.indexOf(disconLogin);
          if (disconIndex > -1) {

            PLAYERS_ONLINE[friend].friends.all.online.splice(disconIndex, 1);
            //и высылаем ему апдейт
            //на всякий проверяем
            if (SOCKET_LIST[PLAYERS_ONLINE[friend].socket]) {
              SOCKET_LIST[PLAYERS_ONLINE[friend].socket].emit('ACC_UpdateOnlineList_Disconnect', disconLogin);
            };
          };
        };
      });

      //удаляем из онлайна
      delete PLAYERS_ONLINE[disconLogin];
    };
    //удаляем сокет
    delete SOCKET_LIST[socket.id];
    console.log('Socket disconnected');
  });
});
