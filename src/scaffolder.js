import {info} from '@travi/cli-messages';
import {scaffold as scaffoldGithub, lift as liftGithub} from '@form8ion/github';

import {factory} from './github-client-factory.js';
import nextStepsAdder from './next-steps.js';

export async function scaffold({name, owner, projectRoot, description, homepage, visibility, tags, nextSteps}) {
  info('Generating GitHub');

  const octokit = factory();

  const creationResult = await scaffoldGithub({name, owner, visibility, projectRoot, description});

  await liftGithub({projectRoot, results: {tags, projectDetails: {homepage}}});

  const nextStepsResult = await nextStepsAdder(octokit, nextSteps, name, owner);

  return {...creationResult, ...nextStepsResult};
}
