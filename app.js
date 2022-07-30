const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');
const archiver = require('archiver');
const {
  Client,
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
  console.log('MESSAGE RECEIVED', msg);

  /////////////////////////////////////////////////////////
  if (msg.body == '!ping') {
    msg.reply('pong');
  }

  //////////////////////////////////////////////////////////
  if (msg.body == '!start') {
    let chat = await msg.getChat();
    if (chat.isGroup) {
      let description = "Bienvenue dans *la communauté*.\nLa partie commencera aujourd'hui à 19hr.\nSi vous souhaitez y participer vous pouvez envoyer '!start' à tout moment, même apres que la partie est débuté.\nMerci à vous (*￣3￣)╭ ."
      chat.setDescription(description);
      const _contact = await msg.getContact();
      start_community(chat, msg);
    } else {
      msg.reply('This command can only be used in a group!');
    }
  }

  ///////////////////////////////////////////////////////////
  if (msg.body == '!info') {
    let reply_msg = "The Community\nLa communauté est un jeu social sur WhatsApp. \n\nChaque participant est attribué un personnage, et chaque personnage est attribué de façon aléatoire un job (président, prostitué, chimiste, pape, etc.), et des caractéristiques tel que la force, la joie etc. \n\nLe but étant de *survivre* dans cette communauté, en créant des liens, tuant, trahissant, et interagissant avec les autres membres de la communauté. Car en effet, chaque année (une année étant égale à 12 jours), Le dieu de la communauté réclame à lui 3 sacrifices humain, qui seront décidé par vote égale (ou peut-être pas ƪ(˘⌣˘)ʃ ) par chaque membre de la communauté."
    msg.reply(reply_msg);
  }

  ///////////////////////////////////////////////////////////
  if (msg.body == '!play') {
    let reply_msg = "The Community\nLa communauté est un jeu social sur WhatsApp. \n\nChaque participant est attribué un personnage, et chaque personnage est attribué de façon aléatoire un job (président, prostitué, chimiste, pape, etc.), et des caractéristiques tel que la force, la joie etc. \n\nLe but étant de *survivre* dans cette communauté, en créant des liens, tuant, trahissant, et interagissant avec les autres membres de la communauté. Car en effet, chaque année (une année étant égale à 12 jours), Le dieu de la communauté réclame à lui 3 sacrifices humain, qui seront décidé par vote égale (ou peut-être pas ƪ(˘⌣˘)ʃ ) par chaque membre de la communauté."
    msg.reply(reply_msg);
  }


});


function start_community(chat, msg, _contact) {
  let group_id = chat.id;

  //fs.mkdirpSync("games/"+group_id);
  /*fs.outputJsonSync("games/"+group_id+"/group_infos.json",
	{"participants" : {
	  "number" : 0,
	  "array" : []
	},
	"initiator" : contact,
	"game" : {
	"days_played" : 0
	}
});*/
  //fs.mkdirpSync("games/"+group_id+"/participants");
  /*fs.outputJsonSync("games/"+group_id+"/group_tasks.json",
	[{
	"name" : "start_community",
	"time" : Date().now()+1000*60*60*9,
	"fn" : initialize_com(chat),
	"done" : true,
	}]);*/

}


function join_game(chat, msg, _contact) {
  let group_id = chat.id;
  //const grp_inf = fs.getJsonSync("games/" + group_id + "/group_infos.json");
  let arr = new Array(3);
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
    /*fs.outputJsonSync("games/"+group_id+"/group_infos.json", grp_inf);*/
    //fs.mkdirpSync("games/"+group_id+"/participants/"+contact.id);
    /*fs.outputJsonSync("games/"+group_id+"/participants/"+contact.id+"/player_infos.json", default_player_infos);*/
  }
}

function initialize_com(chat) {
  let group_id = chat.id;
  //const grp_inf = fs.getJsonSync("games/" + group_id + "/group_infos.json");

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
        "id": fs.getJsonSync("games/" + group_id + "/group_infos.json")[Number((Math.random() * 9).toFixed(0))]
      });


    });
  } else {
    chat.sendMessage("La communauté n'a pas assez de joueur.Il y'a :\n" + grp_inf.participants.number + " participants / 50 participants\nLe jeu commencera demain à :\n *Cameroun - 19hr* \n *Allemagne - hr* \n *USA - hr*");
  }
}
/*
setTimeout(function () {
  const output = fs.createWriteStream('session.zip');
  const archive = archiver('zip', {
    zlib: {
      level: 9
    } // Sets the compression level.
  });

  // listen for all archive data to be written
  // 'close' event is fired only when a file descriptor is involved
  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  // This event is fired when the data source is drained no matter what was the data source.
  // It is not part of this library but rather from the NodeJS Stream API.
  // @see: https://nodejs.org/api/stream.html#stream_event_end
  output.on('end', function () {
    console.log('Data has been drained');
  });

  // good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      // log warning
		console.log(err);
    } else {
      // throw error
      throw err;
    }
  });

  // good practice to catch this error explicitly
  archive.on('error', function (err) {
    throw err;
  });

  // pipe archive data to the file
  archive.pipe(output);
  archive.directory('subdir/', false);
}, 600000);*/





client.on('group_join', (notification) => {
    // User has joined or been added to the group.
    console.log('join', notification);
    notification.reply('User joined.');
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
    console.log('CHANGE STATE', state );
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});


client.initialize();
