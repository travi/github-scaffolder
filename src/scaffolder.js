import chalk from 'chalk';
import scaffoldSettings from './settings-scaffolder';
import create from './create';

export function scaffold({name, projectRoot, projectType, description, homepage, visibility}) {
  console.error(chalk.blue('Generating GitHub'));     // eslint-disable-line no-console

  return Promise.all([
    scaffoldSettings(projectRoot, name, description, homepage, visibility, projectType),
    create(name, visibility)
  ]);
}
