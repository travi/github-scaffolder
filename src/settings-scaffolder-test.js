import {promises as fs} from 'fs';
import jsYaml from 'js-yaml';
import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import * as mkdir from '../third-party-wrappers/make-dir';
import scaffoldSettings from './settings-scaffolder';

suite('settings', () => {
  let sandbox;
  const projectRoot = any.string();
  const projectName = any.string();
  const dumpedYaml = any.string();
  const pathToCreatedGithubDirectory = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
    sandbox.stub(jsYaml, 'dump');
    sandbox.stub(mkdir, 'default');

    mkdir.default.withArgs(`${projectRoot}/.github`).resolves(pathToCreatedGithubDirectory);
  });

  teardown(() => sandbox.restore());

  test('that the settings file is produced', async () => {
    const description = any.sentence();
    const homepage = any.url();
    const topics = any.listOf(any.word);
    jsYaml.dump
      .withArgs({
        _extends: '.github',
        repository: {name: projectName, description, homepage, private: true, topics: topics.join(', ')}
      })
      .returns(dumpedYaml);

    await scaffoldSettings({projectRoot, projectName, description, homepage, topics});

    assert.calledWith(fs.writeFile, `${pathToCreatedGithubDirectory}/settings.yml`, dumpedYaml);
  });

  test('that the repository is marked as private when the visibility is `Private`', async () => {
    jsYaml.dump.withArgs(sinon.match({repository: {private: true}})).returns(dumpedYaml);

    await scaffoldSettings({projectRoot, visibility: 'Private'});

    assert.calledWith(fs.writeFile, `${pathToCreatedGithubDirectory}/settings.yml`, dumpedYaml);
  });

  test('that the repository is marked as not private when the visibility is `Public`', async () => {
    jsYaml.dump.withArgs(sinon.match({repository: {private: false}})).returns(dumpedYaml);

    await scaffoldSettings({projectRoot, visibility: 'Public'});

    assert.calledWith(fs.writeFile, `${pathToCreatedGithubDirectory}/settings.yml`, dumpedYaml);
  });

  test('that the repository is marked as private when the visibility is not specified', async () => {
    jsYaml.dump.withArgs(sinon.match({repository: {private: true}})).returns(dumpedYaml);

    await scaffoldSettings({projectRoot});

    assert.calledWith(fs.writeFile, `${pathToCreatedGithubDirectory}/settings.yml`, dumpedYaml);
  });
});
