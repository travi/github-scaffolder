import {factory} from './github-client-factory';

export default function (name, visibility) {
  factory().repos.createForAuthenticatedUser({name, private: 'Private' === visibility});
}
