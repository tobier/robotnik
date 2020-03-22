import { Result } from "@badrap/result";

/**
 * Parses commands from a message string.
 */
export default class CommandParser {
    /**
     * Commands are prefixed with this operator.
     */
    static readonly PREFIX: string = "+";

    /**
     * Trimmed, but otherwise unmodified, message
     */
    readonly message: string;

    constructor(message: string) {
        this.message = message.trim();
    }

    /**
     * Get the command portion of the mesasge, e.g.:
     *
     * '<prefix>help someOtherCommand' returns 'help'
     */
    command(): Result<string, Error> {
        if(this.message.startsWith(CommandParser.PREFIX)) {
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
        if(this.message.startsWith(CommandParser.PREFIX)) {
            const tokens: string[] = this.tokenize();
            return tokens.slice(1);
        }
        return [];
    }

    private tokenize(): string[] {
        return this.message.replace(CommandParser.PREFIX, "").match(/\S+/g);
    }
}