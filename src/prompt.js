import gitConfig from 'git-config';
import {prompt as promptWithInquirer} from '@form8ion/overridable-prompts';

export function prompt({account, decisions} = {}) {
  return promptWithInquirer([
    {
      name: 'repoOwner',
      message: 'What is the id of the repository owner?',
      default: account || (gitConfig.sync().github ? gitConfig.sync().github.user : '')
    }
  ], decisions);
}
