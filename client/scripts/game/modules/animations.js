
import * as MAP_SETTINGS from "/scripts/gameSettings/map.js";
import * as SIT_PLACES from "/scripts/gameSettings/sittingPlace.js";


const animationSpeed =   MAP_SETTINGS.RADIUS;
const animationTime = 25;

function moveFromTo(from, to){
  // console.log(fromPoint,toPoint);
  let coord;
  if(from > to){
    if(from - animationSpeed > to){
      coord = from - animationSpeed;
    }else{
      coord = to
    }
  }else if(from < to){
    if(from +  animationSpeed < to ){
       coord = from + animationSpeed;
    }else{
      coord = to
    };
  }else{
    coord = to;
  }
  return coord;
};


function animateCamera(camera){
  const self = camera;
  function animateTo(x,y,z){

    self.position.x = moveFromTo(self.position.x, x);
    self.position.y = moveFromTo(self.position.y, y);
    self.position.z = moveFromTo(self.position.z, z);


    if(self.position.x != x || self.position.y != y || self.position.z != z ){
      setTimeout(function(){
        animateTo(x,y,z);
      },animationTime);
    }else{
      return;
    }
    self.lookAt(0,0,0);
  };
  return {
    animateTo:animateTo,
  }


};

function animation(thisMesh){
  const self = thisMesh;
  function animateTo(x,y,z){

    self.position.x = moveFromTo(self.position.x, x);
    self.position.y = moveFromTo(self.position.y, y);
    self.position.z = moveFromTo(self.position.z, z);


    if(self.position.x != x || self.position.y != y || self.position.z != z ){
      setTimeout(function(){
        animateTo(x,y,z);
      },animationTime);
    }else{
      return;
    }
  };











  function getRandomPositionXZ(){
    self.position.x = Math.random()*SIT_PLACES.USER_SIT_DISTANCE;
    self.position.z = Math.random()*SIT_PLACES.USER_SIT_DISTANCE;

    Math.random() >= 0.5 ? self.position.x *= -1 : false;
    Math.random() >= 0.5 ? self.position.z *= -1 : false;
  };
  function getRandomPositionXYZ_Ypositive(){
    self.position.x = Math.random()*SIT_PLACES.USER_SIT_DISTANCE;
    self.position.y = Math.random()*SIT_PLACES.USER_SIT_DISTANCE;
    self.position.z = Math.random()*SIT_PLACES.USER_SIT_DISTANCE;

    Math.random() >= 0.5 ? self.position.x *= -1 : false;
    Math.random() >= 0.5 ? self.position.y *= -1 : false;
    Math.random() >= 0.5 ? self.position.z *= -1 : false;

  };
  function getRandomPositionXYZ(){
    self.position.x = Math.random()*SIT_PLACES.USER_SIT_DISTANCE;
    self.position.y = Math.random()*SIT_PLACES.USER_SIT_DISTANCE;
    self.position.z = Math.random()*SIT_PLACES.USER_SIT_DISTANCE;

    Math.random() >= 0.5 ? self.position.x *= -1 : false;
    Math.random() >= 0.5 ? self.position.y *= -1 : false;
    Math.random() >= 0.5 ? self.position.z *= -1 : false;

  };
  return {
    animateTo:animateTo,
    getRandomPositionXZ:getRandomPositionXZ,
    getRandomPositionXYZ:getRandomPositionXYZ,
    getRandomPositionXYZ_Ypositive:getRandomPositionXYZ_Ypositive,
  }



}


export {
  animation,
  animateCamera,
}
