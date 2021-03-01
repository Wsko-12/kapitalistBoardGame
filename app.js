const express = require('express');
const app = express();
const http = require('http').createServer(app);
const PORT = process.env.PORT || 3000;


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://wsko:${process.env.MONGO}@cluster0.4k9xp.mongodb.net/kapitalistDB?retryWrites=true&w=majority'`;

let DBConnection;

async function connectToDB(){
  DBConnection = await MongoClient.connect(uri,{useUnifiedTopology:true,useNewUrlParser:true});
  return;
};


connectToDB().then(function(){
  console.log('База данных подключена');
});



http.listen(PORT,() =>{
  console.log('Сервер запущен');
});

app.get('/',(req,res) =>{
  res.sendFile(__dirname + '/client/index.html');
});



const io = require('socket.io')(http);

io.sockets.on('connection', function(socket){
  console.log('Кто-то зашел на сервер');


  socket.on('Регистрируюсь',function(Данные){
    DBConnection.db('kapitalistDB').collection('users').insertOne(Данные);
  });



  socket.on('disconnect',function(){
    console.log('Покинул сервер');
  });
});
