const ms = require("ms");
const humanizeDuration = require("humanize-duration");

module.exports = {
    async execute(interaction) {
        const allowedUserIDs = ["569352110991343616", "1131236182899052696", "871722786006138960", "1080213687073251461"];
        if (!allowedUserIDs.includes(interaction.user.id)) {
            return interaction.reply({ content: "BACK OFF. STAFF ONLY.", ephemeral: true });
        }

        const timeString = interaction.options.getString('time');
        const codeString = interaction.options.getString('code');
        const time = ms(timeString) || 300000;

        const CAPSNUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        const generateCode = () => {
            let password = "";
            while (password.length < 16) {
                password += CAPSNUM[Math.floor(Math.random() * CAPSNUM.length)];
            }
            return password;
        };

        let code;
        let now = Date.now();

        if (!codeString) {
            const randomCode = generateCode();
            code = {
                code: randomCode,
                createdBy: interaction.user.id,
                balance: 1,
                createdAt: now + time,
            };
            global.codes.set(randomCode, code);
        } else {
            code = global.codes.get(codeString);
            if (!code) {
                return interaction.reply({ content: "That's not a code you scammer", ephemeral: true });
            }
        }

        const embed = new global.Discord.EmbedBuilder()
            .setAuthor("Key Drop!")
            .setColor("BLUE")
            .setFooter(`Keydrop by ${interaction.user.username}`, interaction.user.avatarURL())
            .setDescription(`Dropping a premium key in: ${humanizeDuration(time, { round: true })}!`)
            .setTimestamp(now + time);

        const dropMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

        global.codes.set(`${code.code}.drop`, {
            message: {
                ID: dropMessage.id,
                channel: dropMessage.channel.id,
            },
        });

        setTimeout(() => {
            embed.setDescription(`Dropping a premium key in: ${humanizeDuration(time - time / 1.2, { round: true })}!`);
            dropMessage.edit({ embeds: [embed] });
        }, time / 1.2);

        setTimeout(() => {
            embed.setDescription(`Dropping a premium key in: ${humanizeDuration(time / 2, { round: true })}!`);
            dropMessage.edit({ embeds: [embed] });
        }, time / 2);

        setTimeout(() => {
            embed.setDescription(
                `**REDEEM NOW!**\nThe code is: \`${code.code}\` \n**Steps:** \n- Navigate to <#1250784987419246717>\n- Redeem the Premium Code: \`/server redeem <Code>\`\n\n*No one has redeemed the code yet!*`
            );
            dropMessage.edit({ embeds: [embed] });
        }, time);
    },
};
