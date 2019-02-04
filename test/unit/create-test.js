import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as clientFactory from '../../src/github-client-factory';
import create from '../../src/create';

suite('creation', () => {
  let sandbox;
  const sshUrl = any.url();
  const htmlUrl = any.url();
  const creationResponse = {data: {ssh_url: sshUrl, html_url: htmlUrl}};

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(clientFactory, 'factory');
  });

  teardown(() => sandbox.restore());

  suite('for user', () => {
    test('that the repository is created for the provided user account', async () => {
      const name = any.word();
      const createForAuthenticatedUser = sinon.stub();
      const client = {repos: {createForAuthenticatedUser}};
      clientFactory.factory.returns(client);
      createForAuthenticatedUser.withArgs({name, private: false}).resolves(creationResponse);

      assert.deepEqual(await create(name, 'Public'), {sshUrl, htmlUrl});
    });

    test('that the repository is created as private when visibility is `Private`', async () => {
      const name = any.word();
      const createForAuthenticatedUser = sinon.stub();
      const client = {repos: {createForAuthenticatedUser}};
      clientFactory.factory.returns(client);
      createForAuthenticatedUser.withArgs({name, private: true}).resolves(creationResponse);

      assert.deepEqual(await create(name, 'Private'), {sshUrl, htmlUrl});
    });
  });
});
