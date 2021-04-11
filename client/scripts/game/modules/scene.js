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



  POSTPROCESSOR = RENDER_SETTINGS.applyPostprocessors();



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








function setSizes() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const pixelRatio = window.devicePixelRatio;



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
  const skyGroup = new THREE.Group();
  skyGroup.userData.type = 'skyGroup';
  const skyLight = new THREE.HemisphereLight(0x394373, 0x616161, 0.7);
  const skyObjLight = new THREE.DirectionalLight(0xfffcfe, 1);



  const skySphereGeometry = new THREE.SphereGeometry( MAP_SETTINGS.RADIUS*25, 32, 32 );
  const skySphereMaterial = new THREE.MeshPhongMaterial({color:0xa6e0d8,shininess:0,});//0xa6e0d8
  skySphereMaterial.side = THREE.BackSide;

  const skySphere = new THREE.Mesh(skySphereGeometry,skySphereMaterial)

  skyGroup.add(skySphere);
  skyObjLight.castShadow = true;
  skyObjLight.position.set(0, 10, 0);
  skyObjLight.target.position.set(0, 0, 0);
  skyObjLight.shadow.camera.zoom = 0.1;

  skyGroup.add(skyLight);
  skyGroup.add(skyObjLight);
  skyGroup.add(skyObjLight.target);

  SCENE.add(skyGroup);

};
function buildMapCeils() {
  const loader = new THREE.BufferGeometryLoader();
  const hexagonGeom = loader.parse(JSON.parse(MODELS.hexagonWithHoleJson));
  const RADIUS = MAP_SETTINGS.RADIUS;
  const ROUNDS = MAP_SETTINGS.ROUNDS;

  const mapGroup = new THREE.Group();
  mapGroup.userData.type = 'mapGroup';
  for (let z = 0; z < GAME.map.mapNamesArr.length; z++) {
    for (let x = 0; x < GAME.map.mapNamesArr[z].length; x++) {


      const RADIUS = MAP_SETTINGS.RADIUS;
      const ROUNDS = MAP_SETTINGS.ROUNDS;
      const colorHEX = MAP_SETTINGS.MAP_CELL_COLOR[GAME.map.mapNamesArr[z][x]];
      const material = new THREE.MeshPhongMaterial({color:colorHEX,});

      const ceilGroup = new THREE.Group();
      ceilGroup.userData.type = 'mapCeilGroup';
      ceilGroup.userData.index = {z,x};
      const hexMesh = new THREE.Mesh(hexagonGeom, material);
      hexMesh.userData.type = 'mapCeil';



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
      };
      {
        let position = GAME_SCRIPT.getPositionByIndex(z, x);
        gamePositions.x = position.x;
        gamePositions.z = position.z;
      };

      ceilGroup.add(hexMesh);
      mapGroup.add(ceilGroup);
      ceilGroup.anim.animateTo(gamePositions.x, gamePositions.y, gamePositions.z);
    };
  };
  SCENE.add(mapGroup);

};




function buildOtherPlayers() {
  let GROUP;

  function checkBuild() {
    if (GROUP === undefined) {
      build();
    } else {
      SCENE.remove(GROUP);
      build();
    };
  };

  function build() {
    GROUP = new THREE.Group();
    GROUP.userData.type = 'usersGroup';
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
      changeDOMElementPositionByMesh(`#playerNameDiv_${mesh.login}`,mesh);
    });
  };

  return {
    build: checkBuild,
    positionNameSign: positionNameSign,
  };
};

function getDOMCordByMesh(mesh){
  const tempV = new THREE.Vector3();
  mesh.getWorldPosition(tempV);
  tempV.project(CAMERA);
  const x = (tempV.x * .5 + .5) * RENDERER.domElement.clientWidth;
  const y = (tempV.y * -.5 + .5) * RENDERER.domElement.clientHeight;

  return {x,y};
};

