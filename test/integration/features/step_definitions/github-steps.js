import {promises as fsPromises} from 'node:fs';
import {StatusCodes} from 'http-status-codes';
import yaml from 'js-yaml';
import zip from 'lodash.zip';
import {fileExists} from '@form8ion/core';

import {AfterAll, BeforeAll, Given, Then} from '@cucumber/cucumber';
import any from '@travi/any';
import {assert} from 'chai';
import deepEqual from 'deep-equal';
import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';

let nextStepsIssueUrls;
const githubToken = any.word();
const sshUrl = any.url();
const htmlUrl = any.url();
const userAccount = any.word();
const organizationAccount = any.word();
const {readFile} = fsPromises;

const server = setupServer();

BeforeAll(function () {
  server.listen();
});

AfterAll(() => {
  server.close();
});

Given('no authentication is provided', async function () {
  return undefined;
});

Given('netrc contains no GitHub token', async function () {
  this.netrcContent = '';
});

function authorizationHeaderIncludesToken(request) {
  return request.headers.get('authorization') === `token ${githubToken}`;
}

Given('netrc contains a GitHub token', async function () {
  this.githubUser = userAccount;
  this.netrcContent = `machine api.github.com\n  login ${githubToken}`;

  server.use(
    http.get('https://api.github.com/user', ({request}) => {
      if (authorizationHeaderIncludesToken(request)) {
        return HttpResponse.json({login: userAccount});
      }

      return new HttpResponse(null, {status: StatusCodes.UNAUTHORIZED});
    })
  );
});

Given('the user is not a member of the organization', async function () {
  this.githubUser = organizationAccount;

  server.use(
    http.get('https://api.github.com/user/orgs', ({request}) => {
      if (authorizationHeaderIncludesToken(request)) {
        return HttpResponse.json([]);
      }

      return new HttpResponse(null, {status: StatusCodes.UNAUTHORIZED});
    })
  );
});

Given('the user is a member of an organization', async function () {
  this.githubUser = organizationAccount;

  server.use(
    http.get('https://api.github.com/user/orgs', ({request}) => {
      if (authorizationHeaderIncludesToken(request)) {
        return HttpResponse.json([{login: organizationAccount}]);
      }

      return new HttpResponse(null, {status: StatusCodes.UNAUTHORIZED});
    })
  );
});

Given('no repository exists for the {string} on GitHub', async function (accountType) {
  if ('user' === accountType) {
    server.use(
      http.get(
        `https://api.github.com/repos/${userAccount}/${this.projectName}`,
        () => new HttpResponse(null, {status: StatusCodes.NOT_FOUND})
      )
    );

    server.use(
      http.post('https://api.github.com/user/repos', ({request}) => {
        if (authorizationHeaderIncludesToken(request)) {
          return HttpResponse.json({
            ssh_url: sshUrl,
            html_url: htmlUrl
          });
        }

        return new HttpResponse(null, {status: StatusCodes.UNAUTHORIZED});
      })
    );
  }

  if ('organization' === accountType) {
    server.use(
      http.get(
        `https://api.github.com/repos/${organizationAccount}/${this.projectName}`,
        () => new HttpResponse(null, {status: StatusCodes.NOT_FOUND})
      )
    );

    server.use(
      http.post(`https://api.github.com/orgs/${organizationAccount}/repos`, ({request}) => {
        if (authorizationHeaderIncludesToken(request)) {
          return HttpResponse.json({
            ssh_url: sshUrl,
            html_url: htmlUrl
          });
        }

        return new HttpResponse(null, {status: StatusCodes.UNAUTHORIZED});
      })
    );
  }
});

Given('a repository already exists for the {string} on GitHub', async function (accountType) {
  if ('user' === accountType) {
    server.use(
      http.get(`https://api.github.com/repos/${userAccount}/${this.projectName}`, ({request}) => {
        if (authorizationHeaderIncludesToken(request)) {
          return HttpResponse.json({
            ssh_url: sshUrl,
            html_url: htmlUrl
          });
        }

        return new HttpResponse(null, {status: StatusCodes.UNAUTHORIZED});
      })
    );
  }

  if ('organization' === accountType) {
    server.use(
      http.get(`https://api.github.com/repos/${organizationAccount}/${this.projectName}`, ({request}) => {
        if (authorizationHeaderIncludesToken(request)) {
          return HttpResponse.json({
            ssh_url: sshUrl,
            html_url: htmlUrl
          });
        }

        return new HttpResponse(null, {status: StatusCodes.UNAUTHORIZED});
      })
    );
  }
});

Given('next steps are provided', async function () {
  const summaries = any.listOf(any.sentence, {min: 1});
  const descriptions = summaries.map(() => (any.boolean() ? any.sentence() : undefined));
  this.nextSteps = zip(summaries, descriptions)
    .map(([summary, description]) => ({...any.simpleObject(), summary, description}));
  nextStepsIssueUrls = this.nextSteps.map(() => any.url());

  if (this.netrcContent) {
    server.use(
      http.post(
        `https://api.github.com/repos/${this.githubUser}/${this.projectName}/issues`,
        async ({request}) => {
          if (authorizationHeaderIncludesToken(request)) {
            const body = await request.json();

            const [, url] = zip(this.nextSteps, nextStepsIssueUrls).find(([task]) => deepEqual(
              body,
              {title: task.summary, ...task.description && {body: task.description}}
            ));

            return HttpResponse.json({url});
          }

          return new HttpResponse(null, {status: StatusCodes.UNAUTHORIZED});
        }
      )
    );
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
  const settings = yaml.load(await readFile(`${process.cwd()}/.github/settings.yml`));

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

Then('repository settings are not configured', async function () {
  assert.isFalse(await fileExists(`${process.cwd()}/.github/settings.yml`));
});
