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
  const account = any.word();
  const name = any.word();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(clientFactory, 'factory');
  });

  teardown(() => sandbox.restore());

  suite('for user', () => {
    test('that the repository is created for the provided user account', async () => {
      const createForAuthenticatedUser = sinon.stub();
      const getAuthenticated = sinon.stub();
      const client = {repos: {createForAuthenticatedUser}, users: {getAuthenticated}};
      clientFactory.factory.returns(client);
      createForAuthenticatedUser.withArgs({name, private: false}).resolves(creationResponse);
      getAuthenticated.resolves({data: {login: account}});

      assert.deepEqual(await create(name, account, 'Public'), {sshUrl, htmlUrl});
    });

    test('that the repository is created as private when visibility is `Private`', async () => {
      const createForAuthenticatedUser = sinon.stub();
      const getAuthenticated = sinon.stub();
      const client = {repos: {createForAuthenticatedUser}, users: {getAuthenticated}};
      clientFactory.factory.returns(client);
      createForAuthenticatedUser.withArgs({name, private: true}).resolves(creationResponse);
      getAuthenticated.resolves({data: {login: account}});

      assert.deepEqual(await create(name, account, 'Private'), {sshUrl, htmlUrl});
    });
  });

  suite('for organization', () => {
    test('that the repository is created for the provided organization account', async () => {
      const getAuthenticated = sinon.stub();
      const listForAuthenticatedUser = sinon.stub();
      const createInOrg = sinon.stub();
      const client = {repos: {createInOrg}, users: {getAuthenticated}, orgs: {listForAuthenticatedUser}};
      clientFactory.factory.returns(client);
      getAuthenticated.resolves({data: {login: any.word()}});
      listForAuthenticatedUser
        .resolves({
          data: [
            ...any.listOf(() => ({...any.simpleObject(), login: any.word})),
            {...any.simpleObject(), login: account}
          ]
        });
      createInOrg.withArgs({org: account, name, private: false}).resolves(creationResponse);

      assert.deepEqual(await create(name, account, 'Public'), {sshUrl, htmlUrl});
    });

    test('that the repository is created as private when visibility is `Private`', async () => {
      const getAuthenticated = sinon.stub();
      const listForAuthenticatedUser = sinon.stub();
      const createInOrg = sinon.stub();
      const client = {repos: {createInOrg}, users: {getAuthenticated}, orgs: {listForAuthenticatedUser}};
      clientFactory.factory.returns(client);
      getAuthenticated.resolves({data: {login: any.word()}});
      listForAuthenticatedUser
        .resolves({
          data: [
            ...any.listOf(() => ({...any.simpleObject(), login: any.word})),
            {...any.simpleObject(), login: account}
          ]
        });
      createInOrg.withArgs({org: account, name, private: true}).resolves(creationResponse);

      assert.deepEqual(await create(name, account, 'Private'), {sshUrl, htmlUrl});
    });
  });

  suite('unauthorized account', () => {
    test('that an error is thrown if the authenticated user does not have access to the requested account', () => {
      const authenticatedUser = any.word();
      const getAuthenticated = sinon.stub();
      const listForAuthenticatedUser = sinon.stub();
      const client = {users: {getAuthenticated}, orgs: {listForAuthenticatedUser}};
      clientFactory.factory.returns(client);
      getAuthenticated.resolves({data: {login: authenticatedUser}});
      listForAuthenticatedUser.resolves({data: any.listOf(() => ({...any.simpleObject(), login: any.word}))});

      return assert.isRejected(
        create(name, account, any.word()),
        `User ${authenticatedUser} does not have access to create a repository in the ${account} account`
      );
    });
  });
});