function changeDOMElementPositionByMesh(DOMid,mesh,xShift = 0,yShift = 0){
  const tempV = new THREE.Vector3();
  mesh.getWorldPosition(tempV);
  tempV.project(CAMERA);

  const x = (tempV.x * .5 + .5) * RENDERER.domElement.clientWidth;
  const y = (tempV.y * -.5 + .5) * RENDERER.domElement.clientHeight;

  const div = document.querySelector(DOMid);
  div.style.left = `${x + xShift}px`;
  div.style.top = `${y + yShift}px`;
};


function buildModels() {


};

function changeUICityNamesDivPosition() {
  for (let city in GAME.map.cities) {
    const mesh = GAME.map.cities[city].mesh;
    const div = document.querySelector(`#cityNameDiv_${city}`);
    changeDOMElementPositionByMesh(`#cityNameDiv_${city}`,mesh,div.clientWidth/2*(-1),div.clientHeight/2*(-1));
  };
};



function changeUIElementsPosition() {
  BUILD_PLAYERS_MESH.positionNameSign();
  changeUICityNamesDivPosition();
};




function temporaryMesh(){
  let mesh;
  let parentMesh;


  function create(type){
    switch (type) {
      case 'road':
        let geom = new THREE.BoxBufferGeometry(MAP_SETTINGS.RADIUS/2,MAP_SETTINGS.RADIUS/5,MAP_SETTINGS.RADIUS/1.5);
        let mat = new THREE.MeshBasicMaterial({color:0x454545});
        mesh = new THREE.Mesh(geom,mat);
        SCENE.add(mesh);
        break;
      default:

    }

  }
  function remove(){
    SCENE.remove(mesh);
  };



  function moveMeshToMesh(coordObj,sceneGroupType){
    const mouseX = coordObj.x;
    const mouseY = coordObj.y;
    let x,y,z;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = ( mouseX / window.innerWidth ) * 2 - 1;
	  mouse.y = - ( mouseY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, CAMERA );

    const intersects = raycaster.intersectObjects( sceneGroup(sceneGroupType).children,true );
  	for ( let i = 0; i < intersects.length; i ++ ) {
      parentMesh = intersects[ i ].object.parent;
      mesh.position.x = parentMesh.position.x;
      mesh.position.y = parentMesh.position.y;
      mesh.position.z = parentMesh.position.z;
  	};

  };






  function sceneGroup(type){
    function searchGroup(element, index, array){
      if(element.userData.type === type){
        return element;
      };
    };

    return SCENE.children.find(searchGroup);
  };
  function getDOMCord(){
    return getDOMCordByMesh(mesh);
  };

  return {
    create:create,
    remove:remove,
    moveMeshToMesh:moveMeshToMesh,
    returnParentMesh: function(){return parentMesh},
    getDOMCord:getDOMCord,
  };
};






const buildGameObject = {
  findCeilGroupByIndeses:function(indexses){
    function searchMapGroup(element, index, array){
      if(element.userData.type === 'mapGroup'){
        return element;
      };
    };
    const mapGroup = SCENE.children.find(searchMapGroup);

    function searchCeilGroup(element, index, array){
      if(element.userData.index.z === indexses[0] && element.userData.index.x === indexses[1]){
        return element;
      };
    };
    return mapGroup.children.find(searchCeilGroup);


  },
  road:function(pack){
    const ceilGroup = buildGameObject.findCeilGroupByIndeses(pack.indexses);
    const roadGeom = new THREE.BoxBufferGeometry(MAP_SETTINGS.RADIUS/2,MAP_SETTINGS.RADIUS/5,MAP_SETTINGS.RADIUS/1.5);
    const roadMaterial = new THREE.MeshPhongMaterial({color:0x454545});
    const roadMesh = new THREE.Mesh(roadGeom,roadMaterial);
    roadMesh.userData.id = pack.id;
    ceilGroup.add(roadMesh);
  },
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
  SCENE,
  RENDERER,
  BUILD_PLAYERS_MESH,
  temporaryMesh,
  buildGameObject,
};
