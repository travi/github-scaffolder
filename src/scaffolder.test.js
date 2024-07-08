import {scaffold as scaffoldGithub, lift as liftGithub} from '@form8ion/github';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import * as clientFactory from './github-client-factory.js';
import * as nextSteps from './next-steps.js';
import {scaffold} from './scaffolder.js';

vi.mock('@form8ion/repository-settings');
vi.mock('@form8ion/github');
vi.mock('./github-client-factory.js');
vi.mock('./next-steps.js');

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
    when(scaffoldGithub)
      .calledWith({name: projectName, owner: projectOwner, visibility, projectRoot, description})
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
    expect(liftGithub)
      .toHaveBeenCalledWith({projectRoot, results: {tags: topics, projectDetails: {homepage}}});
  });
});
