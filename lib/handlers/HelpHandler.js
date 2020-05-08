const Handler = require("./BaseHandler");
const config = require("../../config.json");

class HelpHandler extends Handler {
    async handle(message) {
        const channel = await message.guild.channels.cache.get(
          config.channels.officerChannel
        );

    if ( message.channel.id == config.channels.officerChannel ){
        return message.channel.send(
            this.embed(
              "info",
              "⚔️ Commands ⚔️",
              {
                title: "Command me Masters",
                content: `        
              $help - explains usage
              $debug - show debug status`
              }
            )
          );
        } else {
            return message.channel.send(
                this.embed(
                  "info",
                  "⚔️ Commands ⚔️",
                  {
                    title: "I only can be commanded from my Masters base",
                    content: `Commands works only at ${channel}`
                  }
                )
              );
        }
    }
}

module.exports = HelpHandler;