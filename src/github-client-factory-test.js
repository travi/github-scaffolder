import * as octokit from '@octokit/rest';
import {createNetrcAuth} from 'octokit-auth-netrc';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import {factory} from './github-client-factory';

suite('github client factory', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(octokit, 'Octokit');
  });

  teardown(() => sandbox.restore());

  test('that the client is authenticated using the token from netrc', () => {
    const instance = any.simpleObject();
    octokit.Octokit.withArgs({authStrategy: createNetrcAuth}).returns(instance);

    assert.equal(factory(), instance);
    assert.calledWithNew(octokit.Octokit);
  });

  test('that no client is returned if no token is available in the netrc', () => {
    const error = new Error();
    error.code = 'ENONETRCTOKEN';
    octokit.Octokit.throws(error);

    assert.isUndefined(factory());
  });

  test('that an error that is unrelated to a missing netrc token is rethrown', () => {
    const error = new Error();
    octokit.Octokit.throws(error);

    assert.throws(() => factory(), error);
  });
});
