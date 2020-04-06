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
import { BuildableBot } from './bot.buildable';

import { Command, Broker } from '../command';

/**
 * Configure a build a Bot instance.
 */
export class Builder {
    
    private readonly commands: Map<string, Command>;

    constructor() {
        this.commands = new Map<string, Command>();
    }

    /**
     * Add a command to the bot.
     * @param name the name of the command as typed by a user
     * @param command the actual command
     */
    withCommand(name: string, command: Command): Builder {
        this.commands.set(name, command);
        return this;
    }

    /**
     * Build a new Bot instance.
     */
    build(): Bot {
        const broker = new Broker();
        this.commands.forEach((command, name) => {
            broker.register(name, command);
        });
        
        return new BuildableBot(new Client(), broker);
    }
}