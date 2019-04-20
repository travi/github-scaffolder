import {info, success} from '@travi/cli-messages';

async function authenticatedUserIsMemberOfRequestedOrganization(account, octokit) {
  const {data: organizations} = await octokit.orgs.listForAuthenticatedUser();

  return organizations.reduce((acc, organization) => acc || account === organization.login, false);
}

export default async function (name, owner, visibility, octokit) {
  info('Creating repository on GitHub', {level: 'secondary'});

  const {data: {login: authenticatedUser}} = await octokit.users.getAuthenticated();

  if (owner === authenticatedUser) {
    const {data: {ssh_url: sshUrl, html_url: htmlUrl}} = await octokit.repos.createForAuthenticatedUser({
      name,
      private: 'Private' === visibility
    });

    success(`Repository created for user ${name} at ${htmlUrl}`);

    return {sshUrl, htmlUrl};
  }

  if (await authenticatedUserIsMemberOfRequestedOrganization(owner, octokit)) {
    const {data: {ssh_url: sshUrl, html_url: htmlUrl}} = await octokit.repos.createInOrg({
      org: owner,
      name,
      private: 'Private' === visibility
    });

    success(`Repository created for organization ${name} at ${htmlUrl}`);

    return {sshUrl, htmlUrl};
  }

  throw new Error(`User ${authenticatedUser} does not have access to create a repository in the ${owner} account`);
}
