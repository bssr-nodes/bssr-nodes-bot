const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // Check if the user has the specific role
        if (!interaction.member.roles.cache.has("1247882619602075749")) {
            return interaction.reply({ content: "You do not have permission to use this command.", ephemeral: false });
        }

        const node = interaction.options.getString('node').toLowerCase();
        const Data = await nodeStatus.get(node);

        // Check if the provided node is valid
        if (Data == null) {
            return interaction.reply({ content: "Invalid Node provided. Please provide a valid Node DB name.", ephemeral: false });
        } else {
            // Toggle the maintenance mode
            let Result;
            if (Data.maintenance) {
                Result = await nodeStatus.set(`${node}.maintenance`, false);
                if (!Result) return interaction.reply({ content: `Unable to put ${node} out of maintenance mode.`, ephemeral: false });
                return interaction.reply({ content: `Successfully put ${node} out of maintenance mode.` });
            } else {
                Result = await nodeStatus.set(`${node}.maintenance`, true);
                if (!Result) return interaction.reply({ content: `Unable to put ${node} into maintenance mode.`, ephemeral: false });
                return interaction.reply({ content: `Successfully put ${node} into maintenance mode.` });
            }
        }
    },
};
