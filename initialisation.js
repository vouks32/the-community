const db = require('./db.js');
const fs = require('fs');
db.con();

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
};


exports.default_player_infos = default_player_infos;

exports.start_community = function (chat, msg, _contact) {
  let group_id = chat.id;
  const grps = db.select("SELECT * FROM `com_grp_info` WHERE `grp_id` = ?", [group_id.id]);
  if (grps.length > 0) {
    msg.reply("Ce group est déjà dans une partie de *The Community*", group_id.id)
  } else {

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
    let grp_tsk = [{
      "name": "start_community",
      "time": Date().now() + 1000 * 60 * 60 * 9,
      "fn": "initialize_community",
      "done": true,
    }];

    db.insert("INSERT INTO `com_grp_info` (`id`, `grp_id`, `grp_info`, `grp_task`, `date_added`) VALUES (NULL, ?, ?, ?, CURRENT_TIMESTAMP)", [group_id.id, JSON.stringify(grp_inf), JSON.stringify(grp_tsk)]);

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


exports.join_game = function (chat, msg, _contact) {
  let group_id = chat.id;
  const grps = db.select("SELECT * FROM `com_grp_info` WHERE `grp_id` = ?", [group_id.id]);
  let grp_inf;
  if (grps.length > 0) {
    grp_inf = JSON.parse(grps[0].grp_info);
  } else {
    msg.reply("You must first start a partie buy sending *!start* to this group");
    return;
  }

  const ptpt_exist = db.select("SELECT * FROM `com_ptpts_info` WHERE `grp_id` = ? AND `ptpts_id` = ?", [group_id.id, contact.id._serialized]);

  if (ptpt_exist.length > 0) {
    msg.reply("Vous êtes déjà dans la partie!");
  } else {
    let player_info = default_player_infos;
    player_info.id = _contact.id._serialized;
    player_info.contact = _contact;

    grp_inf.participants.array.push(contact);
    grp_inf.participants.number += 1;

    db.update("UPDATE `com_grp_info` SET `grp_info` = ? WHERE `com_grp_info`.`grp_id` = ?", [JSON.stringify(grp_inf), group_id.id]);
    db.insert("INSERT INTO `com_ptpts_info` (`id`, `grp_id`, `ptpts_id`, `ptpts_info`, `date_added`) VALUES (NULL, ?, ?, ?, CURRENT_TIMESTAMP)", [group_id.id, _contact.id._serialized, JSON.stringify(player_info)]);

    msg.reply("Vous êtes désormais membre de la communauté!");
  }
}

exports.initialize_com = async function (chat) {
  let group_id = chat.id;
  const grps = db.select("SELECT * FROM `com_grp_info` WHERE `grp_id` = ?", [group_id.id]);
  let grp_inf;
  if (grps.length > 0) {
    grp_inf = JSON.parse(grps[0].grp_info);
  } else {
    msg.reply("You must first start a partie buy sending *!start* to this group");
    return;
  }
  grp_inf.structures = fs.getJsonSync("./_default-game-data/structures.json")
  let jobs = fs.getJsonSync("./_default-game-data/jobs.json");
  if (grp_inf.participants.number > 0) {
    let id = 0;
    let g = [1, 2, 7, 7, 5, 6];
    while (id < grp_inf.participants.array.length) {
      grp_inf.participants.array.sort(function (a, b) {
        return (Math.random() < 0.5) ? -1 : 1;
      });
      id++;
    }
    let participant_index = 1;
    grp_inf.participants.array.forEach(async function (_participant, key) {
      let _participant_profil = db.select("SELECT * FROM `com_ptpts_info` WHERE `grp_id` = ? AND `ptpts_id` = ?", [group_id.id, _participant.id._serialized]);

      /////////////////////////////////////////////////// infos ///////////////////////////////////
      _participant_profil.id = _participant.id._serialized;
      _participant_profil.contact = _participant;
      _participant_profil.game_name = get_random_name();
      _participant_profil.stats.money = Number((Math.random() * 3000).toFixed(0)) + 6500;
      _participant_profil.stats.joy = Number((Math.random() * 20).toFixed(0)) + 5;
      _participant_profil.stats.force = Number((Math.random() * 20).toFixed(0)) + 10;
      _participant_profil.stats.charisma = Number((Math.random() * 40).toFixed(0));
      _participant_profil.stats.intelligence = Number((Math.random() * 40).toFixed(0));
      _participant_profil.stats.experience = Number((Math.random() * 15).toFixed(0));
      /////////////////////////////////////////////////// talents ///////////////////////////////////////////::
      let talents = fs.getJsonSync("./_default-game-data/talents.json");
      i = talents.length * Math.random();
      if (i > talents.length - 1) {
        i = talents.length - 1;
      }
      _participant_profil.talents.push({
        "id": talents[i].id
      });
      ////////////////////////////////////////////////// jobs ////////////////////////////////////
      let hasjob = false;
      if (participant_index == 7 && grp_inf.structures[15].jobs[5].taken_positions < grp_inf.structures[15].jobs[5].available_positions) {
        _participant_profil.jobs = [{
          "job_id": 14,
          "structure_id": 15
        }];
        _participant_profil.diplomas = [{
          "diploma_id": 5,
          "level": 0
        }];
        grp_inf.structures[15].jobs[5].taken_positions++;
        hasjob = {
          "job_id": 14,
          "structure_id": 15,
          "diploma_id": 5
        };

      } else if (participant_index == 11 && grp_inf.structures[0].boss_job.taken_positions < grp_inf.structures[0].boss_job.available_positions) {
        _participant_profil.jobs = [{
          "job_id": 12,
          "structure_id": 0
        }];
        grp_inf.structures[0].boss_job.taken_positions++;
        hasjob = {
          "job_id": 12,
          "structure_id": 0,
          "diploma_id": null
        };

      } else if (participant_index == 15 && grp_inf.structures[0].boss_job.taken_positions < grp_inf.structures[0].boss_job.available_positions) {
        _participant_profil.jobs = [{
          "job_id": 19,
          "structure_id": 6
        }];
        grp_inf.structures[6].boss_job.taken_positions++;
        hasjob = {
          "job_id": 19,
          "structure_id": 6,
          "diploma_id": null
        };

      } else {
        let rand_struct = Math.random() * (grp_inf.structures.length);
        if (rand_struct > grp_inf.structures.length - 1) {
          rand_struct = null;
        }
        let rand_job = Math.random() * grp_inf.structures[rand_struct].jobs.length;
        if (rand_job > grp_inf.structures[rand_struct].jobs.length - 1) {
          rand_job = null;
        }

        if (rand_struct != null) {
          if (rand_job != null && grp_inf.structures[rand_struct].jobs[rand_job].taken_positions < grp_inf.structures[rand_struct].jobs[rand_job].available_positions) {
            _participant_profil.jobs = [{
              "job_id": grp_inf.structures[rand_struct].jobs[rand_job].job_id,
              "structure_id": rand_struct
            }];
            grp_inf.structures[rand_struct].jobs[rand_job].taken_positions++;
            hasjob = {
              "job_id": grp_inf.structures[rand_struct].jobs[rand_job].job_id,
              "structure_id": rand_struct,
              "diploma_id": null
            };
            let job_inf = jobs[grp_inf.structures[rand_struct].jobs[rand_job].job_id];
            if (job_inf.diplomes[0].requis == true) {
              _participant_profil.diplomas = [{
                "diploma_id": job_inf.diplomes[0].id,
                "level": 0
              }];
              hasjob.diploma_id = job_inf.diplomes[0].id;
            }

          } else if (grp_inf.structures[rand_struct].boss_job.taken_positions < grp_inf.structures[rand_struct].boss_job.available_positions) {
            _participant_profil.jobs = [{
              "job_id": grp_inf.structures[rand_struct].boss_job.job_id,
              "structure_id": rand_struct
            }];
            grp_inf.structures[rand_struct].boss_job.taken_positions++;
            hasjob = {
              "job_id": grp_inf.structures[rand_struct].boss_job.job_id,
              "structure_id": rand_struct,
              "diploma_id": null
            };
            let job_inf = jobs[grp_inf.structures[rand_struct].boss_job.job_id];
            if (job_inf.diplomes[0].requis == true) {
              _participant_profil.diplomas = [{
                "diploma_id": job_inf.diplomes[0].id,
                "level": 0
              }];
              hasjob.diploma_id = job_inf.diplomes[0].id;
            }
          }
        }

      }
      _participant_profil.possessions = [{
        "id": 0
      }];
      let message = "Bienvenue dans la Communauté\nUne grande avanture en perspective!\n\nOh! Au faite, vous êtes au chommage.";
      if (hasjob == false) {
        message += " Vous feriez mieux de décrocher un diplome et de trouver un travail.\n"
      } else {

        message += " Je plaisante!\nVous travaillez à/au *" + grp_inf.structures[hasjob.structure_id].name + "* au poste de *" + jobs[hasjob.job_id] + "*\n";
      }
		let chat = await _participant.getChat();
      client.sendMessage(chat.id.id, message);
      message = "Voici vos *stats* de la journée :\nArgent : *" + _participant_profil.stats.money + "*\nJoie : *" + _participant_profil.stats.joy + "*\nForce : " + _participant_profil.stats.force + "\nCharisme : *" + _participant_profil.stats.charisma + "*\nIntelligence : "
      _participant_profil.stats.intelligence + "\nExperience : *" + _participant_profil.stats.experience + "*\nGrade Communautaire : *" + _participant_profil.stats.com_grade + "*";
		
      client.sendMessage(chat.id.id, message);

      db.update("UPDATE `com_ptpts_info` SET `ptpts_info` = ? WHERE `com_ptpts_info`.`ptpts_id` = ?", [JSON.stringify(_participant_profil), _participant.id._serialized]);
      participant_index++;
    });
  } else {
    chat.sendMessage("La communauté n'a pas assez de joueur.Il y'a :\n" + grp_inf.participants.number + " participants / 50 participants\nLe jeu commencera demain à :\n *18hr-UTC (19hr-Cameroun)* ");
  }
}

function get_random_name() {
  let male_names = [
    ["pigy", "Pépa"],
    ["Olou", "Month"],
    ["lumière", "Céleste"],
    ["Peppa", "Piggy"],
    ["Verre", "Terra"],
    ["Akono", "Lingo"],
    ["Etabi", "Seman"],
    ["Colan", "Tah"],
    ["Shiki", "Takah"],
    ["Pompi", "Dou"],
    ["Mastu", "Bastion"],
    ["Amini", "Stration"],
    ["Onda", "Standin"],
    ["Respon", "Sibel"],
    ["Préo", "Cupat"],
    ["Conste", "Lation"]
  ];
  let i = Number((Math.random() * male_names.length).toFixed(0));
  if (i > male_names.length - 1) {
    i = male_names.length - 1;
  }
  return male_names[i][0] + " " + male_names[i][1];
}
