import chalk from 'chalk';

async function authenticatedUserIsMemberOfRequestedOrganization(account, octokit) {
  const {data: organizations} = await octokit.orgs.listForAuthenticatedUser();

  return organizations.reduce((acc, organization) => acc || account === organization.login, false);
}

export default async function (name, owner, visibility, octokit) {
  console.error(chalk.grey('Creating repository on GitHub'));           // eslint-disable-line no-console

  const {data: {login: authenticatedUser}} = await octokit.users.getAuthenticated();

  if (owner === authenticatedUser) {
    const {data: {ssh_url: sshUrl, html_url: htmlUrl}} = await octokit.repos.createForAuthenticatedUser({
      name,
      private: 'Private' === visibility
    });

    console.error(chalk.grey(`Repository created for user ${name} at ${htmlUrl}`));   // eslint-disable-line no-console

    return {sshUrl, htmlUrl};
  }

  if (await authenticatedUserIsMemberOfRequestedOrganization(owner, octokit)) {
    const {data: {ssh_url: sshUrl, html_url: htmlUrl}} = await octokit.repos.createInOrg({
      org: owner,
      name,
      private: 'Private' === visibility
    });

    // eslint-disable-next-line no-console
    console.error(chalk.grey(`Repository created for organization ${name} at ${htmlUrl}`));

    return {sshUrl, htmlUrl};
  }

  throw new Error(`User ${authenticatedUser} does not have access to create a repository in the ${owner} account`);
}
