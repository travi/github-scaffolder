import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import * as yamlWriter from '../../third-party-wrappers/write-yaml';
import scaffoldSettings from '../../src/settings-scaffolder';

suite('settings', () => {
  let sandbox;
  const projectRoot = any.string();
  const projectName = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(yamlWriter, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the settings file is produced', async () => {
    const description = any.sentence();
    const homepage = any.url();
    yamlWriter.default.resolves();

    await scaffoldSettings(projectRoot, projectName, description, homepage);

    assert.calledWith(
      yamlWriter.default,
      `${projectRoot}/.github/settings.yml`,
      {
        repository: {
          name: projectName,
          description,
          homepage,
          private: true,
          has_wiki: false,
          has_projects: false,
          has_downloads: false,
          allow_squash_merge: false,
          allow_merge_commit: true,
          allow_rebase_merge: true
        },
        labels: [
          {name: 'bug', color: 'ee0701'},
          {name: 'duplicate', color: 'cccccc'},
          {name: 'enhancement', color: '84b6eb'},
          {name: 'help wanted', color: '128A0C'},
          {name: 'invalid', color: 'e6e6e6'},
          {name: 'question', color: 'cc317c'},
          {name: 'wontfix', color: 'ffffff'},
          {name: 'breaking change', color: 'e0fc28'}
        ],
        branches: [
          {
            name: 'master',
            protection: {
              required_pull_request_reviews: null,
              required_status_checks: null,
              restrictions: null,
              enforce_admins: true
            }
          }
        ]
      }
    );
  });

  test('that the greenkeeper label is defined for javascript projects', async () => {
    yamlWriter.default.resolves();

    await scaffoldSettings(projectRoot, {}, null, null, null, 'JavaScript');

    assert.calledWith(
      yamlWriter.default,
      `${projectRoot}/.github/settings.yml`,
      sinon.match({
        labels: [
          {name: 'bug', color: 'ee0701'},
          {name: 'duplicate', color: 'cccccc'},
          {name: 'enhancement', color: '84b6eb'},
          {name: 'help wanted', color: '128A0C'},
          {name: 'invalid', color: 'e6e6e6'},
          {name: 'question', color: 'cc317c'},
          {name: 'wontfix', color: 'ffffff'},
          {name: 'breaking change', color: 'e0fc28'},
          {name: 'greenkeeper', color: '00c775'}
        ]
      })
    );
  });

  test('that the repository is marked as private when the visibility is `Private`', async () => {
    yamlWriter.default.resolves();

    await scaffoldSettings(projectRoot, {}, null, null, 'Private', any.word());

    assert.calledWith(
      yamlWriter.default,
      `${projectRoot}/.github/settings.yml`,
      sinon.match({repository: {private: true}})
    );
  });

  test('that the repository is marked as not private when the visibility is `Public`', async () => {
    yamlWriter.default.resolves();

    await scaffoldSettings(projectRoot, {}, null, null, 'Public', any.word());

    assert.calledWith(
      yamlWriter.default,
      `${projectRoot}/.github/settings.yml`,
      sinon.match({repository: {private: false}})
    );
  });

  test('that the repository is marked as private when the visibility is not specified', async () => {
    yamlWriter.default.resolves();

    await scaffoldSettings(projectRoot, {}, null, null, null, any.word());

    assert.calledWith(
      yamlWriter.default,
      `${projectRoot}/.github/settings.yml`,
      sinon.match({repository: {private: true}})
    );
  });
});
