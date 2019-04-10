import chalk from 'chalk';
import scaffoldSettings from './settings-scaffolder';
import create from './create';

export async function scaffold({name, owner, projectRoot, projectType, description, homepage, visibility}) {
  console.error(chalk.blue('Generating GitHub'));     // eslint-disable-line no-console

  const [, creationResult] = await Promise.all([
    scaffoldSettings(projectRoot, name, description, homepage, visibility, projectType),
    create(name, owner, visibility)
  ]);

  return creationResult;
}
