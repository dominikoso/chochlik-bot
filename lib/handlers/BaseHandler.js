const Discord = require("discord.js");

class Handler {
    constructor(db, client) {
      this.db = db;
      this.client = client;
    }
    
    tokenize(text) {
        return text.trim().split(" ");
    }
    
    notFound(message, args) {
        return message.reply(`There's no \`${args[0]}\` command!`);
    }

    embed(status, title, ...fields) {
        const embed = new Discord.MessageEmbed().setTitle(title);
    
        for (const field of fields) {
          embed.addField(field.title, field.content);
        }
    
        switch (status) {
          case "success":
            embed.setColor("#00cc00");
            break;
    
          case "error":
            embed.setColor("#cc0000");
            break;
    
          case "info":
            embed.setColor("#0000cc");
            break;
    
          default:
            break;
        }
    
        return embed;
    }
}

module.exports = Handler;