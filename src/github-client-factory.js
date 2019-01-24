import octokitFactory from '../third-party-wrappers/octokit';
import netrc from '../third-party-wrappers/netrc';

export function factory() {
  const instance = octokitFactory();
  instance.authenticate({type: 'token', token: netrc()['github.com'].login});

  return instance;
}
