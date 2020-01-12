require('log-timestamp');

const fs = require('fs');
const Discord = require('discord.js');
const token = process.env.DISCORD_TOKEN || 'not-a-valid-token';
const { prefix, streamChannel, stream_cooldown_seconds } = require('./config.json');

const TwitchClient = require('twitch').default;

const client = new Discord.Client();
client.commands = new Discord.Collection();

const stream_cooldowns = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    client.twitch = TwitchClient.withClientCredentials(process.env.TWITCH_ID || 'not-a-valid-id', process.env.TWITCH_SECRET || 'not-a-valid-secret');
    console.log('Beep boop, bot has started!');
});

client.on('message', async message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    try {
        command.execute(message, args);
    }
    catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!').catch(console.error);
    }
});

client.on('presenceUpdate', async (oldMember, newMember) => {
    // Changing Spotify songs will trigger a prescence update, so check that previous state
    // wasn't also streaming
    if(oldMember.presence.game && oldMember.presence.game.streaming) return;

    if (!newMember.presence.game) return;

    const game = newMember.presence.game;
    if (!game.streaming) return;

    // Check cooldown on stream announcing so as not to flood channels
    if (stream_cooldowns.has(newMember.id)) {
        const expiration = stream_cooldowns.get(newMember.id);
        if (Date.now() < expiration) return;
    }

    const channel = newMember.guild.channels.find('name', streamChannel);
    if (channel) {
        try {
            const author = newMember.nickname ? newMember.nickname : newMember.user.username;
            const twitchGame = await client.twitch.helix.games.getGameByName(game.state);
            const artworkUrl = twitchGame.boxArtUrl.replace('{width}', 144).replace('{height}', 192);

            const shill = new Discord.RichEmbed()
                .setAuthor(author, newMember.user.avatarURL, game.url)
                .setColor('#0099ff')
                .setTitle(game.details)
                .setDescription(game.state)
                .setThumbnail(artworkUrl)
                .setFooter(game.url);

            // TODO temporary, should be a random "going live" phrase
            const message = `Looks like we got a live one here! ${game.url}`;

            channel.send(message, shill).then(() => {
                // Set a cooldown on stream announcing so we don't flood the channel
                const expiration = Date.now() + (stream_cooldown_seconds * 1000);
                stream_cooldowns.set(newMember.id, expiration);
            });
        }
        catch (error) {
            console.error(error);
        }
    }
    else {
        console.error(`Server ${newMember.guild.name} doesn't have a streaming channel '${streamChannel}'`);
    }
});

client.login(token).catch(console.error);