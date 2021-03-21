import {RADIUS,ROUNDS} from "/scripts/gameSettings/map.js"

const USER_SIT_DISTANCE = RADIUS*(ROUNDS*3);
const USER_SIT_POSITIONS = {
  //users count
  1:{
    //user index
    0:{
      x:0,
      z:USER_SIT_DISTANCE,
    },
  },
  2:{
    0:{
      x:0,
      z:USER_SIT_DISTANCE,
    },
    1:{
      x:0,
      z:-USER_SIT_DISTANCE,
    },
  },
  3:{
    0:{
      x:0,
      z:USER_SIT_DISTANCE,
    },
    1:{
      x:-USER_SIT_DISTANCE*0.86602540378,
      z:-USER_SIT_DISTANCE/2,
    },
    2:{
      x:USER_SIT_DISTANCE*0.86602540378,
      z:-USER_SIT_DISTANCE/2,
    },
  },
  4:{
    0:{
      x:-Math.sqrt(Math.pow(USER_SIT_DISTANCE, 2)/2),
      z:Math.sqrt(Math.pow(USER_SIT_DISTANCE, 2)/2)
    },
    1:{
      x:-Math.sqrt(Math.pow(USER_SIT_DISTANCE, 2)/2),
      z:-Math.sqrt(Math.pow(USER_SIT_DISTANCE, 2)/2)
    },
    2:{
      x:Math.sqrt(Math.pow(USER_SIT_DISTANCE, 2)/2),
      z:-Math.sqrt(Math.pow(USER_SIT_DISTANCE, 2)/2)
    },
    3:{
      x:Math.sqrt(Math.pow(USER_SIT_DISTANCE, 2)/2),
      z:Math.sqrt(Math.pow(USER_SIT_DISTANCE, 2)/2)
    },
  },
};

export {
  USER_SIT_DISTANCE,USER_SIT_POSITIONS

}
