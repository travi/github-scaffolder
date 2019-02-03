import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import * as settingsSecaffolder from '../../src/settings-scaffolder';
import * as creator from '../../src/create';
import {scaffold} from '../../src/scaffolder';

suite('github', () => {
  let sandbox;
  const projectRoot = any.string();
  const projectName = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(settingsSecaffolder, 'default');
    sandbox.stub(creator, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the settings file is produced and the repository is created', async () => {
    const description = any.sentence();
    const homepage = any.url();
    const projectType = any.word();
    const visibility = any.word();
    const creationResult = any.simpleObject();
    settingsSecaffolder.default.resolves();
    creator.default.withArgs(projectName, visibility).resolves(creationResult);

    assert.equal(
      await scaffold({projectRoot, name: projectName, description, homepage, projectType, visibility}),
      creationResult
    );

    assert.calledWith(
      settingsSecaffolder.default,
      projectRoot,
      projectName,
      description,
      homepage,
      visibility,
      projectType
    );
  });
});
