const express = require('express');
const app = express();
const http = require('http').createServer(app);
const PORT = process.env.PORT || 3000;
const DB = require('./modules/db.js');
const AUTH = require('./modules/auth.js');






DB.connectToDB().then(function(){
  // console.log('База данных подключена');
});



http.listen(PORT,() =>{
  // console.log('Сервер запущен');
});

app.get('/',(req,res) =>{
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/',express.static(__dirname + '/client'));











const io = require('socket.io')(http);

io.sockets.on('connection', function(socket){
  // console.log('Кто-то зашел на сервер');


  socket.on('DEVICE_Check',function(){
    socket.emit('DEVICE_Check');
  });


  socket.on('AUTH_Registration',function(userRegPack){
    AUTH.register(userRegPack,socket);
  });
  socket.on('AUTH_LogIn',function(userLogPack){
    AUTH.logIn(userLogPack,socket);
  });



  socket.on('disconnect',function(){
    // console.log('Покинул сервер');
  });
});
