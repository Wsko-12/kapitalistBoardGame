import {
  socket
} from "/scripts/socketInit.js";

import {
  PLAYER,
} from "/scripts/accPage.js";
import {
  GAME
} from "/scripts/game/GAME.js"
import * as GAME_SCRIPT from "/scripts/game/GAME.js"

import * as THREE from '/scripts/ThreeJsLib/build/three.module.js';
import * as RENDER_SETTINGS from '/scripts/gameSettings/RENDER.js';
import * as MODELS from '/scripts/models/models.js';
import * as MAP_SETTINGS from "/scripts/gameSettings/map.js";
import * as SIT_PLACES from "/scripts/gameSettings/sittingPlace.js";
import * as ANIMATION from "./animations.js";
import * as UI from '../GAME_UI.js';




import {
  EffectComposer
} from '/scripts/ThreeJsLib/examples/jsm/postprocessing/EffectComposer.js';
import {
  RenderPass
} from '/scripts/ThreeJsLib/examples/jsm/postprocessing/RenderPass.js';
import {
  ShaderPass
} from '/scripts/ThreeJsLib/examples/jsm/postprocessing/ShaderPass.js';
import {
  UnrealBloomPass
} from '/scripts/ThreeJsLib/examples/jsm/postprocessing/UnrealBloomPass.js';

import {
  BokehPass
} from '/scripts/ThreeJsLib/examples/jsm/postprocessing/BokehPass.js';

import {
  OrbitControls
} from '/scripts/ThreeJsLib/examples/jsm/controls/OrbitControls.js';

import {
  NodePass
} from '/scripts/ThreeJsLib/examples/jsm/nodes/postprocessing/NodePass.js';
import * as Nodes from '/scripts/ThreeJsLib/examples/jsm/nodes/Nodes.js';


let RENDERER, CAMERA, SCENE, COMPOSER,BUILD_PLAYERS_MESH;
// let COMPOSER, bloomPass, bokehPass;


function initializeScene() {


  RENDERER = new THREE.WebGLRenderer();
  document.querySelector('#body').appendChild(RENDERER.domElement);
  CAMERA = new THREE.PerspectiveCamera(45, 2, 0.5, 100);
  CAMERA.anim = ANIMATION.animateCamera(CAMERA);
  CAMERA.position.set(0, 15, 15)
  CAMERA.lookAt(0, 0, 0);
  SCENE = new THREE.Scene();
  SCENE.background = new THREE.Color(0x34445b);

  // COMPOSER = new EffectComposer( RENDERER );
  // bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight),2 )

  window.addEventListener("resize", setSizes);
  setSizes();

  takeSitPlace();
  buildMapCeils();

  UI.buildGameUI();
  BUILD_PLAYERS_MESH = buildOtherPlayers();
  BUILD_PLAYERS_MESH.build();


  RENDER();

};

function setSizes() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const pixelRatio = window.devicePixelRatio;





  // RENDERER.setPixelRatio(window.devicePixelRatio);
  RENDERER.setSize(windowWidth, windowHeight, false);
  RENDERER.domElement.style.width = windowWidth;
  RENDERER.domElement.style.height = windowHeight;

  CAMERA.aspect = windowWidth / windowHeight;
  CAMERA.updateProjectionMatrix();
};






function takeSitPlace() {
  const userCount = Object.keys(GAME.playersInGame).length
  const userInex = Object.keys(GAME.playersInGame).indexOf(PLAYER.login);
  CAMERA.position.set(SIT_PLACES.USER_SIT_POSITIONS[userCount][userInex].x, SIT_PLACES.USER_SIT_DISTANCE * 1.5, SIT_PLACES.USER_SIT_POSITIONS[userCount][userInex].z);
  CAMERA.lookAt(0, 0, 0);
};

function takeSitCoord(login) {
  const userCount = Object.keys(GAME.playersInGame).length
  const userInex = Object.keys(GAME.playersInGame).indexOf(login);
  return {
    x: SIT_PLACES.USER_SIT_POSITIONS[userCount][userInex].x,
    y: SIT_PLACES.USER_SIT_DISTANCE * 1.5,
    z: SIT_PLACES.USER_SIT_POSITIONS[userCount][userInex].z,
  };
};


