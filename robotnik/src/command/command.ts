/** 
 * User-executable bot command with optional arguments.
 */
export default interface Command {
    (...args: string[]): Promise<void>;
};