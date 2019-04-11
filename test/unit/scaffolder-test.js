import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import * as settingsScaffolder from '../../src/settings-scaffolder';
import * as creator from '../../src/create';
import * as clientFactory from '../../src/github-client-factory';
import {scaffold} from '../../src/scaffolder';

suite('github', () => {
  let sandbox;
  const projectRoot = any.string();
  const projectName = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(settingsScaffolder, 'default');
    sandbox.stub(creator, 'default');
    sandbox.stub(clientFactory, 'factory');
  });

  teardown(() => sandbox.restore());

  test('that the settings file is produced and the repository is created', async () => {
    const description = any.sentence();
    const homepage = any.url();
    const projectType = any.word();
    const projectOwner = any.word();
    const visibility = any.word();
    const creationResult = any.simpleObject();
    const octokitClient = any.simpleObject();
    settingsScaffolder.default.resolves();
    creator.default.withArgs(projectName, projectOwner, visibility, octokitClient).resolves(creationResult);
    clientFactory.factory.returns(octokitClient);

    assert.equal(
      await scaffold({
        projectRoot,
        name: projectName,
        owner: projectOwner,
        description,
        homepage,
        projectType,
        visibility
      }),
      creationResult
    );

    assert.calledWith(
      settingsScaffolder.default,
      projectRoot,
      projectName,
      description,
      homepage,
      visibility,
      projectType
    );
  });
});
