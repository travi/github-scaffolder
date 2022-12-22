import {info, success, warn} from '@travi/cli-messages';

async function authenticatedUserIsMemberOfRequestedOrganization(account, octokit) {
  const {data: organizations} = await octokit.orgs.listForAuthenticatedUser();

  return organizations.reduce((acc, organization) => acc || account === organization.login, false);
}

async function fetchDetailsForExistingRepository(owner, name, octokit) {
  const {data: {ssh_url: sshUrl, html_url: htmlUrl}} = await octokit.repos.get({owner, repo: name});

  return {sshUrl, htmlUrl};
}

async function createForUser(octokit, owner, name, visibility) {
  try {
    const repositoryDetails = await fetchDetailsForExistingRepository(owner, name, octokit);

    warn(`The repository named ${owner}/${name} already exists on GitHub`);

    return repositoryDetails;
  } catch (e) {
    if (404 === e.status) {
      const {data: {ssh_url: sshUrl, html_url: htmlUrl}} = await octokit.repos.createForAuthenticatedUser({
        name,
        private: 'Private' === visibility
      });

      success(`Repository ${name} created for user ${owner} at ${htmlUrl}`);

      return {sshUrl, htmlUrl};
    }

    throw e;
  }
}

async function createForOrganization(octokit, owner, name, visibility) {
  try {
    const repositoryDetails = await fetchDetailsForExistingRepository(owner, name, octokit);

    warn(`The repository named ${owner}/${name} already exists on GitHub`);

    return repositoryDetails;
  } catch (e) {
    if (404 === e.status) {
      const {data: {ssh_url: sshUrl, html_url: htmlUrl}} = await octokit.repos.createInOrg({
        org: owner,
        name,
        private: 'Private' === visibility
      });

      success(`Repository ${name} created for organization ${owner} at ${htmlUrl}`);

      return {sshUrl, htmlUrl};
    }

    throw e;
  }
}

export default async function (name, owner, visibility, octokit) {
  info('Creating repository on GitHub', {level: 'secondary'});

  const {data: {login: authenticatedUser}} = await octokit.users.getAuthenticated();

  if (owner === authenticatedUser) return createForUser(octokit, owner, name, visibility);

  if (await authenticatedUserIsMemberOfRequestedOrganization(owner, octokit)) {
    return createForOrganization(octokit, owner, name, visibility);
  }

  throw new Error(`User ${authenticatedUser} does not have access to create a repository in the ${owner} account`);
}
