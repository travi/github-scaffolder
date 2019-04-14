import chalk from 'chalk';
import {info, warning} from 'log-symbols';
import Octokit from '../third-party-wrappers/octokit';
import netrc from '../third-party-wrappers/netrc';

function getPersonalAccessTokenFromNetRc() {
  // eslint-disable-next-line no-console
  console.error(info, chalk.grey('Getting GitHub Personal Access Token from ~/.netrc'));

  const githubNetrcElement = netrc()['github.com'];

  if (githubNetrcElement) return githubNetrcElement.login;

  // eslint-disable-next-line no-console
  console.error(warning, chalk.keyword('orange')('No GitHub Personal Access Token available in ~/.netrc'));

  return undefined;
}

export function factory() {
  const personalAccessToken = getPersonalAccessTokenFromNetRc();

  if (personalAccessToken) return new Octokit({auth: `token ${personalAccessToken}`});

  return undefined;
}
