import * as octokit from '@octokit/rest';
import {createNetrcAuth} from 'octokit-auth-netrc';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import {factory} from './github-client-factory';

vi.mock('@octokit/rest');

describe('github client factory', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should authenticate the client using the token from netrc', () => {
    const instance = any.simpleObject();
    when(octokit.Octokit).calledWith({authStrategy: createNetrcAuth}).mockReturnValue(instance);

    expect(factory()).toBe(instance);
  });

  it('should not return a client if no token is available in the netrc', () => {
    const error = new Error('from test');
    error.code = 'ENONETRCTOKEN';
    octokit.Octokit.mockImplementation(() => {
      throw error;
    });

    expect(factory()).toBeUndefined();
  });

  it('should rethrow an error that is unrelated to a missing netrc token', () => {
    const error = new Error('from test');
    octokit.Octokit.mockImplementation(() => {
      throw error;
    });

    expect(() => factory()).toThrowError(error);
  });
});
