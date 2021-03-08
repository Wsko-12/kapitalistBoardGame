const express = require('express');
const app = express();
const http = require('http').createServer(app);
const PORT = process.env.PORT || 3000;
const DB = require('./modules/db.js');
const AUTH = require('./modules/auth.js');
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
    let friendsObj = {
      all: [],
      online: [],
      offline: [],
    };
    DB.PLAYER_find(login).then(player => {
      player.friends.all.all.forEach((friend, i) => {
        if (!PLAYERS_ONLINE[friend]) {
          //если у нас такого в онлайне нет
          friendsObj.offline.push(friend)
        } else {
          //если у друга такого нет в онлайне, то добавляем
          //на всякий проверяем его
          if (PLAYERS_ONLINE[friend]) {
            if (PLAYERS_ONLINE[friend].friends.all.online.indexOf(SOCKET_LIST[socket.id].login) === -1) {
              PLAYERS_ONLINE[friend].friends.all.online.push(SOCKET_LIST[socket.id].login);

              //и высылаем уведомление ему
              //на всякий проверяем
              if (SOCKET_LIST[PLAYERS_ONLINE[friend].socket]) {
                SOCKET_LIST[PLAYERS_ONLINE[friend].socket].emit('ACC_UpdateOnlineList_Connected', SOCKET_LIST[socket.id].login);
              };
            };
          };
          friendsObj.online.push(friend);
        };
      });
      PLAYERS_ONLINE[SOCKET_LIST[socket.id].login].friends.all = friendsObj;
      socket.emit('ACC_CheckOnlineFriends_True', friendsObj);
    });

  });



  socket.on('ACC_FriendsRequestsNumberUpdate', function(login) {
    DB.PLAYER_find(login).then(result => {
      socket.emit('ACC_FriendsRequestsNumberUpdate_True', result.friends.requests);
    });
  });


  socket.on('ACC_FindFriend', function(findFriendRequest) {
    //ищем пользователя
    DB.PLAYER_find(findFriendRequest.from).then(userPlayer => {
      //переписываем его
      PLAYERS_ONLINE[findFriendRequest.from] = userPlayer;
      PLAYERS_ONLINE[findFriendRequest.from].socket = socket.id;
      //если ищет сам себя, то отправляем no results
      if (findFriendRequest.search === findFriendRequest.from) {
        socket.emit('ACC_FindFriend_False');
        return;
      };
      //если ищет своего друга, отправляем no result
      if (PLAYERS_ONLINE[findFriendRequest.from].friends.all.all.indexOf(findFriendRequest.search) > -1) {
        socket.emit('ACC_FindFriend_False');
        return;
      };

      //ищем в бд запрос
      DB.PLAYER_find(findFriendRequest.search).then(result => {

        if (result === null) {
          //такого игрока нет
          socket.emit('ACC_FindFriend_False')
        } else {
          //если такой игрок есть
          findFriend_result = {
            login: result.login,
            online: false,
            sendsArr:result.friends.sends,
          };
          if (PLAYERS_ONLINE[result.login]) {
            findFriend_result.online = true;
          };
          socket.emit('ACC_FindFriend_True', findFriend_result);
        };
      });
    });

  });


  socket.on('ACC_SendFriendRequest', function(sendFriendRequest_pack) {
    const user = sendFriendRequest_pack.from;
    const friend = sendFriendRequest_pack.to;
    //сначала проверяем нет ли у него уже запроса от этого друга
    // console.log(`${user} want to add ${friend}`);
    DB.PLAYER_find(user).then(fromPlayer => {
      if (fromPlayer.friends.requests.indexOf(friend) > -1) {
        //значит запрос уже был, сразу добалвяем в друзья
        const pack = {
          user: user,
          friend: friend,
        };
        addToFriend(pack, socket);
        socket.emit('ACC_friendAddedFromFind', friend);
      } else {
        //запроса не было, работаем дальше
        //смотрим, не отсылал ли уже запрос
        if (fromPlayer.friends.sends.indexOf(friend) > -1) {
          // console.log(`${user} уже отсылал запрос ${friend}`);
          //значит уже отсылал запрос...
          return;
        } else {
          //ищем того, кому отсылается запрос
          DB.PLAYER_find(friend).then(toPlayer => {
            //еще раз проверим, есть ли у того в запросов от Пользователя Отправителя
            if (toPlayer.friends.requests.indexOf(user) > -1) {
              //если запрос уже был сделан ранее...
              // console.log(` у ${friend} уже есть запрос от ${user}`);
              return;
            } else {
              //высылка запроса
              //запихиваем ему в запросы

              toPlayer.friends.requests.push(user);
              //и сохраняем в бд
              DB.PLAYER_updateFriendsRequests(friend, toPlayer.friends.requests).then(result => {
                if (result) {
                  //сохранен
                  //теперь отправляем Отправителю в sends его запрос
                  fromPlayer.friends.sends.push(friend)
                  //сохраняем в бд
                  DB.PLAYER_updateFriendsSends(user, fromPlayer.friends.sends).then(result => {
                    //высылка запроса готова
                    socket.emit('ACC_sendFriendRequest_True', friend);
                    //отправляем уведомление
                    if (PLAYERS_ONLINE[friend]) {
                      SOCKET_LIST[PLAYERS_ONLINE[friend].socket].emit('ACC_FriendsRequestNotification', user)
                    };
                  });
                };
              });
            };
          });
        };
      };
    });
  });

  socket.on('ACC_CancelFriendRequest', function(pack) {
    const user = pack.user;
    const friend = pack.friend;
    //ищем друга
    DB.PLAYER_find(friend).then(friendPlayer => {
      //проверяем у него реквесты
      if (friendPlayer.friends.requests.indexOf(user) > -1) {
        //если есть, то удаляем
        friendPlayer.friends.requests.splice(friendPlayer.friends.requests.indexOf(user), 1);
        //и сохраняем в бд
        DB.PLAYER_updateFriendsRequests(friend, friendPlayer.friends.requests).then(result => {
          //ищем юзера
          DB.PLAYER_find(user).then(userPlayer => {
            //проверяем у него sends
            if (userPlayer.friends.sends.indexOf(friend) > -1) {
              //если есть, то удаляем
              userPlayer.friends.requests.splice(userPlayer.friends.requests.indexOf(friend), 1);
              //и сохраняем в бд
              DB.PLAYER_updateFriendsSends(user, userPlayer.friends.requests).then(result => {
                //все готово
                socket.emit('ACC_CancelFriendRequest_True', friend);
              });
            };
          });
        });
      };
    });
  });

  socket.on('ACC_BuildRequestsList', function(login) {
    const buildetObj = {
      online: [],
      offline: []
    };
    DB.PLAYER_find(login).then(player => {
      player.friends.requests.forEach((friend) => {
        if (PLAYERS_ONLINE[friend]) {
          buildetObj.online.push(friend);
        } else {
          buildetObj.offline.push(friend);
        };
      });
      const pack = {
        requestsArr: player.friends.requests,
        requestsBuildetObj: buildetObj,
      }
      socket.emit('ACC_BuildRequestsList_True', pack);
    });


  });

  function addToFriend(pack, socket) {
    const user = pack.user;
    const friend = pack.friend;
    //ищем пользователя
    DB.PLAYER_find(user).then(userPlayer => {
      //на всякий проверяем есть ли
      if (userPlayer.friends.requests.indexOf(friend) > -1) {
        //удаляем у него из реквеста
        userPlayer.friends.requests.splice(userPlayer.friends.requests.indexOf(friend), 1);
        //и сохраняемм в бд
        DB.PLAYER_updateFriendsRequests(user, userPlayer.friends.requests).then(result => {
          //все ок, далее ищем друга
          DB.PLAYER_find(friend).then(friendPlayer => {
            //на всякий проверяем есть ли у него сенды
            if (friendPlayer.friends.sends.indexOf(user) > -1) {
              //удаляем у него из sends
              friendPlayer.friends.sends.splice(friendPlayer.friends.sends.indexOf(user), 1);
              //и сохраняемм в бд
              DB.PLAYER_updateFriendsSends(friend, friendPlayer.friends.sends).then(result => {
                //все прошло, теперь обоим вкидываем друзей
                userPlayer.friends.all.all.push(friend);
                friendPlayer.friends.all.all.push(user);
                //и сохраняем в бд
                DB.PLAYER_updateFriends(user, userPlayer.friends.all.all).then(result => {
                  //Высылаем новый массив друзей пользователю
                  const pack = {
                    friendsArr: userPlayer.friends.all.all,
                    friend: friend,
                  };
                  socket.emit('ACC_AddToFriend_True', pack);
                  //и записываем ему
                  PLAYERS_ONLINE[user].friends.all.all = userPlayer.friends.all.all;
                  DB.PLAYER_updateFriends(friend, friendPlayer.friends.all.all).then(result => {
                    //Проверяем онлайн ли друг
                    if (PLAYERS_ONLINE[friend]) {
                      //сразу обновляем у него
                      SOCKET_LIST[PLAYERS_ONLINE[friend].socket].emit('ACC_AddToFriend_True', pack);
                      //и высылаем уведомление
                      SOCKET_LIST[PLAYERS_ONLINE[friend].socket].emit('ACC_FriendsAddNotification', user);
                    };
                  });
                });
              });
            };
          });
        });
      };
    });
  };


  socket.on(`ACC_AddToFriend`, function(pack) {
    addToFriend(pack, socket);
  });

  socket.on(`ACC_deleteFriend`, function(pack) {
    const user = pack.user;
    const friend = pack.friend;

    //ищем юзера
    DB.PLAYER_find(user).then(userPlayer => {
      //проверяем список его друзей
      if (userPlayer.friends.all.all.indexOf(friend) > -1) {
        userPlayer.friends.all.all.splice(userPlayer.friends.all.all.indexOf(friend), 1);
        //закидываем в его онлайн
        if (PLAYERS_ONLINE[user]) {
          PLAYERS_ONLINE[user].friends.all.all = userPlayer.friends.all.all;
        };
        //сохраняем в бд
        DB.PLAYER_updateFriends(user, userPlayer.friends.all.all).then(result => {
          //ищем его друга
          DB.PLAYER_find(friend).then(friendPlayer => {
            //проверяем список его друзей
            if (friendPlayer.friends.all.all.indexOf(user) > -1) {
              friendPlayer.friends.all.all.splice(friendPlayer.friends.all.all.indexOf(user), 1);
              if (PLAYERS_ONLINE[friend]) {
                PLAYERS_ONLINE[friend].friends.all.all = friendPlayer.friends.all.all;
              };
              //сохраняем в бд
              DB.PLAYER_updateFriends(friend, friendPlayer.friends.all.all).then(result => {
                //все готово
                const pack = {
                  friendArr: userPlayer.friends.all.all,
                  friend: friend,
                };
                socket.emit(`ACC_deleteFriend_True`, pack)
              });
            };
          });
        });
      };
    });
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
