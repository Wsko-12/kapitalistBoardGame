const express = require('express');
const app = express();
const http = require('http').createServer(app);
const PORT = process.env.PORT || 3000;
const DB = require('./modules/db.js');
const AUTH = require('./modules/auth.js');
global.SOCKET_LIST = {};
global.PLAYERS_ONLINE = {};


DB.connectToDB().then(function(){
  console.log('База данных подключена');
});



http.listen(PORT,'0.0.0.0',() =>{
  console.log('Сервер запущен');
});

app.get('/',(req,res) =>{
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/',express.static(__dirname + '/client'));











const io = require('socket.io')(http);

io.on('connection', function(socket){
  global.SOCKET_LIST[socket.id] = socket;
  console.log('Кто-то зашел на сервер');
  console.log('online:',global.PLAYERS_ONLINE);

  socket.on('testSocket',function(){
    console.log(socket.id);
  });


  socket.on('AUTH_Registration',function(userRegPack){
    AUTH.register(userRegPack,socket);
  });
  socket.on('AUTH_LogIn',function(userLogPack){
    AUTH.logIn(userLogPack,socket);
  });




  socket.on('ACC_CheckOnlineFriends',function(friendsArr){
    let friendsObj = {
      all:friendsArr,
      online:[],
      offline:[],
    };
    friendsArr.forEach((friend, i) => {
      if(!PLAYERS_ONLINE[friend]){
        //если у нас такого в онлайне нет
        friendsObj.offline.push(friend)
      }else{
        //если у друга такого нет в онлайне, то добавляем
        //на всякий проверяем его
        if(PLAYERS_ONLINE[friend]){
          if(PLAYERS_ONLINE[friend].friends.all.online.indexOf(SOCKET_LIST[socket.id].login) === -1){
            PLAYERS_ONLINE[friend].friends.all.online.push(SOCKET_LIST[socket.id].login);

            //и высылаем уведомление ему
            //на всякий проверяем
            if(SOCKET_LIST[PLAYERS_ONLINE[friend].socket]){
              SOCKET_LIST[PLAYERS_ONLINE[friend].socket].emit('ACC_UpdateOnlineList_Connected', SOCKET_LIST[socket.id].login);
            };
          };
        };


        friendsObj.online.push(friend);
      };
    });


    PLAYERS_ONLINE[SOCKET_LIST[socket.id].login].friends.all = friendsObj;
    socket.emit('ACC_CheckOnlineFriends_True',friendsObj);
  });



  socket.on('ACC_FriendsRequestsNumberUpdate',function(login){
    DB.PLAYER_find(login).then(result =>{

      socket.emit('ACC_FriendsRequestsNumberUpdate_True',result);
    });
  });

  socket.on('disconnect',function(){
      //Проверяем залогинился ли уже
      if(SOCKET_LIST[socket.id].login){
        //Если да, то удаляем из онлайна у его друзей
        const disconLogin = SOCKET_LIST[socket.id].login


        //проходимся по всем его друзьям в онлайне
        PLAYERS_ONLINE[disconLogin].friends.all.online.forEach((friend) => {

          if(PLAYERS_ONLINE[friend]){//если и у нас такой в онлайне есть, то:
            //удаляем у него
            const disconIndex = PLAYERS_ONLINE[friend].friends.all.online.indexOf(disconLogin);
            if( disconIndex > -1){

              PLAYERS_ONLINE[friend].friends.all.online.splice(disconIndex, 1);
              //и высылаем ему апдейт
              //на всякий проверяем
              if(SOCKET_LIST[PLAYERS_ONLINE[friend].socket]){
                SOCKET_LIST[PLAYERS_ONLINE[friend].socket].emit('ACC_UpdateOnlineList_Disconnect',disconLogin);
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
