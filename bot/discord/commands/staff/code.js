const { EmbedBuilder } = require('discord.js');

// Utility function to generate a random code
const generateCode = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let code = "";
    for (let i = 0; i < 16; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};

module.exports = {
    async execute(interaction) {
        const allowedUserIDs = ["569352110991343616", "1131236182899052696", "871722786006138960", "1080213687073251461"];
        const ownerId = "569352110991343616";
        const codeName = interaction.options.getString('name');
        const uses = interaction.options.getInteger('uses');

        // Check if the user ID is in the allowed list
        if (!allowedUserIDs.includes(interaction.user.id)) {
            return await interaction.reply({ content: "BACK OFF. STAFF ONLY.", ephemeral: false });
        }

        // Validate the input
        if (isNaN(uses) || uses <= 0) {
            return await interaction.reply({ content: "The number of uses must be a positive integer.", ephemeral: true });
        }

        // Generate or use the provided code name
        const code = codeName.toLowerCase() === "random" ? generateCode() : codeName;

        // Check if the code already exists
        if (global.codes.get(code)) {
            return await interaction.reply({ content: "A code with that name already exists.", ephemeral: true });
        }

        // Create the code and store it
        global.codes.set(code, {
            code: code,
            createdBy: interaction.user.id,
            balance: uses,
            createdAt: Date.now(),
        });

        // Send confirmation message to the user
        await interaction.reply({
            content: `Created code: \`${code}\` with \`${uses}\` uses. \n\nRedeem this with \`/server redeem ${code}\``,
            ephemeral: false
        });

        // Log the creation to the bot owner
        const owner = await interaction.client.users.fetch(ownerId);
        const logEmbed = new EmbedBuilder()
            .setTitle('New code created')
            .addField('Admin', interaction.user.tag, true)
            .addField('Code', code, true)
            .addField('Uses', uses.toString(), true)
            .setColor('GREEN')
            .setTimestamp();
        await owner.send({ embeds: [logEmbed] });
    },
};
