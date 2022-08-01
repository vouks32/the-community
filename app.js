const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');
const isConnected = false;
const {
  Client,
  Location,
  List,
  Buttons,
  LocalAuth,
  ClientInfo
} = require('whatsapp-web.js');
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});
const clientInfo = new ClientInfo();
const archiver = require('archiver');
const com_init = require('./initialisation.js');


client.on('qr', qr => {
  qrcode.generate(qr, {
    small: true
  });
});

client.on('authenticated', () => {
  console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
  // Fired if session restore was unsuccessful
  console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
  console.log('READY');

});


client.on('message', async msg => {
  console.log('MESSAGE RECEIVED \n FROM : ', msg.from, '\n TEXT :', msg.body);
  let chat = await msg.getChat();
  const _contact = await msg.getContact();
  /////////////////////////////////////////////////////////
  /* if (msg.body == '!ping') {
      let button = new Buttons('Que pouvons nous faire pour vous?',[{body:'Procédure visa'},{body:'Import-export'}],'MUSES','Muses-SARL');
        client.sendMessage(msg.from, button);
  } 
	if (msg.body == '!pong'  || msg.body == 'Procédure visa' ) {
     let sections = [{title:'Pays',rows:[{title:'Belgique'},{title:'Canada'},{title:'Maroc'}]}];
        let list = new List('Dans quel pays souhaitez vous lancer la procédure','Choisir un pays',sections,'PROCÉDURE VISA','Muses-SARL');
        client.sendMessage(msg.from, list);
  }*/

  //////////////////////////////////////////////////////////
  if (msg.body == '!start') {
    if (chat.isGroup) {
      com_init.start_community(chat, msg, _contact);
    } else {
      msg.reply('This command can only be used in a group!');
    }
  }

  ///////////////////////////////////////////////////////////
  if (msg.body == '!info') {
    send_info(msg);
  }

  ///////////////////////////////////////////////////////////
  if (msg.body == '!players') {
    send_player_list(msg);
  }

  ///////////////////////////////////////////////////////////
  if (msg.body == '!play') {
    if (chat.isGroup) {
      com_init.join_game(chat, msg, _contact)
    } else {
      let reply_msg = "Pour jouer à *The Community* vous devez d'abord intégrer un groupe où le jeu a été lancé en utilisant la commande *!start* puis envoyer *!play* ou cliquer sur le bouton *!play*"
      msg.reply(reply_msg);
    }
  }


});


function send_info(msg) {
  let reply_msg = "*The Community* \nLa communauté est un jeu social sur WhatsApp. \n\nChaque participant est attribué un personnage, et chaque personnage est attribué de façon aléatoire un job (président, prostitué, chimiste, pape, etc.), et des caractéristiques tel que la force, la joie etc. \n\nLe but étant de *survivre* dans cette communauté, en créant des liens, tuant, trahissant, et interagissant avec les autres membres de la communauté. Car en effet, chaque année (une année étant égale à 12 jours), Le dieu de la communauté réclame à lui 3 sacrifices humain, qui seront décidé par vote égale (ou peut-être pas ƪ(˘⌣˘)ʃ ) par chaque membre de la communauté.";
  let button = new Buttons('Pour lancer *The Community* , envoyez !start dans ce groupe ou clickez sur le bouton suivant', [{
    id: '!start',
    body: '!start'
  }], '*The Community*', 'Eden-Entertainment © 2022');

  msg.reply(reply_msg);
  msg.reply(button);
}


function send_player_list(msg, chat) {
  let group_id = chat.id;
  const grp_inf = fs.getJsonSync("games/" + group_id.id + "/group_infos.json");
  let reply_msg = "Liste the tout les membres de la communauté :\n";
  let mentions = [];
  grp_inf.participants.array.forEach((elt) => {
    reply_msg += `- @${elt.number}\n`;
    mentions.push(elt);
  });
  chat.sendMessage(reply_msg, {
    mentions: mentions
  });
}


client.on('group_join', (notification) => {
  // User has joined or been added to the group.
  console.log('join', notification);
  send_info(notification);

});

client.on('group_leave', (notification) => {
  // User has left or been kicked from the group.
  console.log('leave', notification);
  notification.reply('User left.');
});

client.on('group_update', (notification) => {
  // Group picture, subject or description has been updated.
  console.log('update', notification);
});

client.on('change_state', state => {
  console.log('CHANGE STATE', state);
});

client.on('disconnected', (reason) => {
  console.log('Client was logged out', reason);
});
app.get('/', function (req, res) {
  res.send('hello world');
});

app.listen(port, function () {
  console.log('App listening on port ' + port)
})

client.initialize();
