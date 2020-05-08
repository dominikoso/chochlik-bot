const Handler = require("./BaseHandler");
const config = require("../../config.json");

class DebugHandler extends Handler {
    async handle(message){
        if (message.channel.id == config.channels.officerChannel){
            return message.channel.send(
                this.embed("info", `My masters, debug mode is ${config.debug}`)
              );
        } else {
            return message.channel.send(
                this.embed("info", `Masters forbid me from telling you, fools`)
              );
        }
    }
}

module.exports = DebugHandler;