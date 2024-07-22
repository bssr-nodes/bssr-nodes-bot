const { EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // Check if the user has the specific role
        if (!interaction.member.roles.cache.has("1247882619602075749")) {
            return interaction.reply({ content: "i dont think so buckaroo", ephemeral: false });
        }

        let userid = interaction.options.getString('userid');
        if (!userid.match(/[0-9]{17,19}/)) {
            return interaction.reply({ content: "Please provide a valid Discord user ID.", ephemeral: false });
        }
        userid = userid.match(/[0-9]{17,19}/)[0];

        if (!userData.get(userid)) {
            return interaction.reply({ content: "That account is not linked with a console account :sad:", ephemeral: false });
        } else {
            let embed = new EmbedBuilder()
                .setColor(`#00FF00`)
                .addField(`__**Username**__`, userData.fetch(`${userid}.username`))
                .addField(`__**Email**__`, userData.fetch(`${userid}.email`))
                .addField(`__**Discord ID**__`, userData.fetch(`${userid}.discordID`))
                .addField(`__**Console ID**__`, userData.fetch(`${userid}.consoleID`))
                .addField(`__**Date (YYYY/MM/DD)**__`, userData.fetch(`${userid}.linkDate`))
                .addField(`__**Time**__`, userData.fetch(`${userid}.linkTime`));
            await interaction.reply({ content: "That account is linked. Here's some data: ", embeds: [embed] });
        }
    },
};
