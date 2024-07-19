const { Client, Intents, Collection } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

// Global variables
global.config = require("./config.json");
global.users = [];
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

// Discord bot setup
global.client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.MESSAGE_CONTENT,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

global.client.commands = new Collection();
const commands = [];

// Function to handle loading commands
function loadCommands(directory) {
    // Get all entries in the current directory
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            // Recursively process subdirectories
            loadCommands(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            // Process .js files
            try {
                const command = require(fullPath);

                // Check if the command has 'data' property indicating it's a slash command
                if (command.data && command.data.name) {
                    client.commands.set(command.data.name, command);
                    commands.push(command.data.toJSON());
                } else {
                    console.error(`Command in ${fullPath} is missing the 'data' property or 'name' property.`);
                }
            } catch (error) {
                console.error(`Failed to load command from ${fullPath}:`, error);
            }
        } else {
            console.error(`Skipped non-JS file or non-directory entry: ${fullPath}`);
        }
    }
}

// Start loading commands from the base directory
const baseDirectory = path.resolve('./bot/discord/commands');
loadCommands(baseDirectory);

// Register slash commands
client.once('ready', async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await client.application?.commands.set(commands);

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
    console.log(`${client.user.tag} is logged in!`);
});

// Command handling
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

// Bot login
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
