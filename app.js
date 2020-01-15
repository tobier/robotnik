require('log-timestamp');

const fs = require('fs');
const tmp = require('tmp');

const request = require('request');

const Discord = require('discord.js');
const token = process.env.DISCORD_TOKEN || 'not-a-valid-token';
const config = require('./config.json');

const TwitchClient = require('twitch').default;

const client = new Discord.Client();
client.cooldowns = new Discord.Collection();

client.once('ready', () => {
    client.twitch = TwitchClient.withClientCredentials(process.env.TWITCH_ID || 'not-a-valid-id', process.env.TWITCH_SECRET || 'not-a-valid-secret');
    console.log('Beep boop, bot has started!');
});

client.on('presenceUpdate', async (previous, current) => {
    // Changing Spotify songs will trigger a prescence update, so check that previous state
    // wasn't also streaming
    if(previous.presence.game && previous.presence.game.streaming) return;

    if (!current.presence.game) return;

    const game = current.presence.game;
    if (!game.streaming) return;

    // Check cooldown on stream announcing so as not to flood channels
    if (client.cooldowns.has(current.id)) {
        const expiration = client.cooldowns.get(current.id);
        if (Date.now() < expiration) return;
    }

    const channel = current.guild.channels.find('name', config.stream.channel);
    if (channel) {
        try {
            const author = current.nickname ? current.nickname : current.user.username;
            const twitchGame = await client.twitch.helix.games.getGameByName(game.state);
            const artworkUrl = twitchGame.boxArtUrl
                .replace('{width}', config.stream.thumbnail.width)
                .replace('{height}', config.stream.thumbnail.height);

            const tmpDir = tmp.dirSync();
            const thumbnailFileUri = `${tmpDir.name}/thumbnail.jpg`;

            request.head(artworkUrl, () => {
                request(artworkUrl).pipe(fs.createWriteStream(thumbnailFileUri)).on('close', () => {
                    const shill = new Discord.RichEmbed()
                        .setAuthor(author, current.user.avatarURL, game.url)
                        .setColor('#0099ff')
                        .setTitle(game.details)
                        .setDescription(game.state)
                        .attachFile(thumbnailFileUri)
                        .setThumbnail('attachment://thumbnail.jpg')
                        .setFooter(game.url);

                    // TODO temporary, should be a random "going live" phrase
                    const message = `Looks like we got a live one here! ${game.url}`;

                    channel.send(message, shill).then(() => {
                        // Set a cooldown on stream announcing so we don't flood the channel
                        const expiration = Date.now() + (config.stream.cooldownSeconds * 1000);
                        client.cooldowns.set(current.id, expiration);
                        tmpDir.removeCallback();
                    });
                });
            });
        }
        catch (error) {
            console.error(error);
        }
    }
    else {
        console.error(`Server ${current.guild.name} doesn't have a streaming channel '${config.stream.channel}'`);
    }
});

client.login(token).catch(console.error);