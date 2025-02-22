;(async () => {
    const fs = require("fs");
    const { QuickDB, MySQLDriver } = require("quick.db");
    const Discord = require("discord.js");
    const axios = require("axios");
    const { exec } = require("child_process");

    const Config = require("./config.json");

    //Starting MySQL Database, and global tables.
    const mysqlDriver = new MySQLDriver({
        host: Config.database.host,
        port: Config.database.port,
        user: Config.database.user,
        password: Config.database.pass,
        database: Config.database.db,
    });

    await mysqlDriver.connect();
    const db = new QuickDB({ driver: mysqlDriver });

    global.moment = require("moment");
    global.userData = db.table("userData"); //User data, Email, ConsoleID, Link time, Username, DiscordID
    global.nodeStatus = db.table("nodeStatus"); //Node status. Online or offline nodes
    global.userPrem = db.table("userPrem"); //Premium user data, Donated, Boosted, Total
    global.codes = db.table("redeemCodes"); //Premium server redeem codes...
    global.nodePing = db.table("nodePing"); //Node ping response time
    global.nodeStatus = db.table("nodeStatus"); //Status of the Node.
    global.nodeServers = db.table("nodeServers"); //Counts of servers on each Node.

    process.on("unhandledRejection", (Error) => console.log(Error));

    //Discord Bot:
    const client = new Discord.Client({
        intents: [
            Discord.GatewayIntentBits.Guilds,
            Discord.GatewayIntentBits.GuildMembers,
            Discord.GatewayIntentBits.GuildModeration,
            Discord.GatewayIntentBits.GuildIntegrations,
            Discord.GatewayIntentBits.GuildPresences,
            Discord.GatewayIntentBits.GuildMessages,
            Discord.GatewayIntentBits.GuildMessageReactions,
            Discord.GatewayIntentBits.GuildMessageTyping,
            Discord.GatewayIntentBits.DirectMessages,
            Discord.GatewayIntentBits.DirectMessageReactions,
            Discord.GatewayIntentBits.DirectMessageTyping,
            Discord.GatewayIntentBits.MessageContent
        ],
        partials: [
            Discord.Partials.Channel,
            Discord.Partials.Message,
            Discord.Partials.Reaction
        ]
    });

    //Event Handler.
    fs.readdir("./src/events/", (err, files) => {
        if (err) {
            console.error('Error reading event files:', err);
            return;
        }
        
        files = files.filter((f) => f.endsWith(".js"));
        files.forEach((f) => {
            const event = require(`./src/events/${f}`);
            
            if (typeof event === 'function') {
                client.on(f.split(".")[0], event.bind(null, client));
            } else {
                console.error(`Event file ${f} does not export a function.`);
            }
    
            delete require.cache[require.resolve(`./src/events/${f}`)];
        });
    });
    
    //Server Creation:
    await require('./createData.js').initialStart();

    client.login(Config.DiscordBot.Token);
})();