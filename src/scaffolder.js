import chalk from 'chalk';
import scaffoldSettings from './settings-scaffolder';
import create from './create';
import {factory} from './github-client-factory';

export async function scaffold({name, owner, projectRoot, projectType, description, homepage, visibility}) {
  console.error(chalk.blue('Generating GitHub'));     // eslint-disable-line no-console

  const octokit = factory();

  const [, creationResult] = await Promise.all([
    scaffoldSettings(projectRoot, name, description, homepage, visibility, projectType),
    ...octokit ? [create(name, owner, visibility, octokit)] : []
  ]);

  return {...creationResult};
}
