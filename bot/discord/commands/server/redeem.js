const humanizeDuration = require("humanize-duration");

module.exports = {
    async execute(interaction) {
        const codeName = interaction.options.getString('code');

        // Utility function to update user donations
        const setDonations = (userid, amount) => {
            global.userPrem.set(userid + ".donated", amount);
        };

        // Retrieve the code from the database
        const code = global.codes.get(codeName);

        if (!code) {
            return await interaction.reply({ content: "That code is invalid or expired", ephemeral: false });
        }

        // Get the user's current balance
        const oldBal = global.userPrem.get(interaction.user.id + ".donated") || 0;
        const now = Date.now();

        // Respond to the user
        await interaction.reply({
            content: `You have redeemed a code with ${code.balance} premium server(s), you now have ${Math.floor(
                (oldBal + code.balance) / config.node7.price
            )}!`,
            ephemeral: false
        });

        // Send a notification to the specified channel
        const channel = interaction.client.channels.cache.get("1250362091207000134");
        if (channel) {
            channel.send(
                `<@${interaction.user.id}>, Redeemed code: ${codeName} it held ${code.balance} premium servers! *This code was redeemed in ${humanizeDuration(now - code.createdAt)}*`
            );
        }

        // Delete the code from the database
        global.codes.delete(codeName);

        // Add the role to the user
        const member = interaction.member;
        if (member) {
            const role = interaction.guild.roles.cache.get("1250361260462309430");
            if (role) {
                member.roles.add(role);
            }
        }

        // Update the user's donations
        setDonations(interaction.user.id, oldBal + code.balance);

        // Update the drop message if applicable
        if (code.drop) {
            const dropChannel = interaction.client.channels.cache.get(code.drop.message.channel);
            if (dropChannel) {
                try {
                    const dropMessage = await dropChannel.messages.fetch(code.drop.message.ID);
                    const embed = dropMessage.embeds[0].setDescription(
                        `**REDEEM NOW!**\nThe code is: \`${code.code}\` \n**Steps:** \n- Navigate to <#1250784987419246717>\n- Redeem the Premium Code: \`/server redeem <Code>\`\n\n*Redeemed by ${interaction.user}*`
                    );
                    await dropMessage.edit({ embeds: [embed] });
                } catch (error) {
                    console.error('Failed to fetch or update drop message:', error);
                }
            }
        }
    },
};
