const { SlashCommandBuilder } = require('@discordjs/builders');
const { exec } = require('child_process');
const cap = require('../../util/cap');

module.exports = { 
    async execute(interaction) {
        // Checks if the user has the Bot System Administrator Role
        if (!interaction.member.roles.cache.some(r => r.id === '1250361260462309430')) {
            return interaction.reply({ content: 'You do not have the necessary permissions to use this command.', ephemeral: true });
        }

        exec('git pull', (error, stdout) => {
            let response = error || stdout;
            if (!error) {
                if (response.includes('Already up to date.')) {
                    return interaction.reply('All files are already up to date.');
                } else {
                    interaction.client.channels.cache
                        .get('1256939961177997312')
                        .send(`<t:${Math.floor(Date.now() / 1000)}:f> Update requested by <@${interaction.user.id}>, pulling files.\n\`\`\`${cap(response, 1900)}\`\`\``);

                    interaction.reply('Pulling files from GitHub.');
                    setTimeout(() => {
                        process.exit();
                    }, 1000);
                }
            } else {
                interaction.reply(`An error occurred: \`\`\`${response}\`\`\``);
            }
        });
    }
};
