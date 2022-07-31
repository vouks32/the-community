const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');
const archiver = require('archiver');
const {
  Client,
  Location,
  List,
  Buttons,
  LocalAuth
} = require('whatsapp-web.js');
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    ignoreDefaultArgs: ['--disable-extensions'],
    executablePath: "./node_modules/puppeteer/.local-chromium/win64-637110/chrome-win/chrome.exe"
  }
});


const default_player_infos = {
  "id": 0,
  "contact": {},
  "game_name": "",
  "gender": "",
  "stats": {
    "money": 0,
    "joy": 0,
    "force": 0,
    "charisma": 0,
    "intelligence": 0,
    "experience": 0,
    "com_grade": 0
  },
  "parents": [],
  "talents": [],
  "diplomas": [],
  "jobs": [],
  "possessions": []
}

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
  if (msg.body == '!ping') {
    msg.reply('pong');
  }

  //////////////////////////////////////////////////////////
  if (msg.body == '!start') {
    if (chat.isGroup) {
      start_community(chat, msg, _contact);
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
      join_game(chat, msg, _contact)
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

function start_community(chat, msg, _contact) {
  let group_id = chat.id;
  const grps = fs.getJsonSync("groups.json");
  if (grps.find(function (elt) {
      if (elt.id == group_id.id) {
        return true;
      } else {
        return false;
      }
    })) {
    msg.reply("Ce group est déjà dans une partie de *The Community*", group_id.id)
  } else {
    grps.push(group_id);
    fs.outputJsonSync("groups.json", grps);
    fs.mkdirpSync("games/" + group_id.id);
    let grp_inf = {
      "participants": {
        "number": 0,
        "array": []
      },
      "initiator": contact,
      "game": {
        "days_played": 0
      }
    };
    fs.outputJsonSync("games/" + group_id.id + "/group_infos.json", grp_inf);
    fs.mkdirpSync("games/" + group_id.id + "/participants");
    let grp_tsk = [{
      "name": "start_community",
      "time": Date().now() + 1000 * 60 * 60 * 9,
      "fn": initialize_com(chat),
      "done": true,
    }];
    fs.outputJsonSync("games/" + group_id.id + "/group_tasks.json", grp_tsk);

    let description = "Bienvenue dans *la communauté*.\nLa partie commencera aujourd'hui à 19hr.\nSi vous souhaitez y participer vous pouvez envoyer '!start' dans ce group à tout moment et même apres que la partie est débuté.\nMerci à vous (*￣3￣)╭ ."
    chat.setDescription(description);
    let button = new Buttons('Pour y participer, clickez sur le bouton si dessous ou envoyez *!play* dans ce group', [{
      id: '!play',
      body: '!play'
    }], '*The Community*', 'Eden-Entertainment © 2022');
    chat.sendMessage(description);
    chat.sendMessage(button);
  }
}


function join_game(chat, msg, _contact) {
  let group_id = chat.id;
  const grp_inf = fs.getJsonSync("games/" + group_id.id + "/group_infos.json");
  if (grp_inf.participants.array.find(function (elt) {
      if (elt.id == contact.id) {
        return true;
      } else {
        return false;
      }
    })) {
    msg.reply("Vous êtes déjà dans la partie!");
  } else {
    grp_inf.participants.array.push(contact);
    grp_inf.participants.number += 1;
    fs.outputJsonSync("games/" + group_id.id + "/group_infos.json", grp_inf);
    fs.mkdirpSync("games/" + group_id.id + "/participants/" + contact.id);
    fs.outputJsonSync("games/" + group_id.id + "/participants/" + contact.id + "/player_infos.json", default_player_infos);
    msg.reply("Vous êtes désormais membre de la communauté!");
  }
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

function initialize_com(chat) {
  let group_id = chat.id;
  //const grp_inf = fs.getJsonSync("games/" + group_id.id + "/group_infos.json");

  if (grp_inf.participants.number > 50) {
    let id = 0;
    let g = [1, 2, 7, 7, 5, 6];
    while (id < grp_inf.participants.array.length) {
      grp_inf.participants.array.sort(function (a, b) {
        return (Math.random() < 0.5) ? -1 : 1;
      });
      id++;
    }
    grp_inf.participants.array.forEach(function (_participant, key) {
      let _participant_profil = default_player_infos;
      _participant_profil.id = _participant.id;
      _participant_profil.contact = _participant;
      _participant_profil.game_name = get_random_name;
      _participant_profil.stats.money = Number((Math.random() * 3000).toFixed(0)) + 6500;
      _participant_profil.stats.joy = Number((Math.random() * 20).toFixed(0)) + 5;
      _participant_profil.stats.force = Number((Math.random() * 20).toFixed(0)) + 10;
      _participant_profil.stats.charisma = Number((Math.random() * 40).toFixed(0));
      _participant_profil.stats.intelligence = Number((Math.random() * 40).toFixed(0));
      _participant_profil.stats.experience = Number((Math.random() * 15).toFixed(0));
      _participant_profil.talents.push({
        "id": fs.getJsonSync("games/" + group_id.id + "/group_infos.json")[Number((Math.random() * 9).toFixed(0))]
      });


    });
  } else {
    chat.sendMessage("La communauté n'a pas assez de joueur.Il y'a :\n" + grp_inf.participants.number + " participants / 50 participants\nLe jeu commencera demain à :\n *18hr-UTC (19hr-Cameroun)* ");
  }
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


client.initialize();
