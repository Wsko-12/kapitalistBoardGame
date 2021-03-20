const DB = require('./db.js');
const PLAYER = require('./player.js');

const bcrypt = require('bcryptjs');


function hashPass(password) {
  let salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};
// bcrypt.compareSync("B4c0/\/", hash);

function PlayerEmit(message,date){
  SOCKET_LIST[this.socket].emit(message,date);
};
function PlayerEmitFriends(message,date){
  this.friends.all.all.forEach((friend) => {
    if(!!PLAYERS_ONLINE[friend]){
      PLAYERS_ONLINE[friend].emit(message,date);
    };
  });
};

async function createAndSaveNewPlayer(login, socket) {
  const newPlayer = PLAYER.New(login);
  DB.PLAYER_new(newPlayer).then(newPlayerUND => {
    //проверяем еще раз бд, так как PLAYER_new возвращает undefined
    DB.PLAYER_find(newPlayer.login).then(newPlayerResult => {
      //Игрок создан
      if (socket) {
        finishAutentification(socket, newPlayerResult)
      };
    });
  });
};

function finishAutentification(socket, player) {
  SOCKET_LIST[socket.id].login = player.login;
  PLAYERS_ONLINE[player.login] = player;
  PLAYERS_ONLINE[player.login].socket = socket.id;
  PLAYERS_ONLINE[player.login].emit = PlayerEmit;
  PLAYERS_ONLINE[player.login].emitFriends = PlayerEmitFriends;
  PLAYERS_ONLINE[player.login].joined = null;
  socket.emit('AUTH__True', player);


  //высылаем уведомлениее друзьям, чтоо зашел в онлайн
  PLAYERS_ONLINE[player.login].emitFriends('ACC_UpdateOnlineList_Connected',player.login);
};


module.exports.register = async function(userRegPack, socket) {
  DB.AUTH_findLogin(userRegPack.login).then(result => {
    if (result === null) { //регистрируем
      userRegPack.password = hashPass(userRegPack.password);
      DB.AUTH_registerOne(userRegPack).then(res => {
        //проверяем еще раз регистрацию, так как AUTH_registerOne возвращает undefined
        DB.AUTH_findLogin(userRegPack.login).then(registred => {
          if (registred === null) {
            //что-то пошло не так и в бд не найден
            socket.emit('AUTH__False');
          } else {
            //все ок, пашем дальше
            //создаем нового игрока
            createAndSaveNewPlayer(registred.login, socket);
            return;
          };
        });
      });
    } else {
      //логин уже занят
      socket.emit('AUTH__LoginRegistered');
    };
  });
};

module.exports.logIn = async function(userLogPack, socket) {
  //проверяем не онлайн ли уже
  if(!global.PLAYERS_ONLINE[userLogPack.login]){
    DB.AUTH_findLogin(userLogPack.login).then(result => {
      if (result === null) {
        //пользователь не найден
        socket.emit('AUTH__LoginPasswordError');
      } else {
        //проверка пароля
        if (bcrypt.compareSync(userLogPack.password, result.password)) {
          //вход выполнен

          DB.PLAYER_find(result.login).then(playerRES => {
            //аутентификация завершена
            if (playerRES === null) {
              //игрок не найден, поэтому создаем
              createAndSaveNewPlayer(registred.login, socket);
              return;
            };
            finishAutentification(socket, playerRES);
          });
        } else {
          //неправильный пароль
          socket.emit('AUTH__LoginPasswordError');
        };
      };
    });
  }else{
    //уже онлайн
    socket.emit('AUTH__OnlineError');
  };
};
