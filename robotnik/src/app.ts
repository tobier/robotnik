import { Client } from 'discord.js';

import { Broker } from './command';

import * as config from '../config.json';

const broker = new Broker();

const client = new Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}`);
});

client.on('message', message => {
    broker.onMessage(message).then(() => console.log("this went well")).catch(console.error);
})

client.login(config.token);