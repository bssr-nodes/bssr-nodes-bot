exports.run = async (client, message, args) => {
    if (!message.member.roles.cache.has("1247882619602075749")) return;

    // Check if a node is provided as an argument.
    if (!args[1]) {
        return message.reply("Please provide a Node to put into maintenance!");
    } else {
        const Data = await nodeStatus.get(args[1].toLowerCase());

        // Check if the provided node is valid.
        if (Data == null) {
            return message.reply("Invalid Node provided. Please provide a valid Node DB name.");
        } else {
            // Toggle the maintenance mode.
            if (Data.maintenance) {
                const Result = await nodeStatus.set(`${args[1].toLowerCase()}.maintenance`, false);

                if (!Result) return message.reply(`Unable to put ${args[1]} out of maintenance mode.`);

                return message.reply(`Successfully put ${args[1]} out of maintenance mode.`);
            } else if (Data.maintenance == false) {
                const Result = await nodeStatus.set(`${args[1].toLowerCase()}.maintenance`, true);

                if (!Result) return message.reply(`Unable to put ${args[1]} into maintenance mode.`);

                return message.reply(`Successfully put ${args[1]} into maintenance mode.`);
            }
        }
    }
};
