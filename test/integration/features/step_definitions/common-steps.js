import {resolve} from 'path';
import {promises as fsPromises} from 'fs';
import {After, When} from 'cucumber';
import stubbedFs from 'mock-fs';
import {scaffold} from '../../../../src';

const {readFile} = fsPromises;

// Before(async function () {
//   this.githubUser = any.word();
// });

After(function () {
  stubbedFs.restore();
});

When('the project is scaffolded', async function () {
  stubbedFs({
    node_modules: {
      '@travi': {
        'cli-messages': {
          node_modules: {
            'color-convert': {
              'index.js': await readFile(resolve(
                __dirname,
                '../../../../',
                'node_modules/@travi/cli-messages/node_modules/color-convert/index.js'
              )),
              'conversions.js': await readFile(resolve(
                __dirname,
                '../../../../',
                'node_modules/@travi/cli-messages/node_modules/color-convert/conversions.js'
              )),
              'route.js': await readFile(resolve(
                __dirname,
                '../../../../',
                'node_modules/@travi/cli-messages/node_modules/color-convert/route.js'
              ))
            },
            'color-name': {
              'index.js': await readFile(resolve(
                __dirname,
                '../../../../',
                'node_modules/@travi/cli-messages/node_modules/color-name/index.js'
              ))
            }
          }
        }
      }
    }
  });

  await scaffold({});
});
