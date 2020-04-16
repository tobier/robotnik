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
import { spy, stub } from 'sinon';
import * as sinonChai from 'sinon-chai';

import { mock } from 'ts-mockito';

import { Message, User } from 'discord.js';

import { Broker } from '../src/command/command.broker';
import { Parser } from '../src/command/command.parser';

use(ChaiAsPromised);
use(sinonChai.default);

describe('Command broker', () => {
    it('unregistered command is rejected', () => {
        const broker = new Broker();

        const message = mock(Message);
        message.content = `${Parser.PREFIX}unknown`;

        return expect(broker.onMessage(message)).to.eventually.be.rejected;
    });

    it('regular message is ignored and eventually fulfilled', () => {
        const broker = new Broker();

        const message = mock(Message);
        message.content = `just a message`;

        return expect(broker.onMessage(message)).to.eventually.be.fulfilled;
    });

    it('registered command is properly forwared with arguments', () => {
        const broker = new Broker();
        const handler = spy();
        const description = 'the description';
        const command = { handler, description };

        const message = mock(Message);
        message.content = `${Parser.PREFIX}register my nickname`;

        broker.register('register', command);
        broker.onMessage(message);
        return expect(handler).to.have.been.calledWith(message, 'my', 'nickname');
    });

    it('double register command gives error', () => {
        const broker = new Broker();
        const handler = spy();
        const description = 'the description';
        const command = { handler, description };

        const firstResult = broker.register('duplicated', command);
        const secondResult = broker.register('duplicated', command);

        return expect(firstResult.isOk).to.be.true && expect(secondResult.isErr).to.be.true;
    });

    it('running command as bot is not executed', () => {
        const broker = new Broker();
        const handler = spy();
        const description = 'the description';
        const command = { handler, description };

        const message = mock(Message);
        message.content = `${Parser.PREFIX}register my nickname`;
        message.author =  mock(User);
        message.author.bot = true; // This user is a bot!

        broker.register('register', command);
        broker.onMessage(message);
        return expect(handler).to.have.callCount(0);
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

describe('Built-in "help" command', () => {
    it('built in help withour arguments command answers the author', () => {
        const broker = new Broker();

        const message = mock(Message);
        message.content = `${Parser.PREFIX}help`;
        message.author =  mock(User);
        message.author.bot = false;
        message.author.send = spy((message: any) => {
            return Promise.resolve(message);
        });

        broker.onMessage(message);
        return expect(message.author.send).to.have.been.calledOnce;
    });

    it('built in help with known command command answers the author', () => {
        const broker = new Broker();

        const message = mock(Message);
        message.content = `${Parser.PREFIX}help help`;
        message.author =  mock(User);
        message.author.bot = false;
        message.author.send = spy((message: any) => {
            return Promise.resolve(message);
        });

        broker.onMessage(message);
        return expect(message.author.send).to.have.been.calledOnce;
    });

    it('built in help command with unknown command still answers the author', () => {
        const broker = new Broker();

        const message = mock(Message);
        message.content = `${Parser.PREFIX}help unknown`;
        message.author =  mock(User);
        message.author.bot = false;
        message.author.send = spy((message: any) => {
            return Promise.resolve(message);
        });

        broker.onMessage(message);
        return expect(message.author.send).to.have.been.calledOnce;
    });
});