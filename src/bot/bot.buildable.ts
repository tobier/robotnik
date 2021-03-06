/**
 * Copyright (c) 2020 Tobias Eriksson
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Client } from 'discord.js';

import { Bot } from './bot';
import { Broker } from '../command/command.broker';

/**
 * Implements a bot that is buildable by a builder.
 */
/* eslint-disable no-console */
export class BuildableBot implements Bot {

    private readonly broker: Broker;

    private readonly client: Client;

    constructor(client: Client, broker: Broker) {
        this.client = client;
        this.broker = broker;
    }

    login(secret: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.login(secret).then(() => {
                this.client.on('message', message => {
                    this.broker.onMessage(message).catch(console.error);
                })
                console.debug(`Bot is running as ${this.client.user.username}`);
            }).catch(reject);
        });
    }
};