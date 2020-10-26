import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import nextSteps from './next-steps';

suite('next-steps', () => {
  test('that an empty list is returned when no octokit client is available', async () => {
    assert.deepEqual(await nextSteps(), {nextSteps: []});
  });

  test('that an empty list is returned when no next-steps are provided', async () => {
    assert.deepEqual(await nextSteps(any.simpleObject()), {nextSteps: []});
  });

  test('that the urls of the created issues are returned', async () => {
    const issueUrls = any.listOf(any.url);
    const summaries = issueUrls.map(() => any.sentence());
    const descriptions = issueUrls.map(() => any.sentence());
    const create = sinon.stub();
    const steps = issueUrls.map((url, index) => ({
      ...any.simpleObject(),
      summary: summaries[index],
      description: descriptions[index]
    }));
    const octokit = {...any.simpleObject(), issues: {create}};
    const repoName = any.word();
    const owner = any.word();
    issueUrls.forEach((url, index) => {
      create
        .withArgs({title: summaries[index], body: descriptions[index], owner, repo: repoName})
        .resolves({data: {url}});
    });

    assert.deepEqual(await nextSteps(octokit, steps, repoName, owner), {nextSteps: issueUrls});
  });
});
