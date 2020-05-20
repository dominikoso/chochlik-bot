const Handler = require("./BaseHandler");
const config = require("../../config.json");

class RaidHandler extends Handler {
  async handle(message) {
    const channel = await message.guild.channels.cache.get(
      config.channels.officerChannel
    );
    const args = message.content.slice(config.prefix.length).split(" ");
    const command = args.shift().toLowerCase();

    if (!args.length) {
      return message.channel.send(
        this.embed("error", "🏰 Raid Management 🏰", {
          title: "Unknown command, Master",
          content: `Avaliable Commands:
                        $raid create <date> <raidName> <raidLeader>
                        When on Channel:
                        $raid join <role> - DPS, Healer, Tank (alt. $raid join <role> <player>)
                        $raid leave (alt. $raid leave <player>)
                        `,
        })
      );
    } else if (message.channel.id == config.channels.officerChannel) {
      if (args[0] == "create") {
        this.createRaid(message, args);
      } 
    } else {
      let raids = await this.db.get("raids");
      let isInRaid = false;
      let raidEvent;
      for (let raid of Array.from(raids)){
        if (raid.id == message.channel.id){
          raidEvent = raid;
          isInRaid = true;
          break;
        }
      }
      if (isInRaid) {
        if (args[0] == "join") {
          this.joinRaid(message, args, raidEvent);
    
        } else if (args[0] == "leave") {
          this.leaveRaid(message, args, raidEvent);
        }
      }else{
        return message.channel.send(this.embed("error", `This command can be only used in raid management channel!`));
      }
    }

  }

  async createRaid(message, args){
    if (args.length < 2) {
      return message.channel.send(
        this.embed("error", "🏰 Raid Management 🏰", {
          title: "Raid date is missing",
          content: `Correct usage $raid create <date> <raidName> <raidLeader>`,
        })
      );
    } else if (args.length < 3) {
      return message.channel.send(
        this.embed("error", "🏰 Raid Management 🏰", {
          title: "Raid name is missing",
          content: `Correct usage $raid create <date> <raidName> <raidLeader>`,
        })
      );
    } else if (args.length < 4) {
      return message.channel.send(
        this.embed("error", "🏰 Raid Management 🏰", {
          title: "Raid leader is missing",
          content: `Correct usage $raid create <date> <raidName> <raidLeader>`,
        })
      );
    } else {
      let raidId;
      await message.guild.channels
        .create("🏰 " + `${args[1]}-${args[2]}`, {
          type: "text",
          parent: config.categories.eventsList,
        })
        .then((createdChannel) => {
          raidId = createdChannel.id;
          //console.log(createdChannel.id);
        })
        .catch();

      let raidLeader = message.mentions.users.first();
      let raids = await this.db.get("raids");
      //console.log(`Channel Id: ${raidId}`);
      if (!raids) {
        raids = [];
      }
      const { id, username } = raidLeader;
      let raid = {
        id: raidId,
        leader: username,
        leaderId: id,
        date: args[1],
        name: args[2],
        members: [],
      };

      raids.push(raid);
      this.db.set("raids", raids);
      this.client.channels
        .fetch(raidId)
        .then((ch) => {
          ch.send(
            this.embed(
              "success",
              "🏰 Raid: " + args[2] + " Date: " + args[1] + " 🏰",
              {
                title: `Raid Leader: ${username}`,
                content: `
                    DPS:

                    Tank:

                    Healer:

                    `,
              }
            )
          );
          ch.send(
            `<@&${config.ranks.member}> - Please register using $raid join <role>`
          );
        })
        .catch((r) => console.log(`Err ${r}`));
    }
  }

  async joinRaid(message, args, raidEvent){

    if (args.length < 2) {
      return message.channel.send(
        this.embed("error", "🏰 Raid Join 🏰", {
          title: "You need to specify a role",
          content: `Correct usage $raid join <role>`,
        })
      );
    }else if (args.length == 3) {
      if (message.author.id != raidEvent.leaderId){
        console.log(raidEvent.leaderId);
        return message.channel.send(this.embed("error", `Only Leader of Raid may add people manualy`))
      }else if(typeof message.mentions.users.first() == "undefined") {
        return message.channel.send(
          this.embed("error", "🏰 Raid Member Management 🏰", {
            title: "You need to specify member of Raid, Leader",
            content: `Correct usage $raid join <role> <player>`,
          })
        );
      }else if (!args[1].toUpperCase().match(/^TANK$|^HEAL$|^DPS$/g)) {
        return message.channel.send(
          this.embed("error", "🏰 Raid Member Management 🏰", {
            title: `There is no such a role like ${args[1]}`,
            content: `You must select from **DPS**, **Tank** or **Heal**`,
          })
        );
      }else{
        for (let user of Array.from(raidEvent.members)){
          if (message.mentions.users.first().id == user.id){
            return message.channel.send(this.embed("error", `This player is already part of Raid`))
          }
        }

        let member = {
          id: message.mentions.users.first().id,
          role: args[1].toUpperCase()
        }
        this.addRaidMember(message, member, raidEvent);
        return message.channel.send(
          this.embed("success", "🏰 Raid Member Management 🏰", {
            title: `Player was successfuly added to Raid`,
            content: `<@${member.id}> joined the Raid, Good Luck`,
          })
        );

      }
    

    }else if (!args[1].toUpperCase().match(/^TANK$|^HEAL$|^DPS$/g)) {
      return message.channel.send(
        this.embed("error", "🏰 Raid Join 🏰", {
          title: `There is no such a role like ${args[1]}`,
          content: `You must select from **DPS**, **Tank** or **Heal**`,
        })
      );
    }else{
      for (let user of Array.from(raidEvent.members)){
        if (message.author.id == user.id){
          return message.channel.send(this.embed("error", `You are already part of this raid, You Fool!`))
        }
      }

      let member = {
        id: message.author.id,
        role: args[1].toUpperCase()
      }

      this.addRaidMember(message, member, raidEvent);
      return message.channel.send(this.embed("success", "You joined raid, good luck"))

    }
  }
  
