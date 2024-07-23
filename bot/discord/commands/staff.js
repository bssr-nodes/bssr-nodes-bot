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
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('drop')
                .setDescription('Drop a code for a premium server')
                .addStringOption(option =>
                    option.setName('time')
                        .setDescription('Specify a time before it gets dropped')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('code')
                        .setDescription('Optional: Specify a code to drop')))
        .addSubcommand(subcommand =>
            subcommand
               .setName('maintenance')
               .setDescription('Toggle maintenance mode for a specified node')
               .addStringOption(option =>
                    option.setName('node')
                        .setDescription('The node to put into maintenance mode')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
               .setName('linked')
               .setDescription('Check if a user is linked with a console account')
               .addStringOption(option => 
                    option.setName('userid')
                        .setDescription('The user ID to check')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('update')
                .setDescription('Pulls files from GitHub and restarts the bot if there are updates.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('changelog')
                .setDescription('Creates and sends a changelog')
                .addStringOption(option => 
                    option.setName('topic')
                        .setDescription('The topic of the changelog')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('roles')
                        .setDescription('Role IDs to ping, separated by spaces (type "everyone" for @everyone)')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('content')
                        .setDescription('The content of the changelog')
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
