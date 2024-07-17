exports.run = async (client, message, args) => {
    if (!["569352110991343616", "1131236182899052696", "871722786006138960", "1080213687073251461"].includes(message.author.id)) return;

    if (args.length < 4) return;
    let parser = new Intl.NumberFormat();

    let setDonations = (userid, amount) => {
        userPrem.set(userid + ".donated", amount);
    };

    let sendMessage = (userid, amount) => {
        message.delete();
        message.channel.send("Thanks <@" + userid + "> for donating! \nYou can now create donator servers using `" + config.DiscordBot.Prefix + "server create-donator`");
        client.channels.cache.get("1250362091207000134").send("Thanks, <@" + userid + "> for donating $" + parser.format(amount));
    };

    let userid = message.guild.members.cache.get(
        args[2].match(/[0-9]{17,19}/).length == 0 ? args[2] : args[2].match(/[0-9]{17,19}/)[0]
    );
    let amount = Number.parseInt(args[3]);
    if (isNaN(amount)) return;

    let oldBal = userPrem.get(userid + ".donated") || 0;

    if (args[1].toLowerCase() === "add") {
        setDonations(userid, amount + oldBal);
        sendMessage(userid, amount);

        await message.guild.members.cache.get(userid.id).roles.add("1250361260462309430");
    }

    if (args[1].toLowerCase() === "set") {
        setDonations(userid, amount);
        sendMessage(userid, amount);

        await message.guild.members.cache.get(userid.id).roles.add("1250361260462309430");
    }

    if (args[1].toLowerCase() === "remove") {
        setDonations(userid, Math.max(0, oldBal - amount));
        // sendMessage(userid, Math.max(0, oldBal - amount))
    }
};
