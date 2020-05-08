const {
    HelpHandler,
    DebugHandler,
    RaidHandler
} = require("./handlers")

class Chochlik {
    constructor(db, client) {
        this.helpHandler = new HelpHandler(db, client);
        this.handlers = {
            "$debug": new DebugHandler(db, client),
            "$raid": new RaidHandler(db, client)
        };
    }

    handle(message) {
        for (const cmd in this.handlers) {
            if (message.content.startsWith(cmd)) {
              const handler = this.handlers[cmd];
              return handler.handle(message);
            }
          }

        this.helpHandler.handle(message);
    }
}

module.exports = {
    Chochlik
};