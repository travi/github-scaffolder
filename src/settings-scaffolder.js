import {promises as fs} from 'node:fs';
import {dump} from 'js-yaml';
import mkdir from 'make-dir';
import {info} from '@travi/cli-messages';

export default async function scaffoldSettings({projectRoot, projectName, description, homepage, visibility, topics}) {
  info('Writing settings file', {level: 'secondary'});

  const createdGithubDirectory = await mkdir(`${projectRoot}/.github`);

  return fs.writeFile(
    `${createdGithubDirectory}/settings.yml`,
    dump({
      _extends: '.github',
      repository: {
        name: projectName,
        description,
        homepage,
        private: 'Public' !== visibility,
        ...topics && {topics: topics.join(', ')}
      }
    })
  );
}
