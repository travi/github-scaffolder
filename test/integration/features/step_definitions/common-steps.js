import {resolve} from 'path';
import {promises as fsPromises} from 'fs';
import {After, Before, When} from 'cucumber';
import stubbedFs from 'mock-fs';
import any from '@travi/any';
import {scaffold} from '../../../../src';

const {readFile} = fsPromises;
const pathToNodeModules = [__dirname, '../../../../', 'node_modules/'];
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
    node_modules: {
      '@travi': {
        'cli-messages': {
          node_modules: {
            'color-convert': {
              'index.js': await readFile(resolve(
                ...pathToNodeModules,
                '@travi/cli-messages/node_modules/color-convert/index.js'
              )),
              'conversions.js': await readFile(resolve(
                ...pathToNodeModules,
                '@travi/cli-messages/node_modules/color-convert/conversions.js'
              )),
              'route.js': await readFile(resolve(
                ...pathToNodeModules,
                '@travi/cli-messages/node_modules/color-convert/route.js'
              ))
            },
            'color-name': {
              'index.js': await readFile(resolve(
                ...pathToNodeModules,
                '@travi/cli-messages/node_modules/color-name/index.js'
              ))
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
      tags: this.topics
    });
  } catch (err) {
    debug(err);
    this.scaffoldError = err;
  }
});
