# github-scaffolder

VCS scaffolder for projects to be hosted on GitHub

<!-- status badges -->

[![Build Status][ci-badge]][ci-link]
[![Codecov][coverage-badge]][coverage-link]

## Table of Contents

* [Usage](#usage)
  * [Installation](#installation)
* [Contributing](#contributing)
  * [Dependencies](#dependencies)
  * [Verification](#verification)

## Usage

<!-- consumer badges -->

[![npm][npm-badge]][npm-link]
[![MIT license][license-badge]][license-link]

### Installation

```sh
$ npm install @travi/github-scaffolder --prod
```

### Enabling actions against the GitHub API

Add a [personal access token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line)
to your [`~/.netrc` file](https://ec.haxx.se/usingcurl-netrc.html)

```
machine github.com
  login <personal access token here>
```

If a token is not provided here, a warning will be printed, but interactions
with the GitHub API that need more than public access will simply be skipped.

## Contributing

<!-- contribution badges -->

[![Conventional Commits][commit-convention-badge]][commit-convention-link]
[![Commitizen friendly][commitizen-badge]][commitizen-link]
[![semantic-release][semantic-release-badge]][semantic-release-link]
[![PRs Welcome][PRs-badge]][PRs-link]
[![Greenkeeper badge](https://badges.greenkeeper.io/travi/github-scaffolder.svg)](https://greenkeeper.io/)

### Dependencies

```sh
$ nvm install
$ npm install
```

### Verification

```sh
$ npm test
```

[npm-link]: https://www.npmjs.com/package/@travi/github-scaffolder

[npm-badge]: https://img.shields.io/npm/v/@travi/github-scaffolder.svg

[license-link]: LICENSE

[license-badge]: https://img.shields.io/github/license/travi/github-scaffolder.svg

[ci-link]: https://travis-ci.com/travi/github-scaffolder

[ci-badge]: https://img.shields.io/travis/com/travi/github-scaffolder/master.svg

[coverage-link]: https://codecov.io/github/travi/github-scaffolder

[coverage-badge]: https://img.shields.io/codecov/c/github/travi/github-scaffolder.svg

[commit-convention-link]: https://conventionalcommits.org

[commit-convention-badge]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg

[commitizen-link]: http://commitizen.github.io/cz-cli/

[commitizen-badge]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg

[semantic-release-link]: https://github.com/semantic-release/semantic-release

[semantic-release-badge]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg

[PRs-link]: http://makeapullrequest.com

[PRs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
