import chalk from 'chalk';
import scaffoldSettings from './settings-scaffolder';

export function scaffold({name, projectRoot, projectType, description, homepage, visibility}) {
  console.log(chalk.blue('Generating GitHub'));     // eslint-disable-line no-console

  return scaffoldSettings(projectRoot, name, description, homepage, visibility, projectType);
}
