import chalk from 'chalk';
import {factory} from './github-client-factory';

export default function (name, visibility) {
  console.error(chalk.grey('Creating repository on GitHub'));      // eslint-disable-line no-console

  return factory().repos.createForAuthenticatedUser({name, private: 'Private' === visibility});
}
