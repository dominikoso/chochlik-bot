const Keyv = require("keyv");
const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();
const { Chochlik } = require("./lib/bot");

const keyv = new Keyv(config.db);
const chochlik = new Chochlik(keyv, client);

client.login(config.token);


client.on('ready', async () => {

    client.user.setStatus("online");
    await client.user.setPresence({
      game: {
        name: "$help to show help",
        type: "STREAMING"
      }
  
  });
  const officer = client.channels.resolve(config.channels.officerChannel);
  //officer.send("Summoning Successed");
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async message => {
    if (message.content.startsWith(config.prefix) && !message.author.bot) {
      await chochlik.handle(message);
    }
});

process.on("SIGINT", async () => {  
    const officer = client.channels.resolve(config.channels.officerChannel);
    officer.send("Unsummoning Successed");
    process.exit();
});
