import Octokit from '../third-party-wrappers/octokit';
import netrc from '../third-party-wrappers/netrc';

export function factory() {
  const personalAccessToken = netrc()['github.com'].login;

  return new Octokit({auth: `token ${personalAccessToken}`});
}
