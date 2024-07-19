const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const commands = {
    Users: {
        user: "See help for that command.",
        server: "See help for that command.",
        ping: "Shows the bots ping.",
        ticket: "Create a ticket for help from the staff team!",
        uptime: "Shows the bots uptime.",
        help: "Brings up this menu.",
    },
    Staff: {
        staff: "See help for that command."
    },
    Owner: {
        eval: "Eval some code.",
        exec: "Run some system commands.",
        restart: "Restarts the bot. What else would you expect?",
    },
};

let desc = (object) => {
    let description = [];
    let entries = Object.entries(object);
    for (const [command, desc] of entries) {
        description.push(`**${config.DiscordBot.Prefix}${command}** - ${desc}`);
    }
    return description;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays the help menu with available commands.'),
    async execute(interaction) {
        const member = interaction.member;
        
        let embed = new MessageEmbed()
            .setColor('BLUE')
            .addField(`__**Users:**__ (${Object.entries(commands.Users).length})`, desc(commands.Users).join('\n'));

        if (member.roles.cache.has('1250045509868195840')) {
            embed.addField(
                `__**Staff Commands:**__ (${Object.entries(commands.Staff).length})`,
                desc(commands.Staff).join('\n')
            );
        }

        if (member.roles.cache.has('1247882619602075749')) {
            embed.addField(
                `__**Developer Commands:**__ (${Object.entries(commands.Owner).length})`,
                desc(commands.Owner).join('\n')
            );
        }

        await interaction.reply({ embeds: [embed], ephemeral: false });
    },
};
