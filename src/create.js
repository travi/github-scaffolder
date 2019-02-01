import {factory} from './github-client-factory';

export default function (name, visibility) {
  return factory().repos.createForAuthenticatedUser({name, private: 'Private' === visibility});
}
