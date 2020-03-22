/** 
 * User-executable bot command with optional arguments.
 */
export default interface Command {
    (...args: string[]);
};

/**
 * Parses commands from a message string.
 */
export class CommandParser {
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
    command(): string {
        if(this.message.startsWith(CommandParser.PREFIX)) {
            const tokens: string[] = this.tokenize();
            return tokens[0];
        }
        return null;
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