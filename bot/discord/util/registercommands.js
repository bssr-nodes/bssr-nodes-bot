// DO NOT USE UNLESS YOURE USING IT ON THE MAIN BOT!!! IT WILL NOT WORK IF YOU ARE NOT USING IT ON PTERODACTYL PANEL.

const fs = require('fs');
const path = require('path');

client.commands = new Map();
const commands = [];

function loadCommands(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            loadCommands(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            try {
                const command = require(fullPath);

                if (command.data && command.data.name) {
                    client.commands.set(command.data.name, command);
                    commands.push(command.data.toJSON());
                }
            } catch (error) {
                console.error(`Failed to load command ${entry.name}:`, error);
            }
        }
    }
}

(async () => {
    try {
        const guildId = '1244976723800358994';
        const guild = client.guilds.cache.get(guildId);

        const globalCommands = await client.application.commands.fetch();
        globalCommands.forEach(command => {
            client.application.commands.delete(command.id)
                .then(() => console.log(`Deleted global command: ${command.name}`))
                .catch(console.error);
        });

        const guildCommands = await guild.commands.fetch();
        guildCommands.forEach(command => {
            guild.commands.delete(command.id)
                .then(() => console.log(`Deleted guild command: ${command.name}`))
                .catch(console.error);
        });

        const baseDirectory = path.resolve('/home/container/bot/discord/commands');
        loadCommands(baseDirectory);

        await guild.commands.set(commands);
        console.log('Successfully deleted old commands and registered new ones.');

    } catch (error) {
        console.error('Error deleting/re-registering commands:', error);
    }
})();