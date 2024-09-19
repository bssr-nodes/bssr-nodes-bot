const { SlashCommandBuilder } = require('@discordjs/builders');
const { exec } = require('child_process');
const cap = require('../../util/cap');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        if (!interaction.member.roles.cache.some(r => r.id === '1250361260462309430')) {
            return interaction.reply({ content: 'You do not have the necessary permissions to use this command.', ephemeral: true });
        }

        exec('git pull', (error, stdout) => {
            let response = error || stdout;
            if (!error) {
                if (response.includes('Already up to date.')) {
                    return interaction.reply('All files are already up to date.');
                } else {
                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('🔄 GitHub Update')
                        .setDescription(`Update requested by <@${interaction.user.id}>`)
                        .addFields({ name: 'Update Log', value: `\`\`\`${cap(response, 1024)}\`\`\`` })
                        .setTimestamp(Date.now())
                        .setFooter({ text: 'GitHub Update', iconURL: interaction.client.user.displayAvatarURL() });

                    interaction.client.channels.cache
                        .get('1256939961177997312')
                        .send({ embeds: [embed] });

                    interaction.reply('Pulling files from GitHub.');

                    setTimeout(() => {
                        process.exit();
                    }, 1000);
                }
            } else {
                interaction.reply(`An error occurred: \`\`\`${cap(response, 1024)}\`\`\``);
            }
        });
    }
};