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
import 'mocha';

import { use, expect } from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import { spy } from 'sinon';
import * as sinonChai from 'sinon-chai';

import { mock } from 'ts-mockito';

import { Message } from 'discord.js';

import { Broker, Parser } from '../src/command';

use(ChaiAsPromised);
use(sinonChai.default);

describe('Command broker', () => {
    it('unregistered command is rejected', () => {
        const broker = new Broker();

        const message = mock(Message);
        message.content = `${Parser.PREFIX}unknown`;

        return expect(broker.onMessage(message)).to.eventually.be.rejected;
    });

    it('registered command is properly forwared with arguments', () => {
        const broker = new Broker();
        const handler = spy();

        const message = mock(Message);
        message.content = `${Parser.PREFIX}register my nickname`;

        broker.register('register', handler);
        broker.onMessage(message);
        return expect(handler).to.have.been.calledWith('my', 'nickname');
    });
});

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