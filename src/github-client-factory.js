import {info, warn} from '@travi/cli-messages';
import Octokit from '../third-party-wrappers/octokit';
import netrc from '../third-party-wrappers/netrc';

function getPersonalAccessTokenFromNetRc() {
  info('Getting GitHub Personal Access Token from ~/.netrc', {level: 'secondary'});

  const githubNetrcElement = netrc()['github.com'];

  if (githubNetrcElement) return githubNetrcElement.login;

  warn('No GitHub Personal Access Token available in ~/.netrc');
  info(
    'Make your token available with the steps described at ' +
    'https://github.com/travi/github-scaffolder#enabling-actions-against-the-github-api'
  );

  return undefined;
}

export function factory() {
  const personalAccessToken = getPersonalAccessTokenFromNetRc();

  if (personalAccessToken) return new Octokit({auth: `token ${personalAccessToken}`});

  return undefined;
}
