const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('User commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('new')
                .setDescription('Create a new account')
                .addStringOption(option => 
                    option.setName('username')
                        .setDescription('Your desired username (no spaces or special characters)')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('email')
                        .setDescription('Your valid email address')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unlink')
                .setDescription('Unlink your panel account')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const subcommandPath = path.join(__dirname, 'user', `${subcommand}.js`);

        if (fs.existsSync(subcommandPath)) {
            const command = require(subcommandPath);
            return command.execute(interaction);
        }

        await interaction.reply({ content: 'Subcommand not found', ephemeral: true });
    },
};
