// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import {scaffold} from '@travi/github-scaffolder';
import {resolve} from 'path';
import {promises as fsPromises} from 'fs';
import {After, Before, When} from 'cucumber';
import stubbedFs from 'mock-fs';
import any from '@travi/any';

const {readFile} = fsPromises;
const packagePreviewDirectory = '../__package_previews__/github-scaffolder';
const pathToNodeModules = [__dirname, '../../../../', 'node_modules/'];
const stubbedNodeModules = stubbedFs.load(resolve(...pathToNodeModules));
const debug = require('debug')('test');

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
    node_modules: stubbedNodeModules,
    [packagePreviewDirectory]: {
      '@travi': {
        'github-scaffolder': {
          node_modules: {
            '.pnpm': {
              node_modules: {
                'color-name': {'index.js': await readFile(resolve(...pathToNodeModules, 'color-name/index.js'))}
              },
              'ansi-styles@4.3.0': {
                node_modules: {
                  'color-convert': {
                    'index.js': await readFile(resolve(...pathToNodeModules, 'color-convert/index.js')),
                    'conversions.js': await readFile(resolve(...pathToNodeModules, 'color-convert/conversions.js')),
                    'route.js': await readFile(resolve(...pathToNodeModules, 'color-convert/route.js'))
                  }
                }
              }
            }
          }
        }
      }
    }
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
