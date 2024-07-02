import {info} from '@travi/cli-messages';
import {scaffold as scaffoldSettings} from '@form8ion/repository-settings';
import {scaffold as scaffoldGithub} from '@form8ion/github';

import {factory} from './github-client-factory.js';
import nextStepsAdder from './next-steps.js';

export async function scaffold({name, owner, projectRoot, description, homepage, visibility, tags, nextSteps}) {
  info('Generating GitHub');

  const octokit = factory();

  const [, creationResult] = await Promise.all([
    scaffoldSettings({projectRoot, projectName: name, description, homepage, visibility, topics: tags}),
    scaffoldGithub({name, owner, visibility, projectRoot})
  ]);

  const nextStepsResult = await nextStepsAdder(octokit, nextSteps, name, owner);

  return {...creationResult, ...nextStepsResult};
}
