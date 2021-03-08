const express = require('express');
const app = express();
const http = require('http').createServer(app);
const PORT = process.env.PORT || 3000;
const DB = require('./modules/db.js');
const AUTH = require('./modules/auth.js');
global.SOCKET_LIST = {};
global.PLAYERS_ONLINE = {};


DB.connectToDB().then(function() {
});



http.listen(PORT, () => {
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
    let friendsObj = {
      all: [],
      online: [],
      offline: [],
    };
    DB.PLAYER_find(login).then(player => {
      player.friends.all.all.forEach((friend, i) => {
        if (!PLAYERS_ONLINE[friend]) {
          friendsObj.offline.push(friend)
        } else {
          if (PLAYERS_ONLINE[friend]) {
            if (PLAYERS_ONLINE[friend].friends.all.online.indexOf(SOCKET_LIST[socket.id].login) === -1) {
              PLAYERS_ONLINE[friend].friends.all.online.push(SOCKET_LIST[socket.id].login);
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
    DB.PLAYER_find(findFriendRequest.from).then(userPlayer => {
      PLAYERS_ONLINE[findFriendRequest.from] = userPlayer;
      PLAYERS_ONLINE[findFriendRequest.from].socket = socket.id;
      if (findFriendRequest.search === findFriendRequest.from) {
        socket.emit('ACC_FindFriend_False');
        return;
      };
      if (PLAYERS_ONLINE[findFriendRequest.from].friends.all.all.indexOf(findFriendRequest.search) > -1) {
        socket.emit('ACC_FindFriend_False');
        return;
      };
      DB.PLAYER_find(findFriendRequest.search).then(result => {
        if (result === null) {
          socket.emit('ACC_FindFriend_False')
        } else {
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
    DB.PLAYER_find(user).then(fromPlayer => {
      if (fromPlayer.friends.requests.indexOf(friend) > -1) {
        const pack = {
          user: user,
          friend: friend,
        };
        addToFriend(pack, socket);
        socket.emit('ACC_friendAddedFromFind', friend);
      } else {
        if (fromPlayer.friends.sends.indexOf(friend) > -1) {
          return;
        } else {
          DB.PLAYER_find(friend).then(toPlayer => {
            if (toPlayer.friends.requests.indexOf(user) > -1) {
              return;
            } else {
              toPlayer.friends.requests.push(user);
              DB.PLAYER_updateFriendsRequests(friend, toPlayer.friends.requests).then(result => {
                if (result) {
                  fromPlayer.friends.sends.push(friend)
                  DB.PLAYER_updateFriendsSends(user, fromPlayer.friends.sends).then(result => {
                    socket.emit('ACC_sendFriendRequest_True', friend);
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
    DB.PLAYER_find(friend).then(friendPlayer => {
      if (friendPlayer.friends.requests.indexOf(user) > -1) {
        friendPlayer.friends.requests.splice(friendPlayer.friends.requests.indexOf(user), 1);
        DB.PLAYER_updateFriendsRequests(friend, friendPlayer.friends.requests).then(result => {
          DB.PLAYER_find(user).then(userPlayer => {
            if (userPlayer.friends.sends.indexOf(friend) > -1) {
              userPlayer.friends.requests.splice(userPlayer.friends.requests.indexOf(friend), 1);
              DB.PLAYER_updateFriendsSends(user, userPlayer.friends.requests).then(result => {
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
      };
      socket.emit('ACC_BuildRequestsList_True', pack);
    });
  });
  function addToFriend(pack, socket) {
    const user = pack.user;
    const friend = pack.friend;
    DB.PLAYER_find(user).then(userPlayer => {
      if (userPlayer.friends.requests.indexOf(friend) > -1) {
        userPlayer.friends.requests.splice(userPlayer.friends.requests.indexOf(friend), 1);
        DB.PLAYER_updateFriendsRequests(user, userPlayer.friends.requests).then(result => {
          DB.PLAYER_find(friend).then(friendPlayer => {
            if (friendPlayer.friends.sends.indexOf(user) > -1) {
              friendPlayer.friends.sends.splice(friendPlayer.friends.sends.indexOf(user), 1);
              DB.PLAYER_updateFriendsSends(friend, friendPlayer.friends.sends).then(result => {
                userPlayer.friends.all.all.push(friend);
                friendPlayer.friends.all.all.push(user);
                DB.PLAYER_updateFriends(user, userPlayer.friends.all.all).then(result => {
                  const pack = {
                    friendsArr: userPlayer.friends.all.all,
                    friend: friend,
                  };
                  socket.emit('ACC_AddToFriend_True', pack);
                  PLAYERS_ONLINE[user].friends.all.all = userPlayer.friends.all.all;
                  DB.PLAYER_updateFriends(friend, friendPlayer.friends.all.all).then(result => {
                    if (PLAYERS_ONLINE[friend]) {
                      SOCKET_LIST[PLAYERS_ONLINE[friend].socket].emit('ACC_AddToFriend_True', pack);
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

    DB.PLAYER_find(user).then(userPlayer => {
      if (userPlayer.friends.all.all.indexOf(friend) > -1) {
        userPlayer.friends.all.all.splice(userPlayer.friends.all.all.indexOf(friend), 1);
        if (PLAYERS_ONLINE[user]) {
          PLAYERS_ONLINE[user].friends.all.all = userPlayer.friends.all.all;
        };
        DB.PLAYER_updateFriends(user, userPlayer.friends.all.all).then(result => {
          DB.PLAYER_find(friend).then(friendPlayer => {
            if (friendPlayer.friends.all.all.indexOf(user) > -1) {
              friendPlayer.friends.all.all.splice(friendPlayer.friends.all.all.indexOf(user), 1);
              if (PLAYERS_ONLINE[friend]) {
                PLAYERS_ONLINE[friend].friends.all.all = friendPlayer.friends.all.all;
              };
              DB.PLAYER_updateFriends(friend, friendPlayer.friends.all.all).then(result => {
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
    if (SOCKET_LIST[socket.id].login) {
      const disconLogin = SOCKET_LIST[socket.id].login
      PLAYERS_ONLINE[disconLogin].friends.all.online.forEach((friend) => {
        if (PLAYERS_ONLINE[friend]) {
          const disconIndex = PLAYERS_ONLINE[friend].friends.all.online.indexOf(disconLogin);
          if (disconIndex > -1) {
            PLAYERS_ONLINE[friend].friends.all.online.splice(disconIndex, 1);
            if (SOCKET_LIST[PLAYERS_ONLINE[friend].socket]) {
              SOCKET_LIST[PLAYERS_ONLINE[friend].socket].emit('ACC_UpdateOnlineList_Disconnect', disconLogin);
            };
          };
        };
      });
      delete PLAYERS_ONLINE[disconLogin];
    };
    delete SOCKET_LIST[socket.id];
  });
});
