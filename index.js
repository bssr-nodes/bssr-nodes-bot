global.config = require("./config.json");
//New global cache system (Lazy way)
global.users = [];

global.fs = require("fs");
global.chalk = require("chalk");
const nodemailer = require("nodemailer");
global.axios = require("axios");
global.transport = nodemailer.createTransport({
    host: config.Email.Host,
    port: config.Email.Port,
    auth: {
        user: config.Email.User,
        pass: config.Email.Password,
    },
});

// Initialising Node Checker
require("./nodestatsChecker");

//Discord Bot
const { Client, Intents, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');

global.fs = require("fs");
global.moment = require("moment");
global.db = require("quick.db");

global.userData = new db.table("userData"); //User data, Email, ConsoleID, Link time, Username, DiscordID
global.settings = new db.table("settings"); //Admin settings
global.webSettings = new db.table("webSettings"); //Web settings (forgot what this is even for)
global.domains = new db.table("linkedDomains"); //Linked domains for unproxy and proxy cmd
global.nodeStatus = new db.table("nodeStatus"); //Node status. Online or offline nodes
global.userPrem = new db.table("userPrem"); //Premium user data, Donated, Boosted, Total
global.nodeServers = new db.table("nodeServers"); //Server count for node limits to stop nodes becoming overloaded
global.codes = new db.table("redeemCodes"); //Premium server redeem codes...
global.lastBotClaim = new db.table("lastBotClaim"); //lastBotClaim
global.nodePing = new db.table("nodePing"); //Node ping response time

global.client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    ],
});

global.bot = client;
global.pollPingLastUsed = 0;

// Load and register commands
client.commands = new Collection();
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(config.DiscordBot.Token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(config.DiscordBot.clientID, config.DiscordBot.mainGuild),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

// Event handler
fs.readdir("./bot/discord/events/", (err, files) => {
    files = files.filter((f) => f.endsWith(".js"));
    files.forEach((f) => {
        const event = require(`./bot/discord/events/${f}`);
        client.on(f.split(".")[0], event.bind(null, client));
        delete require.cache[require.resolve(`./bot/discord/events/${f}`)];
    });
});

global.createList = {};
global.createListPrem = {};

//Import all create server lists
fs.readdir("./create-free/", (err, files) => {
    files = files.filter((f) => f.endsWith(".js"));
    files.forEach((f) => {
        require(`./create-free/${f}`);
    });
});

fs.readdir("./create-premium/", (err, files) => {
    files = files.filter((f) => f.endsWith(".js"));
    files.forEach((f) => {
        delete require.cache[require.resolve(`./create-premium/${f}`)];
        require(`./create-premium/${f}`);
    });
});

//Global password gen
const CAPSNUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
global.getPassword = () => {
    var password = "";
    while (password.length < 16) {
        password += CAPSNUM[Math.floor(Math.random() * CAPSNUM.length)];
    }
    return password;
};

//Handle interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

//Bot login
client.login(config.DiscordBot.Token);

setInterval(async () => {
    users.length = 0;
    axios({
        url: "https://panel.bssr-nodes.com/api/application/users?per_page=9999999999999",
        method: "GET",
        followRedirect: true,
        maxRedirects: 5,
        headers: {
            Authorization: "Bearer " + config.Pterodactyl.apikey,
            "Content-Type": "application/json",
            Accept: "Application/vnd.pterodactyl.v1+json",
        },
    })
        .then((resources) => {
            users.push(...resources.data.data);
        })
        .catch((err) => {

        });
}, 10 * 60 * 1000);

process.on("unhandledRejection", (reason, p) => {
    console.log("[antiCrash] :: Unhandled Rejection/Catch");
    console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
    console.log("[antiCrash] :: Uncaught Exception/Catch");
    console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log("[antiCrash] :: Uncaught Exception/Catch (MONITOR)");
    console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
    console.log("[antiCrash] :: Multiple Resolves");
    console.log(type, promise, reason);
});
