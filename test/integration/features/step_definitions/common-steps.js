import {resolve} from 'path';
import {promises, promises as fsPromises} from 'fs';
import {After, Before, When} from 'cucumber';
import stubbedFs from 'mock-fs';
import any from '@travi/any';
import {scaffold} from '../../../../src';

const {readFile} = fsPromises;
const pathToNodeModules = [__dirname, '../../../../', 'node_modules/'];

function loadOctokitFiles(octokitFiles) {
  return octokitFiles
    .map(file => promises.readFile(resolve(...pathToNodeModules, 'octokit-pagination-methods/lib/', file)));
}

function buildOctokitFileMap(octokitFiles) {
  return (acc, fileContents, index) => ({
    ...acc,
    [octokitFiles[index]]: fileContents
  });
}

Before(function () {
  this.projectName = any.word();
});

After(function () {
  stubbedFs.restore();
});

When('the project is scaffolded', async function () {
  const octokitFiles = await promises.readdir(resolve(...pathToNodeModules, 'octokit-pagination-methods/lib/'));
  stubbedFs({
    ...this.netrcContent && {
      [`${process.env.HOME}/.netrc`]: this.netrcContent
    },
    [`${process.env.HOME}/.gitconfig`]: `[github]\n\tuser = ${this.githubUser}`,
    node_modules: {
      'octokit-pagination-methods': {
        lib: (await Promise.all(loadOctokitFiles(octokitFiles))).reduce(buildOctokitFileMap(octokitFiles), {})
      },
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

  await scaffold({
    name: this.projectName,
    owner: this.githubUser
  });
});
