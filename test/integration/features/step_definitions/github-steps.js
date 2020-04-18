import {promises as fsPromises} from 'fs';
import {OK} from 'http-status-codes';
import yaml from 'js-yaml';
import {After, Before, Given, Then} from 'cucumber';
import nock from 'nock';
import any from '@travi/any';
import {assert} from 'chai';

let githubScope;
const githubToken = 'skdfjahdgakalkfjdlkf';
const sshUrl = any.url();
const htmlUrl = any.url();
const userAccount = any.word();
const organizationAccount = any.word();
const {readFile} = fsPromises;
const debug = require('debug')('test');

function stubGithubAuth(githubUser) {
  githubScope
    .matchHeader('Authorization', `token ${githubToken}`)
    .get('/user')
    .reply(OK, {login: githubUser});
}

Before(function () {
  nock.disableNetConnect();

  githubScope = nock('https://api.github.com/').log(debug);
});

After(() => {
  nock.enableNetConnect();
  nock.cleanAll();
});

Given('no authentication is provided', async function () {
  return undefined;
});

Given('netrc contains no GitHub token', async function () {
  this.netrcContent = '';
});

Given('netrc contains a GitHub token', async function () {
  this.githubUser = userAccount;
  this.netrcContent = `machine api.github.com\n  login ${githubToken}`;

  stubGithubAuth(userAccount);
});

Given('the user is not a member of the organization', async function () {
  this.githubUser = organizationAccount;

  githubScope
    .matchHeader('Authorization', `token ${githubToken}`)
    .get('/user/orgs')
    .reply(OK, []);
});

Given('the user is a member of an organization', async function () {
  this.githubUser = organizationAccount;

  githubScope
    .matchHeader('Authorization', `token ${githubToken}`)
    .get('/user/orgs')
    .reply(OK, [{login: organizationAccount}]);
});

Given('no repository exists for the {string} on GitHub', async function (accountType) {
  if ('user' === accountType) {
    githubScope
      .matchHeader('Authorization', `token ${githubToken}`)
      .get(`/users/${userAccount}/repos`)
      .reply(OK, []);

    githubScope
      .matchHeader('Authorization', `token ${githubToken}`)
      .post('/user/repos')
      .reply(OK, {
        ssh_url: sshUrl,
        html_url: htmlUrl
      });
  }

  if ('organization' === accountType) {
    githubScope
      .matchHeader('Authorization', `token ${githubToken}`)
      .get(`/orgs/${organizationAccount}/repos`)
      .reply(OK, []);

    githubScope
      .matchHeader('Authorization', `token ${githubToken}`)
      .post(`/orgs/${organizationAccount}/repos`)
      .reply(OK, {
        ssh_url: sshUrl,
        html_url: htmlUrl
      });
  }
});

Given('a repository already exists for the {string} on GitHub', async function (accountType) {
  if ('user' === accountType) {
    githubScope
      .matchHeader('Authorization', `token ${githubToken}`)
      .get(`/users/${userAccount}/repos`)
      .reply(OK, [{name: this.projectName}]);

    githubScope
      .matchHeader('Authorization', `token ${githubToken}`)
      .get(`/repos/${userAccount}/${this.projectName}`)
      .reply(OK, {
        ssh_url: sshUrl,
        html_url: htmlUrl
      });
  }

  if ('organization' === accountType) {
    githubScope
      .matchHeader('Authorization', `token ${githubToken}`)
      .get(`/orgs/${organizationAccount}/repos`)
      .reply(OK, [{name: this.projectName}]);

    githubScope
      .matchHeader('Authorization', `token ${githubToken}`)
      .get(`/repos/${organizationAccount}/${this.projectName}`)
      .reply(OK, {
        ssh_url: sshUrl,
        html_url: htmlUrl
      });
  }
});

Then('no repository is created on GitHub', async function () {
  return undefined;
});

Then('a repository is created on GitHub', async function () {
  return undefined;
});

Then('repository details are returned', async function () {
  assert.equal(this.result.sshUrl, sshUrl);
  assert.equal(this.result.htmlUrl, htmlUrl);
});

Then('no repository details are returned', async function () {
  assert.deepEqual(this.result, {});
});

Then('and an authorization error is thrown', async function () {
  assert.equal(
    this.scaffoldError.message,
    `User ${userAccount} does not have access to create a repository in the ${organizationAccount} account`
  );
});

Then('repository settings are configured', async function () {
  const settings = yaml.safeLoad(await readFile(`${process.cwd()}/.github/settings.yml`));

  assert.deepEqual(
    settings,
    {
      _extends: '.github',
      repository: {
        name: this.projectName,
        description: this.projectDescription,
        homepage: this.projectHomepage,
        private: 'Public' !== this.projectVisibility,
        topics: this.topics.join(', ')
      }
    }
  );
});
