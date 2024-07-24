const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: 'not staff i see. i am in a 50 meter radius of you and am rapidluy approaching. start running.', ephemeral: false });
        }

        const user = interaction.options.getUser('user');
        const durationInput = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        let duration;
        try {
            duration = ms(durationInput);
            if (!duration) throw new Error('Invalid duration');
        } catch (error) {
            return interaction.reply({ content: 'Please provide a valid duration (e.g., 1m, 5m, 1h, 1d).', ephemeral: true });
        }

        const member = await interaction.guild.members.fetch(user.id);

        if (!member) {
            return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
        }

        try {
            await member.timeout(duration, reason);

            global.moderationHistory.set(`${user.id}`, {
                action: 'mute',
                moderator: interaction.user.tag,
                duration: durationInput,
                reason: reason,
                date: new Date().toISOString()
            });

            const embed = new EmbedBuilder()
                .setColor('RED')
                .setTitle('User Muted')
                .addFields(
                    { name: 'User', value: user.tag, inline: true },
                    { name: 'Duration', value: durationInput, inline: true },
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            const logChannel = interaction.guild.channels.cache.get('1250044011457024040');
            if (logChannel) {
                logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'There was an error trying to mute this user.', ephemeral: true });
        }
    },
};