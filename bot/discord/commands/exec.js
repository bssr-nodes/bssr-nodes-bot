const exec = require("child_process").exec;
exports.run = (client, message, args) => {
    if (["569352110991343616", "1131236182899052696", "871722786006138960", "1080213687073251461"].includes(message.author.id)) {
        exec(`${args.join(" ")}`, (error, stdout) => {
            let response = error || stdout;

            if (response.length > 4000) console.log(response), (response = "Output too long.");

            message.reply("", {
                embed: new Discord.MessageEmbed()
                    .setDescription("```" + response + "```")
                    .setTimestamp()
                    .setColor("RANDOM"),
            });
        });
    }
};
