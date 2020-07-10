import {createNetrcAuth} from 'octokit-auth-netrc';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as octokit from '../third-party-wrappers/octokit';
import {factory} from './github-client-factory';

suite('github client factory', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(octokit, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the client is authenticated using the token from netrc', () => {
    const instance = any.simpleObject();
    octokit.default.withArgs({authStrategy: createNetrcAuth}).returns(instance);

    assert.equal(factory(), instance);
    assert.calledWithNew(octokit.default);
  });

  test('that no client is returned if no token is available in the netrc', () => {
    const error = new Error();
    error.code = 'ENONETRCTOKEN';
    octokit.default.throws(error);

    assert.isUndefined(factory());
  });

  test('that an error that is unrelated to a missing netrc token is rethrown', () => {
    const error = new Error();
    octokit.default.throws(error);

    assert.throws(() => factory(), error);
  });
});
