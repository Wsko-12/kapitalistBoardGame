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



  socket.on('disconnect',function(){
      //Проверяем залогинился ли уже
      if(global.SOCKET_LIST[socket.id].login){
        //Если да, то удаляем из онлайна
        delete global.PLAYERS_ONLINE[global.SOCKET_LIST[socket.id].login];
      };
      delete SOCKET_LIST[socket.id];
      console.log('Socket disconnected');
    });
});
