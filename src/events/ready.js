const Discord = require("discord.js");
const Chalk = require("chalk");
const { exec } = require("child_process");
const Util = require('util');
const execPromise = Util.promisify(exec);
const axios = require('axios');
const { transferServer } = require('./transfer.js');

const ServerStatus = require("../serverStatus.js");
const Config = require('../../config.json');
const MiscConfigs = require('../../config/misc-configs.js');

/**
 * @param {Discord.Client} client 
 */
module.exports = async (client) => {
    const guild = client.guilds.cache.get(Config.DiscordBot.MainGuildId);

    console.log(
        Chalk.magenta("[DISCORD] ") + Chalk.green(client.user.username + " has logged in!"),
    );

    guild.channels.cache
    .filter((x) => x.parentId === MiscConfigs.accounts && Date.now() - x.createdAt.getTime() > 30 * 60 * 1000)
    .forEach((x) => x.delete());

    client.cooldown = {};

    setInterval(async () => {
        try {
            const { stdout } = await execPromise('git pull');
    
            if (!stdout.includes("Already up to date.")) {
                await client.channels.cache
                    .get(MiscConfigs.github)
                    .send(
                        `<t:${Math.floor(Date.now() / 1000)}:f> Automatic update from GitHub, pulling files.\n\`\`\`${stdout}\`\`\``,
                    );
                setTimeout(() => {
                    process.exit();
                }, 5000);
            }
        } catch (Error) {
            console.error("Error during Git pull:", Error);
        }
    }, 30 * 1000);

    setInterval(() => {
        client.user.setPresence({
            activities: [{ name: 'over BSSR Nodes', type: Discord.ActivityType.Watching }],
            status: 'online',
        });
    }, 1000 * 60);

    if (true) {
        console.log(Chalk.magenta("[NODE CHECKER] ") + Chalk.greenBright("Enabled"));
        await ServerStatus.startNodeChecker();

        const channel = client.channels.cache.get(MiscConfigs.nodestatus);
        setInterval(async () => {
            const embed = await ServerStatus.getEmbed();

            let messages = await channel.messages.fetch({ limit: 10 });
            messages = messages.filter((x) => x.author.id === client.user.id).last();

            if (messages == null) channel.send({embeds: [embed]});
            else messages.edit({embeds: [embed]});
        }, 30 * 1000);
    } else {
        console.log(Chalk.magenta("[NODE CHECKER] ") + Chalk.redBright("Disabled"));
    }

    setInterval(async () => {
        try {
            const { data } = await axios.get(`${Config.Pterodactyl.hosturl}/api/application/servers`, {
                headers: {
                    Authorization: `Bearer ${Config.Pterodactyl.apikey}`,
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                },
            });

            const testServerID = '37';

            data.data.forEach(async (server) => {
                const serverID = server.attributes.id;
                const nodeID = server.attributes.node;

                if (serverID !== testServerID) return;

                console.log(`Checking server ${serverID}...`);

                if (nodeID === '2') {
                    const user = await userData.get({ where: { consoleID: serverID } });

                    if (user && !user.isWhitelisted) {
                        console.log(`Server ${serverID} is on the private node and the user is not whitelisted, initiating transfer.`);
                        await transferServer(client, serverID);
                    } else {
                        console.log(`Server ${serverID} is on the private node, but the user is whitelisted.`);
                    }
                }
            });
        } catch (error) {
            console.error("Error fetching servers from Pterodactyl API:", error);
        }
    }, 30 * 60 * 1000); // Every 30 minutes
};