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
import { Message } from 'discord.js';

import { Command } from './command.function';
import { Parser } from './command.parser';

/**
 * Brokers named commands.
 */
export class Broker {
    private readonly commands: Map<string, Command>;

    constructor() {
        this.commands = new Map<string, Command>();
    }

    /**
     * Register a new command for this broker.
     * @param name    the name of the command
     * @param command the command function
     */
    register(name: string, command: Command): void {
        this.commands.set(name, command);
    }

    /**
     * Handle a message from a user.
     * @param message the message to handle
     */
    async onMessage(message: Message): Promise<void> {
        const parser = new Parser(message.content);
        const command = parser.command();
        if(command.isOk) {
            return this.run(command.value, ...parser.args());
        }

        return Promise.reject(new Error(`Failed to execute command based on ${message.content}`));
    }

    private run(name: string, ...args: string[]): Promise<void> {
        if(this.commands.has(name)) {
            const command = this.commands.get(name);
            return command(...args);
        }

        return Promise.reject(new Error(`No such command: ${name}`));
    }
}