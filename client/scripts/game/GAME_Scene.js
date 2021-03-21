import {
  socket
} from "/scripts/socketInit.js";

import {
  PLAYER,
  ACC_buildPage,
  clearButtons
} from "/scripts/accPage.js";
import {GAME}from "/scripts/game/GAME.js"


import * as THREE from '../ThreeJsLib/build/three.module.js';
import * as RENDER_SETTINGS from '../gameSettings/RENDER.js';
import * as MODELS from '/scripts/models/models.js';
import * as MAP_SETTINGS from "/scripts/gameSettings/map.js";
import * as SIT_PLACES from "/scripts/gameSettings/sittingPlace.js";



import {
  EffectComposer
} from '../ThreeJsLib/examples/jsm/postprocessing/EffectComposer.js';
import {
  RenderPass
} from '../ThreeJsLib/examples/jsm/postprocessing/RenderPass.js';
import {
  ShaderPass
} from '../ThreeJsLib/examples/jsm/postprocessing/ShaderPass.js';
import {
  UnrealBloomPass
} from '../ThreeJsLib/examples/jsm/postprocessing/UnrealBloomPass.js';

import {
  BokehPass
} from '../ThreeJsLib/examples/jsm/postprocessing/BokehPass.js';

import {
  OrbitControls
} from '../ThreeJsLib/examples/jsm/controls/OrbitControls.js';

import {
  NodePass
} from '../ThreeJsLib/examples/jsm/nodes/postprocessing/NodePass.js';
import * as Nodes from '../ThreeJsLib/examples/jsm/nodes/Nodes.js';






let RENDERER, CAMERA, SCENE, COMPOSER;
// let COMPOSER, bloomPass, bokehPass;


function GAME_Scene_Init(){

  RENDER_SETTINGS.initRenderSettingsMenu();
  RENDERER = new THREE.WebGLRenderer();
  document.querySelector('#body').appendChild(RENDERER.domElement);
  CAMERA = new THREE.PerspectiveCamera(45, 2, 0.5, 100);
  CAMERA.position.set(0,15,15)
  CAMERA.lookAt(0,0,0);
  SCENE = new THREE.Scene();
  SCENE.background = new THREE.Color(0x34445b);

  // COMPOSER = new EffectComposer( RENDERER );
  // bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight),2 )

  window.addEventListener("resize",setSizes);
  setSizes();
  RENDER();


  takeSitPlace();
  buildModels();

};

function setSizes() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const pixelRatio = window.devicePixelRatio;





    // RENDERER.setPixelRatio(window.devicePixelRatio);
    RENDERER.setSize(windowWidth, windowHeight,false);
    RENDERER.domElement.style.width = windowWidth;
    RENDERER.domElement.style.height = windowHeight;

    CAMERA.aspect = windowWidth / windowHeight;
    CAMERA.updateProjectionMatrix();
  };




function RENDER(){
  // if(RENDER_SETTINGS.EFFECTS){
  //   COMPOSER.render();
  // }else{
  //   RENDERER.render(SCENE, CAMERA);
  // }

  RENDERER.render(SCENE, CAMERA);
  if(RENDER_SETTINGS.FPS === 0 ){
    requestAnimationFrame(RENDER);
  }else{
    setTimeout(RENDER,(1000/RENDER_SETTINGS.FPS))
  }
};

function takeSitPlace(){
  const userCount = Object.keys(GAME.playersInGame).length
  const userInex = Object.keys(GAME.playersInGame).indexOf(PLAYER.login);

  CAMERA.position.set(SIT_PLACES.USER_SIT_POSITIONS[userCount][userInex].x,SIT_PLACES.USER_SIT_DISTANCE*1.5,SIT_PLACES.USER_SIT_POSITIONS[userCount][userInex].z);
  CAMERA.lookAt(0,0,0);
};

function buildModels(){
  const loader = new THREE.BufferGeometryLoader();
  const hexagonGeom = loader.parse(JSON.parse(MODELS.hexagonJson));
  const RADIUS = MAP_SETTINGS.RADIUS;
  const ROUNDS = MAP_SETTINGS.ROUNDS;







  for(let z = 0; z<GAME.map.mapNamesArr.length;z++){
    for(let x = 0;x<GAME.map.mapNamesArr[z].length;x++){

      let RADIUS = MAP_SETTINGS.RADIUS;
      let ROUNDS = MAP_SETTINGS.ROUNDS;
      let colorHEX = MAP_SETTINGS.MAP_CELL_COLOR[GAME.map.mapNamesArr[z][x]];

      const material = new THREE.MeshBasicMaterial({ color:colorHEX });


      let hexMesh= new THREE.Mesh(hexagonGeom,material);
      hexMesh.scale.set(RADIUS,RADIUS,RADIUS);
      //строим по оси z
      if(z % 2){
        //для нечетных по z
        hexMesh.position.z = (RADIUS + RADIUS/2) * z;
      }else{
        //для четных  по z
        hexMesh.position.z = (RADIUS + RADIUS/2) * z;
      }
      //строим левый край всей карты
      hexMesh.position.x += 0.86602540378 * RADIUS * Math.abs(z-ROUNDS);

      //выстраиваем их по x
      hexMesh.position.x += 0.86602540378 * RADIUS*2 * x;

      //центрируем всю карту по x
      hexMesh.position.x -= 0.86602540378 * RADIUS*2*ROUNDS;

      //центрируем всю карту по z
      hexMesh.position.z -= (RADIUS + RADIUS/2)*ROUNDS;

      SCENE.add(hexMesh);
    };
  };








};







export{
  GAME_Scene_Init
}
