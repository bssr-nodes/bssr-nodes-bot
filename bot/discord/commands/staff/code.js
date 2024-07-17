exports.run = async (client, message, args) => {
    //Yes i stole this from the createData.js
    const CAPSNUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var codeGen = () => {
        var password = "";
        while (password.length < 16) {
            password += CAPSNUM[Math.floor(Math.random() * CAPSNUM.length)];
        }
        return password;
    };

    if (!["569352110991343616", "1131236182899052696", "871722786006138960", "1080213687073251461"].includes(message.author.id)) return;
    if (args.length < 3) {
        message.reply("Usage: `!staff code <name> <uses>");
        return;
    }

    let balance = parseInt(args[2]);

    if (isNaN(balance)) {
        message.reply("Uses must be a valid number");
        return;
    }

    const code = args[1].toLowerCase() == "random" ? codeGen() : args[1];

    if (codes.get(code) != null) {
        message.reply("A code with that name already exists");
        return;
    }

    message.reply(
        "Created code: `" +
            code +
            "` with `" +
            args[2] +
            "` premium servers. \n\nRedeem this with `!server redeem " +
            code +
            "`"
    );

    codes.set(code, {
        code: code,
        createdBy: message.author.id,
        balance: balance,
        createdAt: Date.now(),
    });
};
