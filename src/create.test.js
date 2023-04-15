import {StatusCodes} from 'http-status-codes';

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import create from './create';

describe('creation', () => {
  const sshUrl = any.url();
  const htmlUrl = any.url();
  const repoDetailsResponse = {data: {ssh_url: sshUrl, html_url: htmlUrl}};
  const account = any.word();
  const name = any.word();
  const fetchFailureError = new Error('fetching the repo failed');
  const repoNotFoundError = new Error('Repo not found in test');

  repoNotFoundError.status = StatusCodes.NOT_FOUND;

  describe('for user', () => {
    let getAuthenticated;

    beforeEach(() => {
      getAuthenticated = vi.fn();

      getAuthenticated.mockResolvedValue({data: {login: account}});
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should create the repository for the provided user account', async () => {
      const createForAuthenticatedUser = vi.fn();
      const get = vi.fn();
      const client = {repos: {createForAuthenticatedUser, get}, users: {getAuthenticated}};
      when(createForAuthenticatedUser).calledWith({name, private: false}).mockResolvedValue(repoDetailsResponse);
      get.mockImplementation(() => {
        throw repoNotFoundError;
      });

      expect(await create(name, account, 'Public', client)).toEqual({sshUrl, htmlUrl});
    });

    it('should not create the repository when it already exists', async () => {
      const createForAuthenticatedUser = vi.fn();
      const get = vi.fn();
      const client = {repos: {createForAuthenticatedUser, get}, users: {getAuthenticated}};
      when(get).calledWith({owner: account, repo: name}).mockResolvedValue(repoDetailsResponse);

      expect(await create(name, account, 'Public', client)).toEqual({sshUrl, htmlUrl});
      expect(createForAuthenticatedUser).not.toHaveBeenCalled();
    });

    it('should create the repository as private when visibility is `Private`', async () => {
      const createForAuthenticatedUser = vi.fn();
      const get = vi.fn();
      const client = {repos: {createForAuthenticatedUser, get}, users: {getAuthenticated}};
      when(createForAuthenticatedUser).calledWith({name, private: true}).mockResolvedValue(repoDetailsResponse);
      get.mockImplementation(() => {
        throw repoNotFoundError;
      });

      expect(await create(name, account, 'Private', client)).toEqual({sshUrl, htmlUrl});
    });

    it('should rethrow other errors', async () => {
      const get = vi.fn();
      const client = {repos: {get}, users: {getAuthenticated}};
      get.mockImplementation(() => {
        throw fetchFailureError;
      });

      await expect(create(name, account, 'Private', client)).rejects.toThrowError(fetchFailureError);
    });
  });

  describe('for organization', () => {
    let getAuthenticated, listForAuthenticatedUser;

    beforeEach(() => {
      getAuthenticated = vi.fn();
      listForAuthenticatedUser = vi.fn();

      getAuthenticated.mockResolvedValue({data: {login: any.word()}});
      listForAuthenticatedUser.mockResolvedValue({
        data: [
          ...any.listOf(() => ({...any.simpleObject(), login: any.word})),
          {...any.simpleObject(), login: account}
        ]
      });
    });

    it('should create the repository for the provided organization account', async () => {
      const createInOrg = vi.fn();
      const get = vi.fn();
      const client = {repos: {createInOrg, get}, users: {getAuthenticated}, orgs: {listForAuthenticatedUser}};
      when(createInOrg).calledWith({org: account, name, private: false}).mockResolvedValue(repoDetailsResponse);
      get.mockImplementation(() => {
        throw repoNotFoundError;
      });

      expect(await create(name, account, 'Public', client)).toEqual({sshUrl, htmlUrl});
    });

    it('should not create the repository when it already exists', async () => {
      const createInOrg = vi.fn();
      const get = vi.fn();
      const client = {repos: {createInOrg, get}, users: {getAuthenticated}, orgs: {listForAuthenticatedUser}};
      when(get).calledWith({owner: account, repo: name}).mockResolvedValue(repoDetailsResponse);

      expect(await create(name, account, 'Public', client)).toEqual({sshUrl, htmlUrl});
      expect(createInOrg).not.toHaveBeenCalled();
    });

    it('should create the repository as private when visibility is `Private`', async () => {
      const createInOrg = vi.fn();
      const get = vi.fn();
      const client = {repos: {createInOrg, get}, users: {getAuthenticated}, orgs: {listForAuthenticatedUser}};
      when(createInOrg).calledWith({org: account, name, private: true}).mockResolvedValue(repoDetailsResponse);
      get.mockImplementation(() => {
        throw repoNotFoundError;
      });

      expect(await create(name, account, 'Private', client)).toEqual({sshUrl, htmlUrl});
    });

    it('should rethrow other errors', async () => {
      const get = vi.fn();
      const client = {repos: {get}, users: {getAuthenticated}, orgs: {listForAuthenticatedUser}};
      get.mockImplementation(() => {
        throw fetchFailureError;
      });

      await expect(create(name, account, 'Private', client)).rejects.toThrowError(fetchFailureError);
    });
  });

  describe('unauthorized account', () => {
    it('should throw an error if the authenticated user does not have access to the requested account', async () => {
      const authenticatedUser = any.word();
      const getAuthenticated = vi.fn();
      const listForAuthenticatedUser = vi.fn();
      const client = {users: {getAuthenticated}, orgs: {listForAuthenticatedUser}};
      getAuthenticated.mockResolvedValue({data: {login: authenticatedUser}});
      listForAuthenticatedUser.mockResolvedValue({data: any.listOf(() => ({...any.simpleObject(), login: any.word}))});

      await expect(create(name, account, any.word(), client)).rejects.toThrowError(
        `User ${authenticatedUser} does not have access to create a repository in the ${account} account`
      );
    });
  });
});
