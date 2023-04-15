import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import nextSteps from './next-steps';

describe('next-steps', () => {
  it('should return an empty list when no octokit client is available', async () => {
    expect(await nextSteps()).toEqual({nextSteps: []});
  });

  it('should return an empty list when no next-steps are provided', async () => {
    expect(await nextSteps(any.simpleObject())).toEqual({nextSteps: []});
  });

  it('should return the URLs of the created issues', async () => {
    const issueUrls = any.listOf(any.url);
    const summaries = issueUrls.map(() => any.sentence());
    const descriptions = issueUrls.map(() => any.sentence());
    const create = vi.fn();
    const steps = issueUrls.map((url, index) => ({
      ...any.simpleObject(),
      summary: summaries[index],
      description: descriptions[index]
    }));
    const octokit = {...any.simpleObject(), issues: {create}};
    const repoName = any.word();
    const owner = any.word();
    issueUrls.forEach((url, index) => {
      when(create)
        .calledWith({title: summaries[index], body: descriptions[index], owner, repo: repoName})
        .mockResolvedValue({data: {url}});
    });

    expect(await nextSteps(octokit, steps, repoName, owner)).toEqual({nextSteps: issueUrls});
  });
});
