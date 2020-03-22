import 'mocha';

import { use, expect } from 'chai';
import ChaiAsPromised from 'chai-as-promised';

import { spy } from 'sinon';
import * as sinonChai from 'sinon-chai';

import Broker from '../../src/command/broker';

use(ChaiAsPromised);
use(sinonChai.default);

describe('Command broker', () => {
    it('unregistered command is rejected', () => {
        const broker = new Broker();
        return expect(broker.run("unknown")).to.eventually.be.rejected;
    });

    it('registered command is properly forwared with arguments', () => {
        const broker = new Broker();
        const command = spy();

        broker.register('register', command);
        broker.run('register', 'my', 'nickname');
        return expect(command).to.have.been.calledWith('my', 'nickname');
    });
});