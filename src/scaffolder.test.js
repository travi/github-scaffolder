import {scaffold as scaffoldGithub, lift as liftGithub} from '@form8ion/github';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

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
    const liftResult = any.simpleObject();
    const topics = any.listOf(any.word);
    const providedNextSteps = any.listOf(any.simpleObject);
    when(scaffoldGithub)
      .calledWith({name: projectName, owner: projectOwner, visibility, projectRoot, description})
      .mockResolvedValue(creationResult);
    when(liftGithub)
      .calledWith({
        projectRoot,
        results: {tags: topics, projectDetails: {homepage}, nextSteps: providedNextSteps},
        vcs: {owner: projectOwner, name: projectName}
      })
      .mockResolvedValue(liftResult);

    expect(await scaffold({
      projectRoot,
      name: projectName,
      owner: projectOwner,
      description,
      homepage,
      visibility,
      tags: topics,
      nextSteps: providedNextSteps
    })).toEqual({...creationResult, ...liftResult});
  });
});
