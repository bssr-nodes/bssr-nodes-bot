const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staff')
        .setDescription('Staff commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('code')
                .setDescription('Create a staff code')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The name of the code or "random" for a random code')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('uses')
                        .setDescription('Number of uses for the code')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('say')
                .setDescription('Make the bot say a message.')
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('The message for the bot to say')
                        .setRequired(true))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const subcommandPath = path.join(__dirname, 'staff', `${subcommand}.js`);

        if (fs.existsSync(subcommandPath)) {
            const command = require(subcommandPath);
            return command.execute(interaction);
        }

        await interaction.reply({ content: 'Subcommand not found', ephemeral: true });
    },
};
