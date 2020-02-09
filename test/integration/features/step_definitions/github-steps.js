import {OK} from 'http-status-codes';
import {After, Before, Given, Then} from 'cucumber';
import nock from 'nock';
import any from '@travi/any';
import {assert} from 'chai';

let githubScope;
const githubToken = 'skdfjahdgakalkfjdlkf';
const sshUrl = any.url();
const htmlUrl = any.url();
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
  this.githubUser = any.word();
  this.netrcContent = `machine api.github.com\n  login ${githubToken}`;

  stubGithubAuth(this.githubUser);
});

Given('no repository exists on GitHub', async function () {
  githubScope
    .matchHeader('Authorization', `token ${githubToken}`)
    .get(`/users/${this.githubUser}/repos`)
    .reply(OK, []);

  githubScope
    .matchHeader('Authorization', `token ${githubToken}`)
    .post('/user/repos')
    .reply(OK, {
      ssh_url: sshUrl,
      html_url: htmlUrl
    });
});

Given('a repository already exists on GitHub', async function () {
  githubScope
    .matchHeader('Authorization', `token ${githubToken}`)
    .get(`/users/${this.githubUser}/repos`)
    .reply(OK, [{name: this.projectName}]);

  githubScope
    .matchHeader('Authorization', `token ${githubToken}`)
    .get(`/repos/${this.githubUser}/${this.projectName}`)
    .reply(OK, {
      ssh_url: sshUrl,
      html_url: htmlUrl
    });
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
