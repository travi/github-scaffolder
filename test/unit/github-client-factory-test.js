import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as netrc from '../../third-party-wrappers/netrc';
import * as octokit from '../../third-party-wrappers/octokit';
import {factory} from '../../src/github-client-factory';

suite('github client factory', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(octokit, 'default');
    sandbox.stub(netrc, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the client is authenticated using the token from netrc', () => {
    const token = any.string();
    const instance = any.simpleObject();
    netrc.default.returns({'github.com': {login: token}});
    octokit.default.withArgs({auth: `token ${token}`}).returns(instance);

    assert.equal(factory(), instance);
    assert.calledWithNew(octokit.default);
  });

  test('that no client is returned if no token is available in the netrc', () => {
    netrc.default.returns({});

    assert.isUndefined(factory());
  });
});
