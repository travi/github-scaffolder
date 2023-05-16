import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import * as creator from './create';
import * as clientFactory from './github-client-factory';
import * as nextSteps from './next-steps';
import {scaffold} from './scaffolder';

vi.mock('@form8ion/repository-settings');
vi.mock('./create');
vi.mock('./github-client-factory');
vi.mock('./next-steps');

describe('github', () => {
  const projectRoot = any.string();
  const projectName = any.string();
  const description = any.sentence();
  const homepage = any.url();
  const projectOwner = any.word();
  const visibility = any.word();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should produce the settings file and create the repository', async () => {
    const creationResult = any.simpleObject();
    const nextStepsResult = {nextSteps: any.listOf(any.url)};
    const octokitClient = any.simpleObject();
    const topics = any.listOf(any.word);
    const providedNextSteps = any.listOf(any.simpleObject);
    when(creator.default)
      .calledWith(projectName, projectOwner, visibility, octokitClient)
      .mockResolvedValue(creationResult);
    when(nextSteps.default)
      .calledWith(octokitClient, providedNextSteps, projectName, projectOwner)
      .mockResolvedValue(nextStepsResult);
    clientFactory.factory.mockReturnValue(octokitClient);

    expect(await scaffold({
      projectRoot,
      name: projectName,
      owner: projectOwner,
      description,
      homepage,
      visibility,
      tags: topics,
      nextSteps: providedNextSteps
    })).toEqual({...creationResult, ...nextStepsResult});
  });

  it('should not create the repo if an octokit client is not available', async () => {
    clientFactory.factory.mockReturnValue(undefined);

    expect(await scaffold({
      projectRoot,
      name: projectName,
      owner: projectOwner,
      description,
      homepage,
      visibility
    })).toEqual({});
  });
});
