import {assert} from 'chai';
import nextSteps from './next-steps';

suite('next-steps', () => {
  test('that an empty list is returned when no octokit client is available', async () => {
    assert.deepEqual(await nextSteps(), {nextSteps: []});
  });
});
