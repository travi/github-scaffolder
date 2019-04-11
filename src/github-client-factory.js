import chalk from 'chalk';
import Octokit from '../third-party-wrappers/octokit';
import netrc from '../third-party-wrappers/netrc';

function getPersonalAccessTokenFromNetRc() {
  console.error(chalk.grey('Getting GitHub Personal Access Token from ~/.netrc'));    // eslint-disable-line no-console

  const githubNetrcElement = netrc()['github.com'];

  if (githubNetrcElement) return githubNetrcElement.login;

  console.error(chalk.grey('No GitHub Personal Access Token available in ~/.netrc')); // eslint-disable-line no-console

  return undefined;
}

export function factory() {
  const personalAccessToken = getPersonalAccessTokenFromNetRc();

  if (personalAccessToken) return new Octokit({auth: `token ${personalAccessToken}`});

  return undefined;
}
