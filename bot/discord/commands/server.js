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
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('count')
                .setDescription('Displays the user\'s server count')
                    .addUserOption(option =>
                        option.setName('user')
                            .setDescription('The user to check (defaults to the command invoker)')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new server')
                    .addStringOption(option =>
                        option.setName('type')
                            .setDescription('The type of server to create')
                            .setRequired(false))
                            .addStringOption(option =>
                                option.setName('name')
                                    .setDescription('The name of the server (optional)')))
        .addSubcommand(subcommand =>
            subcommand
               .setName('delete')
                .setDescription('Deletes a server by ID')
                .addStringOption(option =>
                    option.setName('serverid')
                        .setDescription('The ID of the server you want to delete')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('help')
                .setDescription('Displays a list of server-related commands.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Lists all servers associated with the user')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('Optionally view another user\'s servers')
                        .setRequired(false))),
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
