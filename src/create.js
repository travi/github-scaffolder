import chalk from 'chalk';
import {factory} from './github-client-factory';

export default async function (name, visibility) {
  console.error(chalk.grey('Creating repository on GitHub'));           // eslint-disable-line no-console

  const {ssh_url: sshUrl, html_url: htmlUrl} = await factory().repos.createForAuthenticatedUser({
    name,
    private: 'Private' === visibility
  });

  console.error(chalk.grey(`Repository created at ${htmlUrl}`));        // eslint-disable-line no-console

  return {sshUrl, htmlUrl};
}
