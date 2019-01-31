import Octokit from '../third-party-wrappers/octokit';
import netrc from '../third-party-wrappers/netrc';

export function factory() {
  return new Octokit({auth: `token ${netrc()['github.com'].login}`});
}
