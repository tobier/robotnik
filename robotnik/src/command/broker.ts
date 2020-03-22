import Command from './command';

/**
 * Brokers named commands.
 */
export default class Broker {
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
     * Run a command registered in this broker.
     * @param name the name of the command
     * @param args the (optional) arguments
     */
    run(name: string, ...args: string[]): Promise<void> {
        if(this.commands.has(name)) {
            const command = this.commands.get(name);
            return command(...args);
        }

        return Promise.reject(new Error(`No such command: ${name}`));
    }
}