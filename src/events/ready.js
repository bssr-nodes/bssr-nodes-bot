const Discord = require("discord.js");
const Chalk = require("chalk");
const { exec } = require("child_process");
const Util = require('util');
const execPromise = Util.promisify(exec);
const axios = require('axios');

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

};