let FPS = 0;
let EFFECTS = true;

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
  <div style="position:fixed">
    <div id="renderSettingsButton">video settings</div>
    <div id="renderSettingsSection" style="display:none">
      <input type="range" id="FPS_RANGE" name="RANGE_FPS" min="0" max="40" step="5" value="0">
      <label for="RANGE_FPS">FPS: auto</label>

      <div id="fullScreenButton">Full screen</div>
    </div>

  </div>
  `



  document.querySelector('#body').insertAdjacentHTML('beforeEnd',section)
  document.querySelector('#renderSettingsButton').onclick = function(){
    showRenderSettings(true)
  };
  document.querySelector('#fullScreenButton').onclick = function(){
    document.documentElement.requestFullscreen();
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
  }






  document.querySelector('#FPS_RANGE').onchange = function(){
    FPS = Number.parseInt(this.value);
    let label = FPS;
    if(FPS === 0){
      label = 'auto';
    };
    document.querySelector(`[for="${this.name}"]`).innerHTML = 'FPS: '+label;
  };




};

export{
  initRenderSettingsMenu,
  FPS,
  EFFECTS,
};
