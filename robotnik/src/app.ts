import { Client } from 'discord.js';
import TwitchClient from 'twitch';
import Bot from './bot';

import * as config from '../config.json';

const client = new Client();
const twitchClient = TwitchClient.withClientCredentials(config.id, config.secret);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  twitchClient.helix.streams.getStreamByUserName(config.stream).then((stream) => {
    client.guilds.forEach((guild) => {
      const bot = new Bot(guild);
      bot.onStreamChanged(stream);
    });
  });
});

client.login(config.token);
