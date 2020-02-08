import gitConfig from 'git-config';
import * as prompts from '@form8ion/overridable-prompts';
import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import {prompt} from './prompt';

suite('prompt', () => {
  let sandbox;
  const githubUser = any.word();
  const answers = any.listOf(any.string);
  const decisions = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(prompts, 'prompt');
    sandbox.stub(gitConfig, 'sync');
  });

  teardown(() => sandbox.restore());

  test('that the options are optional', async () => {
    gitConfig.sync.returns({github: {user: githubUser}});
    prompts.prompt.resolves(answers);

    assert.equal(await prompt(), answers);
  });

  test('that the github user is provided as the default owner value if available in the global config', async () => {
    gitConfig.sync.returns({github: {user: githubUser}});
    prompts.prompt
      .withArgs([
        {
          name: 'repoOwner',
          message: 'What is the id of the repository owner?',
          default: githubUser
        }
      ], decisions)
      .resolves(answers);

    assert.equal(await prompt({decisions}), answers);
  });

  test('that the github user is not used as the default owner value an override is provided', async () => {
    const account = any.word();
    gitConfig.sync.returns({github: {user: githubUser}});
    prompts.prompt
      .withArgs([
        {
          name: 'repoOwner',
          message: 'What is the id of the repository owner?',
          default: account
        }
      ], decisions)
      .resolves(answers);

    assert.equal(await prompt({account, decisions}), answers);
  });
});