  async leaveRaid(message, args, raidEvent){
    if (args.length == 2){
      if (message.author.id != raidEvent.leaderId){
        console.log(raidEvent.leaderId);
        return message.channel.send(this.embed("error", `Only Leader of Raid may remove people manualy`))
      }else if(typeof message.mentions.users.first() == "undefined") {
        return message.channel.send(
          this.embed("error", "🏰 Raid Member Management 🏰", {
            title: "You need to specify member of Raid, Leader",
            content: `Correct usage $raid leave <player>`,
          })
        );
      }else{
        if(await this.removeRaidMember(message, message.mentions.users.first().id, raidEvent)){
          return message.channel.send(
            this.embed("success", "🏰 Raid Member Management 🏰", {
              title: "Player was successfuly removed from raid",
              content: `<@${message.mentions.users.first().id}> left the Raid, Thankfuly`,
            })
          );
        }else{
          return message.channel.send(this.embed("error", `This player is not a part of a raid, Leader`));
        }
      }
    }
    if(await this.removeRaidMember(message, message.author.id, raidEvent)){
      return message.channel.send(this.embed("success", "You left raid, pathetic"))
    }else{
      return message.channel.send(this.embed("error", `You are not part of this raid, You Fool!`));
    }
  }


  async regenerateRaidMessage(message, raidEvent){
      let dps = [];
      let tank = [];
      let heal = [];

      for (let member of Array.from(raidEvent.members)){
        if (member.role == "DPS"){
          dps.push(`<@${member.id}>\n`);
        }else if (member.role == "TANK"){
          tank.push(`<@${member.id}>\n`);
        }else if (member.role == "HEAL"){
          heal.push(`<@${member.id}>\n`);
        }
      }

      const embded = this.embed(
        "success",
        "🏰 Raid: " + raidEvent.name + " Date: " + raidEvent.date + " 🏰",
        {
          title: `Raid Leader: ${raidEvent.leader}`,
          content: `
              DPS (${dps.length}): 
              ${dps.toString().replace(/,/g, "")}
              Tank (${tank.length}):
              ${tank.toString().replace(/,/g, "")}
              Healer (${heal.length}):
              ${heal.toString().replace(/,/g, "")}
              `,
        }
      );

    message.channel.messages.fetch().then(msg => {
      const fetchedMsg = msg.last();
      fetchedMsg.edit(embded);
    });
  }

  async addRaidMember(message, member, raidEvent){
    raidEvent.members.push(member);
    let raids = await this.db.get("raids");
    var foundIndex = raids.findIndex(x => x.id == raidEvent.id);
    raids[foundIndex] = raidEvent;
    await this.db.set("raids", raids);

    this.regenerateRaidMessage(message, raidEvent);
  }

  async removeRaidMember(message, memberId, raidEvent){
    let isPartOfRaid = false;
    for (let user of Array.from(raidEvent.members)){
      if (memberId == user.id){
        isPartOfRaid = true;
        break;
      }
    }
    if(isPartOfRaid){
      for (var i = 0; i < raidEvent.members.length; i++){
        if (memberId == raidEvent.members[i].id){
          raidEvent.members.splice(i, 1);
          break;
        }
      }

      let raids = await this.db.get("raids");
      var foundIndex = raids.findIndex(x => x.id == raidEvent.id);
      raids[foundIndex] = raidEvent;
      await this.db.set("raids", raids);

      this.regenerateRaidMessage(message, raidEvent);
      return true;
      

    }else{
      return false;
    }
  }

  async wipRaid(){
    return message.channel.send(
      this.embed(
        "info",
        `I need to learn this skill first, give me some time`
      )
    );
  }
  
}

module.exports = RaidHandler;
