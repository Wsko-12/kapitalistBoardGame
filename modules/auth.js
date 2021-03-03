const DB = require('./db.js');

const bcrypt = require('bcryptjs');


function hashPass(password){
  let salt = bcrypt.genSaltSync(10);
  return  bcrypt.hashSync(password, salt);
}
// bcrypt.compareSync("B4c0/\/", hash);


module.exports.register = function (userRegPack,socket) {
  DB.AUTH_findLogin(userRegPack.login).then(result =>{
    if(result === null){//регистрируем
      userRegPack.password = hashPass(userRegPack.password);
      DB.AUTH_registerOne(userRegPack).then(result =>{
        if(result === null){
          //ошибка регистрации
        }else {
          //регистрация успешна

          //createNewPlayer


          socket.emit('AUTH__True');
        };
      });
    }else{
      //логин уже занят
      socket.emit('AUTH__LoginRegistered');

    };
  });
};

module.exports.logIn = function(userLogPack,socket){
  DB.AUTH_findLogin(userLogPack.login).then(result =>{
    if(result === null){
      //пользователь не найден
      socket.emit('AUTH__LoginPasswordError');
    }else{
      //проверка пароля
      if(bcrypt.compareSync(userLogPack.password, result.password)){
        //вход выполнен
        socket.emit('AUTH__True');
      }else{
        //неправильный пароль

        socket.emit('AUTH__LoginPasswordError');
      }
    };
  });

}
