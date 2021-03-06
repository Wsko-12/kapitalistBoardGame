module.exports.New = function(login){
  let player = {
    login:login,
    friends:{
      all:[],
      sends:[],
      requests:[],
    },
    sessions:[],
  };
  return player;
};
