import any from '@travi/any';
import {assert} from 'chai';
import repoIsInList from '../../src/repo-is-in-list';

suite('determine if repo list contains repo by provided name', () => {
  const repos = any.listOf(() => ({...any.simpleObject(), name: any.word()}));

  test('that `true` is returned when a repo by the provided name is found in the list', () => {
    const name = any.word();

    assert.isTrue(repoIsInList(name, [...repos, {...any.simpleObject(), name}]));
  });

  test('that `false` is returned when a repo by the provided name is not found in the list', () => {
    assert.isFalse(repoIsInList(any.word(), repos));
  });
});
