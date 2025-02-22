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

    async function regenerateSSL() {
        async function getToken(Url, Email, Password) {
            const serverRes = await Axios({
                url: Url + "/api/tokens",
                method: "POST",
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    "Content-Type": "application/json",
                },
                data: {
                    identity: Email,
                    secret: Password,
                },
            });
        
            const token = "Bearer " + serverRes.data.token;
        
            return token;
        }

        const token = await getToken(
            Config.Proxy1.url,
            Config.Proxy1.email,
            Config.Proxy1.password
        );
        console.log("🔄 Regenerating SSL certificates for all hosts...");
    
        try {
            const hosts = await axios({
                url: `${Config.Proxy1.url}/nginx/proxy-hosts`,
                method: "GET",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json"
                }
            });
    
            const hostData = hosts.data.filter(
                host => host.ssl.enabled && host.domain !== "proxy.bssr-nodes.com"
            );
    
            if (hostData.length === 0) {
                console.log("⛔ No hosts with SSL certificates found.");
                return;
            }
    
            for (let host of hostData) {
                console.log(`🔄 Regenerating SSL certificate for ${host.domain} (ID: ${host.id})`);
                try {
                    const response = await axios({
                        url: `${Config.Proxy1.url}/nginx/certificates/generate`,
                        method: "POST",
                        headers: {
                            Authorization: token,
                            "Content-Type": "application/json"
                        },
                        data: {
                            id: host.id,
                            provider: "letsencrypt"
                        }
                    });
    
                    if (response.data.error) {
                        console.log(`⛔ Error regenerating SSL for ${host.domain}: ${response.data.error}`);
                        await notifyUserFailure(host.domain);
                    } else {
                        console.log(`✅ SSL certificate regenerated for ${host.domain}`);
                    }
                } catch (error) {
                    console.error(`⛔ Error during SSL renewal for ${host.domain}:`, error.response?.data || error.message);
                    await notifyUserFailure(host.domain);
                }
            }
        } catch (error) {
            console.error("Error fetching proxy hosts:", error.response?.data || error.message);
        }
    }
    
    async function notifyUserFailure(domain) {
        const users = await userData.all();
    
        for (let user of users) {
            for (let userDomain of user.value.domains) {
                if (userDomain.domain === domain) {
                    try {
                        const discordUser = await client.users.fetch(user.value.discordID);
                        await discordUser.send(
                            `🚨 **SSL Certificate Renewal Failed!** 🚨\n` +
                            `The SSL certificate for your domain **${domain}** failed to renew automatically.\n` +
                            `To renew manually, please run the following command in the Discord server:\n\n` +
                            `\`!user renew ${domain}\`\n\n` +
                            `If you need further assistance, please contact support!`
                        );
                        console.log(`📩 Notified user ${user.value.discordID} about failure for ${domain}`);
                    } catch (err) {
                        console.error(`⛔ Failed to send DM to ${user.value.discordID}:`, err.message);
                    }
                }
            }
        }
    }
    

    setInterval(regenerateSSL, 30 * 24 * 60 * 60 * 1000);
})();