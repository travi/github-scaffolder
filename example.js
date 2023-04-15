// #### Import
// remark-usage-ignore-next 2
import {resolve} from 'path';
import stubbedFs from 'mock-fs';
import {scaffold} from './lib/index.js';

// remark-usage-ignore-next
stubbedFs({node_modules: stubbedFs.load(resolve('node_modules'))});

// #### Scaffold

(async () => {
  await scaffold({
    projectRoot: process.cwd(),
    name: 'foo',
    owner: 'travi',
    description: 'This is my awesome project',
    homepage: 'https://github.com/travi/foo#README',
    visibility: 'Public',
    tags: ['foo', 'bar'],
    nextSteps: [
      {summary: 'Do not forget to do this!'},
      {
        summary: 'Remember to do that',
        description: `Take these steps:
- [ ] step 1
- [ ] step 2`
      }
    ]
  });
})();
