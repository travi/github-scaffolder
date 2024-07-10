import {scaffold as scaffoldGithub, lift as liftGithub} from '@form8ion/github';

export async function scaffold({name, owner, projectRoot, description, homepage, visibility, tags, nextSteps}) {
  const creationResult = await scaffoldGithub({name, owner, visibility, projectRoot, description});

  const liftResult = await liftGithub({
    projectRoot,
    results: {tags, projectDetails: {homepage}, nextSteps},
    vcs: {name, owner}
  });

  return {...creationResult, ...liftResult};
}
