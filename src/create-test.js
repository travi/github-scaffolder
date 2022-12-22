import {StatusCodes} from 'http-status-codes';

import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';

import create from './create';

suite('creation', () => {
  const sshUrl = any.url();
  const htmlUrl = any.url();
  const repoDetailsResponse = {data: {ssh_url: sshUrl, html_url: htmlUrl}};
  const account = any.word();
  const name = any.word();
  const fetchFailureError = new Error('fetching the repo failed');
  const repoNotFoundError = new Error('Repo not found in test');

  repoNotFoundError.status = StatusCodes.NOT_FOUND;

  suite('for user', () => {
    let getAuthenticated;

    setup(() => {
      getAuthenticated = sinon.stub();

      getAuthenticated.resolves({data: {login: account}});
    });

    test('that the repository is created for the provided user account', async () => {
      const createForAuthenticatedUser = sinon.stub();
      const get = sinon.stub();
      const client = {repos: {createForAuthenticatedUser, get}, users: {getAuthenticated}};
      createForAuthenticatedUser.withArgs({name, private: false}).resolves(repoDetailsResponse);
      get.throws(repoNotFoundError);

      assert.deepEqual(await create(name, account, 'Public', client), {sshUrl, htmlUrl});
    });

    test('that the repository is not created when it already exists', async () => {
      const createForAuthenticatedUser = sinon.stub();
      const get = sinon.stub();
      const client = {repos: {createForAuthenticatedUser, get}, users: {getAuthenticated}};
      get.withArgs({owner: account, repo: name}).resolves(repoDetailsResponse);

      assert.deepEqual(await create(name, account, 'Public', client), {sshUrl, htmlUrl});
      assert.notCalled(createForAuthenticatedUser);
    });

    test('that the repository is created as private when visibility is `Private`', async () => {
      const createForAuthenticatedUser = sinon.stub();
      const get = sinon.stub();
      const client = {repos: {createForAuthenticatedUser, get}, users: {getAuthenticated}};
      createForAuthenticatedUser.withArgs({name, private: true}).resolves(repoDetailsResponse);
      get.throws(repoNotFoundError);

      assert.deepEqual(await create(name, account, 'Private', client), {sshUrl, htmlUrl});
    });

    test('that other errors are rethrown', async () => {
      const get = sinon.stub();
      const client = {repos: {get}, users: {getAuthenticated}};
      get.throws(fetchFailureError);

      try {
        await create(name, account, 'Private', client);

        throw new Error('an error should have been thrown');
      } catch (e) {
        assert.equal(e, fetchFailureError);
      }
    });
  });

  suite('for organization', () => {
    let getAuthenticated, listForAuthenticatedUser;

    setup(() => {
      getAuthenticated = sinon.stub();
      listForAuthenticatedUser = sinon.stub();

      getAuthenticated.resolves({data: {login: any.word()}});
      listForAuthenticatedUser
        .resolves({
          data: [
            ...any.listOf(() => ({...any.simpleObject(), login: any.word})),
            {...any.simpleObject(), login: account}
          ]
        });
    });

    test('that the repository is created for the provided organization account', async () => {
      const createInOrg = sinon.stub();
      const get = sinon.stub();
      const client = {repos: {createInOrg, get}, users: {getAuthenticated}, orgs: {listForAuthenticatedUser}};
      createInOrg.withArgs({org: account, name, private: false}).resolves(repoDetailsResponse);
      get.throws(repoNotFoundError);

      assert.deepEqual(await create(name, account, 'Public', client), {sshUrl, htmlUrl});
    });

    test('that the repository is not created when it already exists', async () => {
      const createInOrg = sinon.stub();
      const get = sinon.stub();
      const client = {
        repos: {createInOrg, get},
        users: {getAuthenticated},
        orgs: {listForAuthenticatedUser}
      };
      get.withArgs({owner: account, repo: name}).resolves(repoDetailsResponse);

      assert.deepEqual(await create(name, account, 'Public', client), {sshUrl, htmlUrl});
      assert.notCalled(createInOrg);
    });

    test('that the repository is created as private when visibility is `Private`', async () => {
      const createInOrg = sinon.stub();
      const get = sinon.stub();
      const client = {repos: {createInOrg, get}, users: {getAuthenticated}, orgs: {listForAuthenticatedUser}};
      createInOrg.withArgs({org: account, name, private: true}).resolves(repoDetailsResponse);
      get.throws(repoNotFoundError);

      assert.deepEqual(await create(name, account, 'Private', client), {sshUrl, htmlUrl});
    });

    test('that other errors are rethrown', async () => {
      const get = sinon.stub();
      const client = {repos: {get}, users: {getAuthenticated}, orgs: {listForAuthenticatedUser}};
      get.throws(fetchFailureError);

      try {
        await create(name, account, 'Private', client);

        throw new Error('an error should have been thrown');
      } catch (e) {
        assert.equal(e, fetchFailureError);
      }
    });
  });

  suite('unauthorized account', () => {
    test('that an error is thrown if the authenticated user does not have access to the requested account', () => {
      const authenticatedUser = any.word();
      const getAuthenticated = sinon.stub();
      const listForAuthenticatedUser = sinon.stub();
      const client = {users: {getAuthenticated}, orgs: {listForAuthenticatedUser}};
      getAuthenticated.resolves({data: {login: authenticatedUser}});
      listForAuthenticatedUser.resolves({data: any.listOf(() => ({...any.simpleObject(), login: any.word}))});

      return assert.isRejected(
        create(name, account, any.word(), client),
        `User ${authenticatedUser} does not have access to create a repository in the ${account} account`
      );
    });
  });
});
