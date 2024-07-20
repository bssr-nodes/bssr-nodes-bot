const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Server commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('redeem')
                .setDescription('Redeem a server code')
                .addStringOption(option =>
                    option.setName('code')
                        .setDescription('The code to redeem')
                        .setRequired(true))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const subcommandPath = path.join(__dirname, 'server', `${subcommand}.js`);

        if (fs.existsSync(subcommandPath)) {
            const command = require(subcommandPath);
            return command.execute(interaction);
        }

        await interaction.reply({ content: 'Subcommand not found', ephemeral: true });
    },
};
