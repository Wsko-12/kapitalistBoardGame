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


let RENDERER, CAMERA, SCENE, BUILD_PLAYERS_MESH;
let POSTPROCESSOR;



function initializeScene() {


  RENDERER = new THREE.WebGLRenderer();
  document.querySelector('#body').appendChild(RENDERER.domElement);
  CAMERA = new THREE.PerspectiveCamera(45, 2, 0.5, 100);
  CAMERA.anim = ANIMATION.animateCamera(CAMERA);
  CAMERA.position.set(0, 15, 15)
  CAMERA.lookAt(0, 0, 0);
  SCENE = new THREE.Scene();
  // const loader = new THREE.TextureLoader();
  // const backgroundTexture = loader.load( 'https://i.imgur.com/upWSJlY.jpg' );
  // SCENE.background = backgroundTexture;


  RENDERER.shadowMap.enabled = true;



  POSTPROCESSOR = applyPostprocessors();



  window.addEventListener("resize", setSizes);
  setSizes();

  takeSitPlace();
  addSky();
  buildMapCeils();

  UI.buildGameUI();
  BUILD_PLAYERS_MESH = buildOtherPlayers();
  BUILD_PLAYERS_MESH.build();



  RENDER();

};

function applyPostprocessors(){

  const RENDERER_SCENNE = new RenderPass(SCENE, CAMERA);
  const COMPOSER = new EffectComposer(RENDERER);
  COMPOSER.addPass(RENDERER_SCENNE);


  // const BLOOM_PASS = new UnrealBloomPass(
  // new THREE.Vector2(window.innerWidth, window.innerHeight),0.5,0.5,0.9);
  // COMPOSER.addPass(BLOOM_PASS);

  const NODE_PASS = new NodePass();

  const screen = new Nodes.ScreenNode();

  const hue = new Nodes.FloatNode(0);
  const sataturation = new Nodes.FloatNode(1);
  const vibrance = new Nodes.FloatNode(0.8);
  const brightness = new Nodes.FloatNode(0);
  const contrast = new Nodes.FloatNode(1);

  const hueNode = new Nodes.ColorAdjustmentNode(screen, hue, Nodes.ColorAdjustmentNode.HUE);
  const satNode = new Nodes.ColorAdjustmentNode(hueNode, sataturation, Nodes.ColorAdjustmentNode.SATURATION);
  const vibranceNode = new Nodes.ColorAdjustmentNode(satNode, vibrance, Nodes.ColorAdjustmentNode.VIBRANCE);
  const brightnessNode = new Nodes.ColorAdjustmentNode(vibranceNode, brightness, Nodes.ColorAdjustmentNode.BRIGHTNESS);
  const contrastNode = new Nodes.ColorAdjustmentNode(brightnessNode, contrast, Nodes.ColorAdjustmentNode.CONTRAST);
  NODE_PASS.input = contrastNode;
  COMPOSER.addPass(NODE_PASS);






  const NODEPASS_FADE = new NodePass();
   const fade = new Nodes.MathNode(
     new Nodes.ScreenNode(),
     new Nodes.ColorNode(0xffffff),
     new Nodes.FloatNode(0.1),
     Nodes.MathNode.MIX
   );
   NODEPASS_FADE.input = fade;
   COMPOSER.addPass(NODEPASS_FADE);




   // const BOKEH_PASS = new BokehPass(SCENE, CAMERA, {
   //     focus: 0,
   //     aperture: 0.001,
   //     maxblur: 0.01,
   //
   //     width: window.innerWidth,
   //     height: window.innerHeight,
   //   });
   //   COMPOSER.addPass(BOKEH_PASS);



  function render(){
    COMPOSER.render();
  }
  function resize(){
    COMPOSER.setSize(window.innerWidth, window.innerHeight);
  };


  return {
    render:render,
    resize:resize,
  };
};








function setSizes() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const pixelRatio = window.devicePixelRatio;





  // RENDERER.setPixelRatio(window.devicePixelRatio);
  RENDERER.setSize(windowWidth, windowHeight, false);
  RENDERER.domElement.style.width = windowWidth;
  RENDERER.domElement.style.height = windowHeight;


  POSTPROCESSOR.resize();
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

