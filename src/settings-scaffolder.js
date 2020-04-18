import {info} from '@travi/cli-messages';
import writeYaml from '../third-party-wrappers/write-yaml';

export default function scaffoldSettings({projectRoot, projectName, description, homepage, visibility}) {
  info('Writing settings file', {level: 'secondary'});

  return writeYaml(
    `${projectRoot}/.github/settings.yml`,
    {_extends: '.github', repository: {name: projectName, description, homepage, private: 'Public' !== visibility}}
  );
}
