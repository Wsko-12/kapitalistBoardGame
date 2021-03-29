import { socket } from "/scripts/socketInit.js";
import { ACC_buildPage } from "/scripts/accPage.js";
document.addEventListener("DOMContentLoaded", function(blaa) {
  let PLAYER;
  const AUTH_ShowError = function(error){
    let div = document.getElementById('AUTH__error');
    div.innerHTML = error;
  };



  //
  // AUTH_LogInForm.onsubmit = function(e){
  //   e.preventDefault();
  //   const login = document.querySelector('#AUTH_LogInForm_Login').value;
  //   const password = document.querySelector('#AUTH_LogInForm_Password').value
  //   const pack = {
  //     login:login,
  //     password:password,
  //   };
  //   if(login.length<=3){
  //     AUTH_ShowError('Login is too short');
  //     return;
  //   };
  //   if(password.length<=3){
  //     AUTH_ShowError('Password is too short');
  //     return;
  //   };
  //   LOADING_Screen(true);
  //   socket.emit('AUTH_LogIn',pack);
  // };
  //




  // AUTH_RegistrationForm.onsubmit = function(e){
  //   e.preventDefault();
  //   const login = document.querySelector('#AUTH_RegistrationForm_Login').value;
  //   const password = document.querySelector('#AUTH_RegistrationForm_Password').value;
  //   const pack = {
  //     login:login,
  //     password:password,
  //   };
  //   if(login.length<=3){
  //     AUTH_ShowError('Login is too short');
  //     return;
  //   };
  //   if(password.length<=3){
  //     AUTH_ShowError('Password is too short');
  //     return;
  //   };
  //   LOADING_Screen(true);
  //   socket.emit('AUTH_Registration',pack);
  //
  // };
  //
  function finishAuth(player){
    ACC_buildPage(player);
    document.title = player.login;
  };



  socket.on('AUTH__OnlineError',function(){LOADING_Screen(false);AUTH_ShowError('Player is already online')});
  socket.on('AUTH__LoginRegistered',function(){AUTH_ShowError('Login already registered');LOADING_Screen(false);});
  socket.on('AUTH__LoginPasswordError',function(){AUTH_ShowError('Incorrect login or password');LOADING_Screen(false);});


  socket.on('AUTH__False',function(){LOADING_Screen(false);AUTH_ShowError('Something went wrong :c')});
  socket.on('AUTH__True',function(player){finishAuth(player)});
});