function buildMapCeils() {
  const loader = new THREE.BufferGeometryLoader();
  const hexagonGeom = loader.parse(JSON.parse(MODELS.hexagonWithHoleJson));
  const RADIUS = MAP_SETTINGS.RADIUS;
  const ROUNDS = MAP_SETTINGS.ROUNDS;
  for (let z = 0; z < GAME.map.mapNamesArr.length; z++) {
    for (let x = 0; x < GAME.map.mapNamesArr[z].length; x++) {


      const RADIUS = MAP_SETTINGS.RADIUS;
      const ROUNDS = MAP_SETTINGS.ROUNDS;
      const colorHEX = MAP_SETTINGS.MAP_CELL_COLOR[GAME.map.mapNamesArr[z][x]];
      const material = new THREE.MeshBasicMaterial({
        color: colorHEX
      });

      const ceilGroup = new THREE.Group();
      const hexMesh = new THREE.Mesh(hexagonGeom, material);



      if (GAME.map.mapFlagsArr[z][x] === 1) {
        // const litleHexBlockMeshMaterial =  new THREE.MeshBasicMaterial({ color:0xff2400 });

        const litleHexBlockMeshMaterial = material; //ceil color
        const litleHexBlockMesh = new THREE.Mesh(new THREE.CircleGeometry(MAP_SETTINGS.RADIUS / 10, 6), litleHexBlockMeshMaterial);
        litleHexBlockMesh.rotation.x = -Math.PI / 2;
        litleHexBlockMesh.rotation.z = -Math.PI / 2;
        ceilGroup.add(litleHexBlockMesh);
      };

      ceilGroup.indexses = [z,x];
      ceilGroup.anim = ANIMATION.animation(ceilGroup);
      hexMesh.anim = ANIMATION.animation(hexMesh);
      hexMesh.scale.set(RADIUS, RADIUS, RADIUS);


      //для красивой анимации
      ceilGroup.anim.getRandomPositionXYZ_Ypositive();
      if(GAME.map.mapNamesArr[z][x] === 'city'){
        for(let city in GAME.map.cities){
          if(GAME.map.cities[city].z === z && GAME.map.cities[city].x === x){
            GAME.map.cities[city].mesh = hexMesh;
          };
        };
      };

      const gamePositions = {
        x: 0,
        y: 0,
        z: 0,
      }; {
        let position = GAME_SCRIPT.getPositionByIndex(z, x);
        gamePositions.x = position.x;
        gamePositions.z = position.z;
      }

      ceilGroup.add(hexMesh);
      SCENE.add(ceilGroup);
      ceilGroup.anim.animateTo(gamePositions.x, gamePositions.y, gamePositions.z);
    };
  };

};




function buildOtherPlayers() {
  let GROUP;
  function checkBuild(){
    if(GROUP === undefined){
      build();
    }else{
      SCENE.remove(GROUP);
      build();
    }
  };
  function build(){
    GROUP = new THREE.Group();
    for(let player in GAME.playersInGame){
      if(player != PLAYER.login){
        const boxGeom = new THREE.BoxBufferGeometry(MAP_SETTINGS.RADIUS*2,MAP_SETTINGS.RADIUS*2,MAP_SETTINGS.RADIUS*2);
        const material = new THREE.MeshBasicMaterial({
          color: SIT_PLACES.USER_COLORS.three[GAME.playersJoined[player].colorIndex],
        });
        const userMesh = new THREE.Mesh(boxGeom,material);
        userMesh.login = player;
        GROUP.add(userMesh);
        let coord = takeSitCoord(player);
        userMesh.position.x = coord.x;
        userMesh.position.z = coord.z;
        userMesh.position.y = MAP_SETTINGS.RADIUS;
      };
    };
    SCENE.add(GROUP);


  };
  function positionNameSign(){


    GROUP.children.forEach((mesh, ndx)=>{
      if(mesh.login != PLAYER.login){
        const tempV = new THREE.Vector3();
        mesh.getWorldPosition(tempV);
        tempV.project(CAMERA);

        const x = (tempV.x *  .5 + .5) * RENDERER.domElement.clientWidth;
        const y = (tempV.y * -.5 + .5) * RENDERER.domElement.clientHeight;

        const div =  document.querySelector(`#playerNameDiv_${mesh.login}`);
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
      }
    });
  };

  return{
    build:checkBuild,
    positionNameSign:positionNameSign,
  }


};



function buildModels() {


};

function changeUICityNamesDivPosition(){
  for(let city in GAME.map.cities){
      const tempV = new THREE.Vector3();
      const mesh = GAME.map.cities[city].mesh
      mesh.getWorldPosition(tempV);
      tempV.project(CAMERA);

      const x = (tempV.x *  .5 + .5) * RENDERER.domElement.clientWidth;
      const y = (tempV.y * -.5 + .5) * RENDERER.domElement.clientHeight;

      const div =  document.querySelector(`#cityNameDiv_${city}`);

      div.style.left = `${x - div.clientWidth/2}px`;
      div.style.top = `${y - div.clientHeight/2}px`;
    }
};



function changeUIElementsPosition(){
  BUILD_PLAYERS_MESH.positionNameSign();
  changeUICityNamesDivPosition();
};


function RENDER() {
  // if(RENDER_SETTINGS.EFFECTS){
  //   COMPOSER.render();
  // }else{
  //   RENDERER.render(SCENE, CAMERA);
  // }

  RENDERER.render(SCENE, CAMERA);
  if (RENDER_SETTINGS.FPS === 0) {
    requestAnimationFrame(RENDER);
  } else {
    setTimeout(RENDER, (1000 / RENDER_SETTINGS.FPS))
  }

  changeUIElementsPosition();
};


export {
  initializeScene,
  takeSitPlace,
  takeSitCoord,
  CAMERA,
  BUILD_PLAYERS_MESH,
}
