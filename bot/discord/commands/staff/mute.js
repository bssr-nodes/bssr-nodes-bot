// Create the "muted" role if it doesn't exist
async function createMutedRole(guild) {
  const muteRole = guild.roles.cache.find(role => role.name === 'muted');
  if (!muteRole) {
    await guild.roles.create({
      name: 'muted',
      permissions: []
    });
  }
}

// Disable send message permission for the "muted" role in all channels
async function setupMuteRole(guild) {
  await createMutedRole(guild);
  const muteRole = guild.roles.cache.find(role => role.name === 'muted');
  const channels = guild.channels.cache.filter(channel => channel.type !== 'category');
  for (const channel of channels) {
    await channel.permissionOverwrites.edit(muteRole, {
      SEND_MESSAGES: false
    });
  }
}

// Run the setup function when the bot starts
client.on('ready', async () => {
  for (const guild of client.guilds.cache) {
    await setupMuteRole(guild[1]);
  }
});

// Mute command
exports.run = async (client, message, args) => {
  const logChannelId = '1250044011457024040';

  if (!message.member.roles.cache.find((r) => r.id === "1247882619602075749")) {
    return message.channel.send("You don't have permission to use this command.");
  }

  const target = message.mentions.members.first();
  if (!target) return message.channel.send("Please mention a user to mute.");

  let muteDuration = args[1];
  if (!muteDuration) return message.channel.send("Please provide a duration for the mute.");

  let duration;
  try {
    duration = ms(muteDuration);
  } catch (error) {
    return message.channel.send("Invalid duration format. Please use formats like '1m', '5h', '2d'.");
  }
    
      const muteRole = target.guild.roles.cache.find(role => role.name === 'muted');
  await target.roles.add(muteRole);

  const embed = new Discord.EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('User Muted')
    .addField('User', `${target.user.tag}`, true)
    .addField('Duration', `${ms(duration, { long: true })}`, true)
    .addField('By', `${message.author.tag}`, true)
    .setTimestamp();

  message.channel.send(`Muted **${target.user.tag}** for **${ms(duration, { long: true })}**!`);
  message.channel.send({ embeds: [embed] });

  const logChannel = client.channels.cache.get(logChannelId);
  if (logChannel) logChannel.send({ embeds: [embed] });

  setTimeout(async () => {
    await target.roles.remove(muteRole);
    message.channel.send(`Unmuted **${target.user.tag}**!`);
  }, duration);
};