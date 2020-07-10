import {createNetrcAuth} from 'octokit-auth-netrc';
import {info, warn} from '@travi/cli-messages';
import Octokit from '../third-party-wrappers/octokit';

export function factory() {
  try {
    info('Getting GitHub Personal Access Token from ~/.netrc', {level: 'secondary'});

    return new Octokit({authStrategy: createNetrcAuth});
  } catch (e) {
    if ('ENONETRCTOKEN' !== e.code) throw e;

    warn('No GitHub Personal Access Token available in ~/.netrc');
    info(
      'Make your token available with the steps described at '
      + 'https://github.com/travi/github-scaffolder#enabling-actions-against-the-github-api'
    );

    return undefined;
  }
}
