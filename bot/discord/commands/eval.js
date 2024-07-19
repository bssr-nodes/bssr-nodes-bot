const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Evaluates JavaScript code.')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('The code to evaluate')
                .setRequired(true)),
    async execute(interaction) {
        const authorizedUsers = ["569352110991343616", "1131236182899052696", "871722786006138960", "1080213687073251461"];
        const userId = interaction.user.id;

        const responses = [
            "SyntaxError: Unexpected token F in JSON at position 420",
            "SyntaxError: Unexpected token L in JSON at position 69",
            "SyntaxError: Unexpected identifier",
            "UnhandledPromiseRejectionWarning: DiscordAPIError: Missing Permissions",
            "TypeError: Cannot read property 'messages' of undefined",
            "UnhandledPromiseRejectionWarning: MongoError: bad auth: Authentication failed.",
            `TypeError: Cannot read property '${interaction.options.getString('code')}' of undefined`,
            "Uncaught LogicError: You don't smell like a bot admin",
            "TypeError: Cannot read property 'skill issue'. Property 'skill issue' undefined.",
            "Uncaught (in promise): Can't promise about this"
        ];

        if (!authorizedUsers.includes(userId)) {
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            return interaction.reply({ content: randomResponse, ephemeral: false });
        }

        const code = interaction.options.getString('code');
        let evaled;

        try {
            evaled = eval(code);

            if (typeof evaled !== "string") {
                evaled = require('util').inspect(evaled, { depth: 0 });
            }

            if (evaled.length > 2000) {
                fs.writeFileSync('eval.txt', evaled);
                return interaction.reply({ content: 'Output too long, logged to eval.txt', files: ['eval.txt'], ephemeral: false });
            }

            const evalEmbed = new MessageEmbed()
                .setAuthor(`Eval by ${interaction.user.tag}`, 'https://cdn.discordapp.com/emojis/314405560701419520.png')
                .setDescription(`**:inbox_tray: Input:**\n\`\`\`js\n${code}\`\`\``)
                .addField('\u200B', `**:outbox_tray: Output:**\n\`\`\`js\n${evaled}\`\`\``)
                .setColor(0x00ff00)
                .setFooter(`${Date.now() - interaction.createdTimestamp}ms`);

            interaction.reply({ embeds: [evalEmbed], ephemeral: false });

        } catch (err) {
            const errorEmbed = new MessageEmbed()
                .setAuthor(`Eval by ${interaction.user.tag}`, 'https://cdn.discordapp.com/emojis/314405560701419520.png')
                .setDescription(`**:inbox_tray: Input:**\n\`\`\`js\n${code}\`\`\``)
                .addField('\u200B', `**:outbox_tray: Output:**\n\`\`\`js\n${err}\`\`\``)
                .setColor(0xff0000)
                .setFooter(`${Date.now() - interaction.createdTimestamp}ms`);

            interaction.reply({ embeds: [errorEmbed], ephemeral: false });
        }
    },
};
