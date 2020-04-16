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
import { Result } from "@badrap/result";
import { Message } from 'discord.js';

import { Command } from './command.record';
import { Parser } from './command.parser';

const HELP_COMMAND = 'help <command>      prints help for <command>';

/**
 * Brokers named commands.
 */
export class Broker {
    private readonly commands: Map<string, Command>;

    constructor() {
        this.commands = new Map<string, Command>();
        this.register('help', {
            description : 'Shows help for commands',
            help : HELP_COMMAND,
            handler : async (message, ...args) => {
                const data = [];
                if(args.length < 1) {
                    data.push(HELP_COMMAND);
                }
                else {
                    const command = args[0];
                    if(this.commands.has(command)) {
                        const target = this.commands.get(command);
                        data.push(`${command} - ${target.description}`);
                        data.push(target.help);
                    } else {
                        data.push(`No such command: ${command}`);
                    }
                }

                return new Promise((resolve, reject) => {
                    message.author.send(data).then( () => resolve() ).catch(reject);
                });
            }
        });
    }

    /**
     * Register a new command for this broker.
     * @param name    the name of the command
     * @param command the command to register
     */
    register(name: string, command: Command): Result<void, Error> {
        if(this.commands.has(name)) {
            return Result.err(new Error(`Command already exists: ${name}`));
        }
        this.commands.set(name, command);
        return Result.ok(undefined);
    }

    /**
     * Handle a message from a user.
     * @param message the message to handle
     */
    async onMessage(message: Message): Promise<void> {
        if (message.author.bot) {
            return Promise.resolve(); // Don't answer bots
        }
        const parser = new Parser(message.content);
        const command = parser.command();
        if(command.isOk) {
            return this.run(command.value, message, ...parser.args());
        }

        // Was not parsed as a command, just silently exit
        return Promise.resolve();
    }

    private run(name: string, message: Message, ...args: string[]): Promise<void> {
        if(this.commands.has(name)) {
            const command = this.commands.get(name);
            return command.handler(message, ...args);
        }

        return Promise.reject(new Error(`No such command: ${name}`));
    }
}