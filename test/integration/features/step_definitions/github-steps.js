import {promises as fsPromises} from 'fs';
import {StatusCodes} from 'http-status-codes';
import yaml from 'js-yaml';
import {After, Before, Given, Then} from 'cucumber';
import nock from 'nock';
import any from '@travi/any';
import {assert} from 'chai';
import zip from 'lodash.zip';

let githubScope, nextStepsIssueUrls;
const githubToken = 'skdfjahdgakalkfjdlkf';
const sshUrl = any.url();
const htmlUrl = any.url();
const userAccount = any.word();
const organizationAccount = any.word();
const {readFile} = fsPromises;

function stubGithubAuth(githubUser) {
  githubScope
    .matchHeader('Authorization', `token ${githubToken}`)
    .get('/user')
    .reply(StatusCodes.OK, {login: githubUser});
}

Before(function () {
  nock.disableNetConnect();

  githubScope = nock('https://api.github.com/');
});

After(() => {
  assert.isTrue(githubScope.isDone());

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
    .reply(StatusCodes.OK, []);
});

Given('the user is a member of an organization', async function () {
  this.githubUser = organizationAccount;

  githubScope
    .matchHeader('Authorization', `token ${githubToken}`)
    .get('/user/orgs')
    .reply(StatusCodes.OK, [{login: organizationAccount}]);
});

Given('no repository exists for the {string} on GitHub', async function (accountType) {
  if ('user' === accountType) {
    githubScope
      .matchHeader('Authorization', `token ${githubToken}`)
      .get(`/users/${userAccount}/repos`)
      .reply(StatusCodes.OK, []);

    githubScope
      .matchHeader('Authorization', `token ${githubToken}`)
      .post('/user/repos')
      .reply(StatusCodes.OK, {
        ssh_url: sshUrl,
        html_url: htmlUrl
      });
  }

  if ('organization' === accountType) {
    githubScope
      .matchHeader('Authorization', `token ${githubToken}`)
      .get(`/orgs/${organizationAccount}/repos`)
      .reply(StatusCodes.OK, []);

    githubScope
      .matchHeader('Authorization', `token ${githubToken}`)
      .post(`/orgs/${organizationAccount}/repos`)
      .reply(StatusCodes.OK, {
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
      .reply(StatusCodes.OK, [{name: this.projectName}]);

    githubScope
      .matchHeader('Authorization', `token ${githubToken}`)
      .get(`/repos/${userAccount}/${this.projectName}`)
      .reply(StatusCodes.OK, {
        ssh_url: sshUrl,
        html_url: htmlUrl
      });
  }

  if ('organization' === accountType) {
    githubScope
      .matchHeader('Authorization', `token ${githubToken}`)
      .get(`/orgs/${organizationAccount}/repos`)
      .reply(StatusCodes.OK, [{name: this.projectName}]);

    githubScope
      .matchHeader('Authorization', `token ${githubToken}`)
      .get(`/repos/${organizationAccount}/${this.projectName}`)
      .reply(StatusCodes.OK, {
        ssh_url: sshUrl,
        html_url: htmlUrl
      });
  }
});

Given('next steps are provided', async function () {
  const summaries = any.listOf(any.sentence, {min: 1});
  const descriptions = summaries.map(() => (any.boolean() ? any.sentence() : undefined));
  this.nextSteps = zip(summaries, descriptions)
    .map(([summary, description]) => ({...any.simpleObject(), summary, description}));
  nextStepsIssueUrls = this.nextSteps.map(() => any.url());

  if (this.netrcContent) {
    this.nextSteps.forEach((task, index) => {
      githubScope
        .matchHeader('Authorization', `token ${githubToken}`)
        .post(`/repos/${this.githubUser}/${this.projectName}/issues`, body => {
          assert.deepEqual(body, {title: task.summary, ...task.description && {body: task.description}});

          return true;
        })
        .reply(StatusCodes.CREATED, {url: nextStepsIssueUrls[index]});
    });
  }
});

Then('no repository is created on GitHub', async function () {
  return undefined;
});

Then('a repository is created on GitHub', async function () {
  return undefined;
});

Then('issues are created for next-steps', async function () {
  assert.deepEqual(this.result.nextSteps, nextStepsIssueUrls);
});

Then('no issues are created for next-steps', async function () {
  assert.deepEqual(this.result.nextSteps, []);
});

Then('repository details are returned', async function () {
  assert.equal(this.result.sshUrl, sshUrl);
  assert.equal(this.result.htmlUrl, htmlUrl);
});

Then('no repository details are returned', async function () {
  assert.isUndefined(this.result.sshUrl);
  assert.isUndefined(this.result.htmlUrl);
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
