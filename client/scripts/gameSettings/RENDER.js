let FPS = 0;
let EFFECTS = true;
let RESOLUTION = 1;




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


import {SCENE,CAMERA,RENDERER,setSizes} from '/scripts/game/modules/scene.js';



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
  const vibrance = new Nodes.FloatNode(0);
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
   //     width: window.innerWidth,
   //     height: window.innerHeight,
   //   });
   //   COMPOSER.addPass(BOKEH_PASS);



  function render(){
    COMPOSER.render();
  };
  function resize(){
    const windowWidth = document.body.clientWidth;
    const windowHeight = document.body.clientHeight;

    const pixelRatio = window.devicePixelRatio;


    if(RESOLUTION === 0){
      COMPOSER.setSize(windowWidth/1.5, windowHeight/1.5, true);
    }
    if(RESOLUTION === 1){
      COMPOSER.setSize(windowWidth, windowHeight, true);
    }
    if(RESOLUTION === 2){
      COMPOSER.setSize(windowWidth*pixelRatio, windowHeight*pixelRatio, true);
    }

  };


  return {
    render:render,
    resize:resize,
  };
};










function fullScreen(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.webkitrequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if(element.mozRequestFullscreen) {
    element.mozRequestFullScreen();
  }
};







function initRenderSettingsMenu(){
  const section = `
  <section class="nonSelectText" id="settingsSection">
    <div id="renderSettingsButton">video settings</div>
    <div id="renderSettingsSection" style="display:none">
      <input type="range" id="FPS_RANGE" name="RANGE_FPS" min="0" max="40" step="5" value="0">
      <label for="RANGE_FPS">FPS: auto</label>
      </br>
      <input type="range" id="RANGE_RESOLUTION" name="RANGE_RESOLUTION" min="0" max="2" step="1" value="1">
      <label for="RANGE_RESOLUTION">RESOLUTION: Standart</label>
      </br>
      <button id="EFFECTS_BTN">EFFECTS:on</button>

      <div id="fullScreenButton">Full screen</div>
    </div>

  </section>
  `



  document.querySelector('#body').insertAdjacentHTML('beforeEnd',section)
  document.querySelector('#renderSettingsButton').onclick = function(){
    showRenderSettings(true)
  };
  document.querySelector('#fullScreenButton').onclick = function(){
    document.documentElement.requestFullscreen();
  };
  document.querySelector('#EFFECTS_BTN').onclick = function(){
    enableEffects();
  };

  function showRenderSettings(bool){
    if(bool){
      document.querySelector('#renderSettingsButton').innerHTML = 'Close';
      document.querySelector('#renderSettingsButton').onclick = null;
      document.querySelector('#renderSettingsButton').onclick = function(){
        showRenderSettings(false)
      };

      document.querySelector('#renderSettingsSection').style.display = 'block'


    }else {
      document.querySelector('#renderSettingsButton').innerHTML = 'Video settings';
      document.querySelector('#renderSettingsButton').onclick = null;
      document.querySelector('#renderSettingsButton').onclick = function(){
        showRenderSettings(true)
      };
      document.querySelector('#renderSettingsSection').style.display = 'none'
    }
  };

  function enableEffects(){
    if(EFFECTS){
      document.querySelector('#EFFECTS_BTN').innerHTML = 'EFFECTS:off';
      EFFECTS = false;
    }else{
      document.querySelector('#EFFECTS_BTN').innerHTML = 'EFFECTS:on';
      EFFECTS = true;
    };
  };

  document.querySelector('#FPS_RANGE').onchange = function(){
    FPS = Number.parseInt(this.value);
    let label = FPS;
    if(FPS === 0){
      label = 'auto';
    };
    document.querySelector(`[for="${this.name}"]`).innerHTML = 'FPS: '+label;
  };

  document.querySelector('#RANGE_RESOLUTION').onchange = function(){
    const resolNum = Number.parseInt(this.value);
    let label = resolNum;
    if(resolNum === 0){
      label = 'RESOLUTION: Min';
      RESOLUTION = 0;
    }
    if(resolNum === 1){
      label = 'RESOLUTION: Standart';
      RESOLUTION = 1;
    }
    if(resolNum === 2){
      label = 'RESOLUTION: Max';
      RESOLUTION = 2;
    }
    setSizes();
    document.querySelector(`[for="${this.name}"]`).innerHTML = label;
  };

};






export{
  initRenderSettingsMenu,
  FPS,
  EFFECTS,
  applyPostprocessors,
  RESOLUTION,
};
