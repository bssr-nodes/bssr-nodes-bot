<<<<<<< HEAD
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('__**Ticket Commands**__')
            .setDescription(
                `\`${config.DiscordBot.Prefix}ticket add\` | Add a user to a ticket\n` +
                `\`${config.DiscordBot.Prefix}ticket close\` | Close a ticket\n` +
                `\`${config.DiscordBot.Prefix}ticket downgrade\` | Let all staff see the ticket\n` +
                `\`${config.DiscordBot.Prefix}ticket new\` | Open a new ticket\n` +
                `\`${config.DiscordBot.Prefix}ticket remove\` | Remove a user from the ticket\n` +
                `\`${config.DiscordBot.Prefix}ticket upgrade\` | Let only admins see the ticket`
            )
            .setColor('BLUE')
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed] });
    },
=======
exports.run = async (client, message, args) => {
    const embed = new Discord.MessageEmbed().addField(
        "__**Commands**__",
        "`" +
            config.DiscordBot.Prefix +
            "ticket add` | Add a user to a ticket \n`" +
            config.DiscordBot.Prefix +
            "ticket close` | Close a ticket \n`" +
            config.DiscordBot.Prefix +
            "ticket downgrade` | Lets all staff see your ticket \n`" +
            config.DiscordBot.Prefix +
            "ticket new` | Opens a new ticket \n`" +
            config.DiscordBot.Prefix +
            "ticket remove` | Removes a user from your ticket \n`" +
            config.DiscordBot.Prefix +
            "ticket upgrade` | Lets only admins see your ticket"
    );
    await message.reply(embed);
>>>>>>> 469902f (push the changes i made on ptero)
};