function addSky(){
  const skyLight = new THREE.HemisphereLight(0x394373, 0x616161, 0.7);
  const skyObjLight = new THREE.DirectionalLight(0xfffcfe, 1);



  const skySphereGeometry = new THREE.SphereGeometry( MAP_SETTINGS.RADIUS*25, 32, 32 );
  const skySphereMaterial = new THREE.MeshPhongMaterial({color:0xa6e0d8,shininess:0,});//0xa6e0d8
  skySphereMaterial.side = THREE.BackSide;

  const skySphere = new THREE.Mesh(skySphereGeometry,skySphereMaterial)

  SCENE.add(skySphere);
  skyObjLight.castShadow = true;
  skyObjLight.position.set(0, 10, 0);
  skyObjLight.target.position.set(0, 0, 0);
  skyObjLight.shadow.camera.zoom = 0.1;

  SCENE.add(skyLight);
  SCENE.add(skyObjLight);
  SCENE.add(skyObjLight.target);

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
      const material = new THREE.MeshPhongMaterial({color:colorHEX,});

      const ceilGroup = new THREE.Group();
      const hexMesh = new THREE.Mesh(hexagonGeom, material);



      if (GAME.map.mapFlagsArr[z][x] === 1) {
        const litleHexBlockMeshMaterial =  new THREE.MeshBasicMaterial({ color:0xff2400 });

        // const litleHexBlockMeshMaterial = material; //ceil color
        const litleHexBlockMesh = new THREE.Mesh(new THREE.CircleGeometry(MAP_SETTINGS.RADIUS / 10, 6), litleHexBlockMeshMaterial);
        litleHexBlockMesh.rotation.x = -Math.PI / 2;
        litleHexBlockMesh.rotation.z = -Math.PI / 2;
        ceilGroup.add(litleHexBlockMesh);
      };

      ceilGroup.indexses = [z, x];
      ceilGroup.anim = ANIMATION.animation(ceilGroup);
      hexMesh.anim = ANIMATION.animation(hexMesh);
      hexMesh.scale.set(RADIUS, RADIUS, RADIUS);


      //для красивой анимации
      ceilGroup.anim.getRandomPositionXYZ_Ypositive();
      if (GAME.map.mapNamesArr[z][x] === 'city') {
        for (let city in GAME.map.cities) {
          if (GAME.map.cities[city].z === z && GAME.map.cities[city].x === x) {
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

  function checkBuild() {
    if (GROUP === undefined) {
      build();
    } else {
      SCENE.remove(GROUP);
      build();
    }
  };

  function build() {
    GROUP = new THREE.Group();
    for (let player in GAME.playersInGame) {
      if (player != PLAYER.login) {
        const boxGeom = new THREE.BoxBufferGeometry(MAP_SETTINGS.RADIUS * 2, MAP_SETTINGS.RADIUS * 2, MAP_SETTINGS.RADIUS * 2);
        const material = new THREE.MeshBasicMaterial({
          color: SIT_PLACES.USER_COLORS.three[GAME.playersJoined[player].colorIndex],
        });
        const userMesh = new THREE.Mesh(boxGeom, material);
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

  function positionNameSign() {


    GROUP.children.forEach((mesh, ndx) => {
      if (mesh.login != PLAYER.login) {
        const tempV = new THREE.Vector3();
        mesh.getWorldPosition(tempV);
        tempV.project(CAMERA);

        const x = (tempV.x * .5 + .5) * RENDERER.domElement.clientWidth;
        const y = (tempV.y * -.5 + .5) * RENDERER.domElement.clientHeight;

        const div = document.querySelector(`#playerNameDiv_${mesh.login}`);
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
      }
    });
  };

  return {
    build: checkBuild,
    positionNameSign: positionNameSign,
  }


};



function buildModels() {


};

function changeUICityNamesDivPosition() {
  for (let city in GAME.map.cities) {
    const tempV = new THREE.Vector3();
    const mesh = GAME.map.cities[city].mesh
    mesh.getWorldPosition(tempV);
    tempV.project(CAMERA);

    const x = (tempV.x * .5 + .5) * RENDERER.domElement.clientWidth;
    const y = (tempV.y * -.5 + .5) * RENDERER.domElement.clientHeight;

    const div = document.querySelector(`#cityNameDiv_${city}`);

    div.style.left = `${x - div.clientWidth/2}px`;
    div.style.top = `${y - div.clientHeight/2}px`;
  }
};



function changeUIElementsPosition() {
  BUILD_PLAYERS_MESH.positionNameSign();
  changeUICityNamesDivPosition();
};


function RENDER() {
  if(RENDER_SETTINGS.EFFECTS){
    POSTPROCESSOR.render();
  }else{
    RENDERER.render(SCENE, CAMERA);
  };
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
