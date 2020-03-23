import 'mocha';
import { expect } from 'chai';

import Parser from '../../src/command/parser';

describe('Command parsing from user message', () => {
    it('command without prefix return null and empty argument list', () => {
        const message = "does not have prefix";
        const parser = new Parser(message);

        const result = parser.command();

        return expect(result.isErr).to.be.true
            && expect(parser.args()).to.be.empty; 
    });

    it('command without arguments should return name and empty arg list', () => {
        const message = `${Parser.PREFIX}myCommand`;
        const parser = new Parser(message);

        return expect(parser.command().unwrap()).to.be.equal('myCommand')
            && expect(parser.args()).to.be.empty;
    });

    it('argumentless command with leading and trailing is still found', () => {
        const message = `  ${Parser.PREFIX}myCommand   `;
        const parser = new Parser(message);

        return expect(parser.command().unwrap()).to.be.equal('myCommand')
            && expect(parser.args()).to.be.empty;
    });

    it('command with arguments should return name and arg list', () => {
        const message = `${Parser.PREFIX}myCommand one two`;
        const parser = new Parser(message);

        return expect(parser.command().unwrap()).to.be.equal('myCommand')
            && expect(parser.args()).to.eql(['one', 'two']);
    });

    it('whitespace does not matter to argument list', () => {
        const message = `${Parser.PREFIX}myCommand   one   two three`;
        const parser = new Parser(message);

        return expect(parser.command().unwrap()).to.be.equal('myCommand')
            && expect(parser.args()).to.eql(['one', 'two', 'three']);
    });
});