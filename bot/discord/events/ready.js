const cap = require("../util/cap");
const { exec } = require("child_process");
const nstatus = require("../serverStatus");

module.exports = async (client) => {
    let guild = client.guilds.cache.get("1244976723800358994");

    console.log(chalk.magenta("[DISCORD] ") + chalk.green(client.user.username + " has logged in!"));

    // Close create account channels after a hour
    guild.channels.cache
        .filter((x) => x.parentID === "1250359312249917501" && Date.now() - x.createdAt > 1800000)
        .forEach((x) => x.delete());

    //Initializing Cooldown
    client.cooldown = {};

    //Automatic 30second git pull.
    setInterval(() => {
        exec(`git pull`, (error, stdout) => {
            let response = error || stdout;
            if (!error) {
                if (!response.includes("Already up to date.")) {
                    client.channels.cache
                        .get("1256939961177997312")
                        .send(`<t:${Date.now().toString().slice(0, -3)}:f> Automatic update from GitHub, pulling files.\n\`\`\`${cap(response, 1900)}\`\`\``);
                    setTimeout(() => {
                        process.exit();
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

    // Node status embed
if (config.Enabled.NodeStats) {
    let channel = client.channels.cache.get("1250043911276199957");
    setInterval(async () => {
        try {
            let embed = await nstatus.getEmbed();

            // Ensure the embed has a description before sending or editing
            if (embed && embed.data && embed.data.description && embed.data.description.trim()) {
                let messages = await channel.messages.fetch({ limit: 10 });

                messages = messages.filter((x) => x.author.id === client.user.id).last();
                if (messages == null) {
                    channel.send({ embeds: [embed] });
                } else {
                    messages.edit({ embeds: [embed] });
                }
            } else {
                console.error('Embed has no description, not sending the message.');
            }
        } catch (error) {
            console.error('Error fetching or sending embed:', error);
        }
    }, 15000);
}
};
