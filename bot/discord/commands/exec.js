const { SlashCommandBuilder } = require('@discordjs/builders');
const { exec } = require('child_process');
const { EmbedBuilder } = require('discord.js');
const stripAnsi = require('strip-ansi');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('exec')
        .setDescription('Executes a shell command.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The shell command to execute')
                .setRequired(true)
        ),
    async execute(interaction) {
        const command = interaction.options.getString('command');
        const authorizedUsers = ["569352110991343616", "1131236182899052696", "871722786006138960", "1080213687073251461"];

        if (!authorizedUsers.includes(interaction.user.id)) {
            return interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: false });
        }

        exec(command, (error, stdout) => {
            let response = error ? error.message : stdout;

            // Strip ANSI escape codes from the response
            response = stripAnsi(response);

            if (response.length > 4000) {
                console.log(response);
                response = "Output too long.";
            }

            const embed = new EmbedBuilder()
                .setDescription("```" + response + "```")
                .setTimestamp()
                .setColor("#000000");

            interaction.reply({ embeds: [embed] });
        });
    },
};
