module.exports.New = function(login){
  let player = {
    login:login,
    friends:{
      all:{
        all:[],
        online:[],
        offline:[],
      },
      sends:[],
      requests:[],
    },
    sessions:[],
  };
  return player;
};
