const cap = require("../util/cap");
const { exec } = require("child_process");
const nstatus = require("../serverStatus");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client) => {
    let guild = client.guilds.cache.get("1244976723800358994");

    console.log(chalk.magenta("[DISCORD] ") + chalk.green(client.user.username + " has logged in!"));

    guild.channels.cache
        .filter((x) => x.parentID === "1250359312249917501" && Date.now() - x.createdAt > 1800000)
        .forEach((x) => x.delete());

    client.cooldown = {};

    setInterval(() => {
        exec(`git pull`, (error, stdout) => {
            let response = error || stdout;
            if (!error) {
                if (!response.includes("Already up to date.")) {
                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('🔄 Automatic Update from GitHub')
                        .setDescription('Automatic update triggered, pulling files from GitHub.')
                        .addFields({ name: 'Update Log', value: `\`\`\`${cap(response, 1024)}\`\`\`` })
                        .setTimestamp(Date.now())
                        .setFooter({ text: 'System Update', iconURL: client.user.displayAvatarURL() });

                    client.channels.cache.get("1256939961177997312").send({ embeds: [embed] });

                    setTimeout(() => {
                        process.exit(); // Exit the process after sending the embed
                    }, 1000);
                }
            }
        });
    }, 30000);

//    setInterval(() => {
        //Auto Activities List
//        const activities = [
//            {
//                text: "over BSSR Nodes",
//               type: "WATCHING"
//            }
//        ];

//        const activity = activities[Math.floor(Math.random() * activities.length)];
//        client.user.setActivity(activity.text, {
//            type: activity.type,
//        });
//    }, 15000);
};