import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import * as settingsSecaffolder from '../../src/settings-scaffolder';
import {scaffold} from '../../src/scaffolder';

suite('github', () => {
  let sandbox;
  const projectRoot = any.string();
  const projectName = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(settingsSecaffolder, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the settings file is produced', async () => {
    const description = any.sentence();
    const homepage = any.url();
    const vcs = {name: projectName};
    const projectType = any.word();
    const visibility = any.word();
    settingsSecaffolder.default.resolves();

    await scaffold({projectRoot, vcs, description, homepage, projectType, visibility});

    assert.calledWith(settingsSecaffolder.default, projectRoot, vcs, description, homepage, visibility, projectType);
  });
});
