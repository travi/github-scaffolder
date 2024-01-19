import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import {scaffold} from '@travi/github-scaffolder';

import {After, Before, When} from '@cucumber/cucumber';
import stubbedFs from 'mock-fs';
import any from '@travi/any';
import debugTest from 'debug';

const __dirname = dirname(fileURLToPath(import.meta.url));        // eslint-disable-line no-underscore-dangle
const pathToNodeModules = [__dirname, '../../../../', 'node_modules/'];
const stubbedNodeModules = stubbedFs.load(resolve(...pathToNodeModules));
const debug = debugTest('test');

Before(function () {
  this.projectName = any.word();
  this.projectDescription = any.sentence();
  this.projectHomepage = any.url();
  this.projectVisibility = any.fromList(['Public', 'Private']);
  this.topics = any.listOf(any.word);
});

After(function () {
  stubbedFs.restore();
});

When('the project is scaffolded', async function () {
  stubbedFs({
    ...this.netrcContent && {[`${process.env.HOME}/.netrc`]: this.netrcContent},
    [`${process.env.HOME}/.gitconfig`]: `[github]\n\tuser = ${this.githubUser}`,
    node_modules: stubbedNodeModules
  });

  try {
    this.result = await scaffold({
      name: this.projectName,
      owner: this.githubUser,
      description: this.projectDescription,
      homepage: this.projectHomepage,
      visibility: this.projectVisibility,
      projectRoot: process.cwd(),
      tags: this.topics,
      nextSteps: this.nextSteps
    });
  } catch (err) {
    debug(err);
    this.scaffoldError = err;
  }
});
