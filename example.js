// #### Import
// remark-usage-ignore-next
import stubbedFs from 'mock-fs';
import {scaffold} from './lib/index.cjs';

// remark-usage-ignore-next
stubbedFs();

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
      {summary: 'Remember to do that'}
    ]
  });
})();
