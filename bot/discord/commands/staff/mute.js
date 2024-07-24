const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const member = await interaction.guild.members.fetch(target.id);
    const duration = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    if (!member) {
        return interaction.reply({ content: 'The specified user is not a member of this server.', ephemeral: true });
    }

    try {
        const durationMs = ms(duration);

        await member.timeout(durationMs, reason);

        const embed = new EmbedBuilder()
            .setColor('RED')
            .setTitle('User Muted')
            .addFields(
                { name: 'User', value: `${member.user.tag}`, inline: true },
                { name: 'Duration', value: `${duration}`, inline: true },
                { name: 'Reason', value: `${reason}`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        const moderationEntry = {
            action: 'Mute',
            reason: reason,
            date: new Date().toISOString(),
            moderator: interaction.user.id,
            duration: duration,
        };

        const userHistory = global.moderationHistory.get(member.id) || [];
        userHistory.push(moderationEntry);
        global.moderationHistory.set(member.id, userHistory);

        const logChannel = interaction.guild.channels.cache.get('1250044011457024040');
        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        }

    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'An error occurred while trying to mute the user.', ephemeral: true });
    }
},
};