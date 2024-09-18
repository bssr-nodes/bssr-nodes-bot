module.exports = {
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const isAnotherUserLookup = !!interaction.options.getUser('user');

        try {
            const invites = await interaction.guild.invites.fetch();

            const userInvites = invites.filter(invite => invite.inviter && invite.inviter.id === targetUser.id);
            let userInviteCount = 0;

            userInvites.forEach(invite => {
                userInviteCount += invite.uses;
            });

            if (isAnotherUserLookup) {
                await interaction.reply(`User \`${targetUser.username}\` has invited ${userInviteCount} users.`);
            } else {
                await interaction.reply(`You have invited ${userInviteCount} users to this server.`);
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while fetching invites.', ephemeral: true });
        }
    },
};
