import gitConfig from 'git-config';
import * as prompts from '@form8ion/overridable-prompts';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import {prompt} from './prompt';

vi.mock('git-config');
vi.mock('@form8ion/overridable-prompts');

describe('prompt', () => {
  const githubUser = any.word();
  const answers = any.listOf(any.string);
  const decisions = any.simpleObject();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should consider options to be optional', async () => {
    gitConfig.sync.mockReturnValue({github: {user: githubUser}});
    prompts.prompt.mockResolvedValue(answers);

    expect(await prompt()).toEqual(answers);
  });

  it('should provide the github user as the default owner value if available in the global config', async () => {
    gitConfig.sync.mockReturnValue({github: {user: githubUser}});
    when(prompts.prompt).calledWith([
      {
        name: 'repoOwner',
        message: 'What is the id of the repository owner?',
        default: githubUser
      }
    ], decisions).mockResolvedValue(answers);

    expect(await prompt({decisions})).toEqual(answers);
  });

  it('should provide the github user as the default owner value if available in the global config', async () => {
    const account = any.word();
    gitConfig.sync.mockReturnValue({github: {user: githubUser}});
    when(prompts.prompt).calledWith([
      {
        name: 'repoOwner',
        message: 'What is the id of the repository owner?',
        default: account
      }
    ], decisions).mockResolvedValue(answers);

    expect(await prompt({decisions, account})).toEqual(answers);
  });
});
