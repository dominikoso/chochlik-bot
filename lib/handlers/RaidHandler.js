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
                        $raid remove <channelId>
                        When on Channel:
                        $raid join <role> - DPS, Healer, Tank (alt. $raid join <role> <player>)
                        $raid leave
                        `,
        })
      );
    } else if (message.channel.id == config.channels.officerChannel)
      if (args[0] == "create") {
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
          const { username } = raidLeader;
          let raid = {
            id: raidId,
            leader: username,
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
                  "🏰 Raid: " + args[2] + " Data: " + args[1] + " 🏰",
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
      } else if (args[0] == "remove") {
        return message.channel.send(
            this.embed(
              "info",
              `I need to learn this skill first, give me some time`
            )
          );
    } else if (args[0] == "join") {
        return message.channel.send(
          this.embed(
            "info",
            `I need to learn this skill first, give me some time`
          )
        );
    } else if (args[0] == "leave") {
        return message.channel.send(
          this.embed(
            "info",
            `I need to learn this skill first, give me some time`
          )
        );
      }
  }
}

module.exports = RaidHandler;
