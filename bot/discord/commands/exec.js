const { SlashCommandBuilder } = require('@discordjs/builders');
const { exec } = require('child_process');
const { EmbedBuilder } = require('discord.js');

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
        const authorizedUsers = ["569352110991343616", "1131236182899052696", "871722786006138960", "1080213687073251461", "716761186812821604"];

        if (!authorizedUsers.includes(interaction.user.id)) {
            return interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: false });
        }

        // Dynamically import strip-ansi
        const stripAnsi = (await import('strip-ansi')).default;

        exec(command, (error, stdout, stderr) => {
            let response = error ? stderr : stdout;

            // Strip ANSI codes from the response
            response = stripAnsi(response);

            // Function to send the response in chunks if it exceeds Discord's message limit
            const sendChunks = async (content) => {
                const chunks = content.match(/[\s\S]{1,2000}/g) || [];
                for (const chunk of chunks) {
                    await interaction.followUp({ content: "```\n" + chunk + "\n```" });
                }
            };

            if (response.length > 2000) {
                sendChunks(response);
            } else {
                const embed = new EmbedBuilder()
                    .setDescription("```\n" + response + "\n```")
                    .setTimestamp()
                    .setColor("#000000");

                interaction.reply({ embeds: [embed] });
            }
        });
    },
};
