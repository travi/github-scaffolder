import {info} from '@travi/cli-messages';
import {scaffold as scaffoldSettings} from '@form8ion/repository-settings';

import create from './create';
import {factory} from './github-client-factory';
import nextStepsAdder from './next-steps';

export async function scaffold({name, owner, projectRoot, description, homepage, visibility, tags, nextSteps}) {
  info('Generating GitHub');

  const octokit = factory();

  const [, creationResult] = await Promise.all([
    scaffoldSettings({projectRoot, projectName: name, description, homepage, visibility, topics: tags}),
    ...octokit ? [create(name, owner, visibility, octokit)] : []
  ]);

  const nextStepsResult = await nextStepsAdder(octokit, nextSteps, name, owner);

  return {...creationResult, ...nextStepsResult};
}
