import chalk from 'chalk';
import writeYaml from '../third-party-wrappers/write-yaml';

export function scaffold({projectRoot, projectName, projectType, description, homepage, visibility}) {
  console.log(chalk.blue('Generating GitHub'));     // eslint-disable-line no-console

  return writeYaml(`${projectRoot}/.github/settings.yml`, {
    repository: {
      name: projectName,
      description,
      homepage,
      private: 'Public' !== visibility,
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
      {name: 'breaking change', color: 'e0fc28'},
      ('JavaScript' === projectType) ? {name: 'greenkeeper', color: '00c775'} : undefined
    ].filter(Boolean),
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
  });
}
