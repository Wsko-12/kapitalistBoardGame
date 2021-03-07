// <div class="notif_container">
//   <div class="notif_contant">
//     friend is online!
//   </div>
// </div>
function  generateId(type,x){
    let letters = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnPpQqRrSsTtUuVvWwXxYyZz';

    let numbers = '0123456789';
    let lettersMix,numbersMix;
    for(let i=0; i<10;i++){
      lettersMix += letters;
      numbersMix += numbers;
    }

    let mainArr = lettersMix.split('').concat(numbersMix.split(''));
    let shuffledArr = mainArr.sort(function(){
                        return Math.random() - 0.5;
                    });
    let id = type +'_';
    for(let i=0; i<=x;i++){
        id += shuffledArr[i];

    };
    return id;
};

function deleteNotification(id){
  document.querySelector(`#${id}`).remove();
}

function sendNotification(message,login,reverse){
  let body;let additionally;
  switch (message) {
    case 'friendOnline':
      body = 'is online!';
      additionally = login;
      break;
    case 'friendOffline':
      body = 'is disconnected';
      additionally = login;
    break;
    default:
      body = message;
      additionally = login;
  };
  let id = generateId('notification',4);
  let notification;
  if(!reverse){

    notification = `
      <div class="notif_container" id="${id}">
        <div class="notif_contant">
          ${body} ${additionally}
        </div>
      </div>
    `

  }else{
    notification = `
      <div class="notif_container" id="${id}">
        <div class="notif_contant">
           ${additionally} ${body}
        </div>
      </div>
    `
  };

  document.querySelector('#NOTES_NotificationSection').insertAdjacentHTML('afterBegin',notification);
  setTimeout(function(){
    deleteNotification(id);
  },5000);
};



export {sendNotification}
