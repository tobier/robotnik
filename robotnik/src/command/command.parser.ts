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

/**
 * Parses commands from a message string.
 */
export class Parser {
    /**
     * Commands are prefixed with this operator.
     */
    static readonly PREFIX: string = "+";

    /**
     * Trimmed, but otherwise unmodified, message
     */
    private readonly message: string;

    constructor(message: string) {
        this.message = message.trim();
    }

    /**
     * Get the command portion of the mesasge, e.g.:
     *
     * '<prefix>help someOtherCommand' returns 'help'
     */
    command(): Result<string, Error> {
        if(this.message.startsWith(Parser.PREFIX)) {
            const tokens: string[] = this.tokenize();
            return Result.ok(tokens[0]);
        }
        return Result.err(new Error('String is not a command'));
    }

    /**
     * Get the arguments portion of the message, e.g.:
     * 
     * '<prefix>help someOtherCommand' returns 'someOtherCommand'
     */
    args(): string[] {
        if(this.message.startsWith(Parser.PREFIX)) {
            const tokens: string[] = this.tokenize();
            return tokens.slice(1);
        }
        return [];
    }

    private tokenize(): string[] {
        return this.message.replace(Parser.PREFIX, "").match(/\S+/g);
    }
}