import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import * as settingsScaffolder from './settings-scaffolder';
import * as creator from './create';
import * as clientFactory from './github-client-factory';
import * as nextSteps from './next-steps';
import {scaffold} from './scaffolder';

suite('github', () => {
  let sandbox;
  const projectRoot = any.string();
  const projectName = any.string();
  const description = any.sentence();
  const homepage = any.url();
  const projectOwner = any.word();
  const visibility = any.word();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(settingsScaffolder, 'default');
    sandbox.stub(creator, 'default');
    sandbox.stub(clientFactory, 'factory');
    sandbox.stub(nextSteps, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the settings file is produced and the repository is created', async () => {
    const creationResult = any.simpleObject();
    const nextStepsResult = {nextSteps: any.listOf(any.url)};
    const octokitClient = any.simpleObject();
    const topics = any.listOf(any.word);
    const providedNextSteps = any.listOf(any.simpleObject);
    settingsScaffolder.default.resolves();
    creator.default.withArgs(projectName, projectOwner, visibility, octokitClient).resolves(creationResult);
    clientFactory.factory.returns(octokitClient);
    nextSteps.default.withArgs(octokitClient, providedNextSteps).resolves(nextStepsResult);

    assert.deepEqual(
      await scaffold({
        projectRoot,
        name: projectName,
        owner: projectOwner,
        description,
        homepage,
        visibility,
        tags: topics,
        nextSteps: providedNextSteps
      }),
      {...creationResult, ...nextStepsResult}
    );
    assert.calledWith(
      settingsScaffolder.default,
      {projectRoot, projectName, description, homepage, visibility, topics}
    );
  });

  test('that the repo is not created if an octokit client is not available', async () => {
    clientFactory.factory.returns(undefined);

    assert.deepEqual(
      await scaffold({
        projectRoot,
        name: projectName,
        owner: projectOwner,
        description,
        homepage,
        visibility
      }),
      {}
    );
  });
});
