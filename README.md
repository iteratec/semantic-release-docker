# @iteratec/semantic-release-docker

[![Build Status](https://dev.azure.com/iteratec-oss-bdd/semantic-release-docker/_apis/build/status/iteratec.semantic-release-docker?branchName=master)](https://dev.azure.com/iteratec-oss-bdd/semantic-release-docker/_build/latest?definitionId=2&branchName=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![latest npm package version](https://img.shields.io/npm/v/@iteratec/semantic-release-docker/latest.svg)](https://www.npmjs.com/package/@iteratec/semantic-release-docker)
[![MIT license](https://img.shields.io/npm/l/@iteratec/semantic-release-docker.svg)](https://www.npmjs.com/package/@iteratec/semantic-release-docker)

A [semantic-release](https://github.com/semantic-release/semantic-release) plugin to use semantic versioning for docker images.

## Installation

Run `npm i --save-dev @iteratec/semantic-release-docker` to install this semantic-release plugin.

## Configuration

### Docker registry authentication

The `docker registry` authentication is **required** and can be set via environment variables.

### Environment variables

| Variable                 | Description                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| DOCKER_REGISTRY_URL      | The hostname and port used by the desired docker registry. Leave blank to use docker hub. |
| DOCKER_REGISTRY_USER     | The user name to authenticate with at the registry.                                       |
| DOCKER_REGISTRY_PASSWORD | The password used for authentication at the registry.                                     |

### Usage

#### Full configuration

```json
{
  "verifyConfig": ["@iteratec/semantic-release-docker"],
  "prepare": [
    {
      "path": "@iteratec/semantic-release-docker",
      "additionalTags": ["test", "demo"],
      "imageName": "my-image",
      "registryUrl": "my-private-registry:5678",
      "respositoryName": "my-repository"
    }
  ],
  "publish": {
    "path": "@iteratec/semantic-release-docker"
  }
}
```

Results in `my-private-registry:5678/my-repository/my-image` with tags `test`, `demo` and the `<semver>` determined by `semantic-release`.

#### Minimum configuration

```json
{
  "verifyConfig": ["@iteratec/semantic-release-docker"],
  "prepare": {
    "path": "@iteratec/semantic-release-docker",
    "imageName": "my-image"
  },
  "publish": {
    "path": "@iteratec/semantic-release-docker"
  }
}
```

Results in `my-image:<semver>`.

### Options

| Option         | Description                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| additionalTags | _Optional_. An array of strings allowing to specify additional tags to apply to the image.                                                  |
| imageName      | **_Required_** The name of the image to release.                                                                                            |
| registryUrl    | _Optional_. The hostname and port used by the the registry in format `hostname[:port]`. Omit the port if the registry uses the default port |
| repositoryName | _Optional_. The name of the repository in the registry, e.g. username on docker hub                                                         |

## Steps

### verifyConditions

It uses a registry server provided via config or environment variable (preferred) or defaults to docker hub if none is given.

1. Verifies that environment variables for authentication via username and password are set.
2. It also verifies that the credentials are correct by logging in to the given registry.

### prepare

Tags the specified image with the version number determined by semantic-release and additional tags provided in the configuration.
In addition it supports specifying a complete image name (CIN) via configuration settings according to the canonical format specified by docker:

`[registryhostname[:port]/][username/]imagename[:tag]`

### publish

Pushes the tagged images to the registry.

## Contribute

### Develop

1. Create a develop.ts file in the root of this Git-Repository and copy this:

    ```typescript
    import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
    import { prepare, publish, verifyConditions } from './src';
    import { DockerPluginConfig } from './src/models';

    process.env.DOCKER_REGISTRY_USER = '<Your Docker Registry User>';
    process.env.DOCKER_REGISTRY_PASSWORD = '<Your Docker Registry Password>';

    const config: SemanticReleaseConfig = {
      branch: '',
      noCi: true,
      repositoryUrl: '',
      tagFormat: ''
    };
    const context: SemanticReleaseContext = {
      logger: {
        // tslint:disable-next-line:no-empty
        log: (message: string) => {}
      },
      options: {
        branch: '',
        noCi: true,
        prepare: [
          {
            additionalTags: ['latest'],
            imageName: 'testimage',
            repositoryName: '<your test repository>',
            path: '@iteratec/semantic-release-docker'
          } as DockerPluginConfig,
          {
            additionalTags: ['latest'],
            imageName: 'testimage1',
            repositoryName: '<your test repository>',
            path: '@iteratec/semantic-release-docker'
          } as DockerPluginConfig
        ],
        repositoryUrl: '',
        tagFormat: ''
      },
      nextRelease: {
        version: '1.0.3',
        gitHead: '45jh345g',
        gitTag: 'v1.0.3',
        notes: 'Nothing special'
      }
    };
    context.logger.log = (string: string) => {
      console.log(string);
    };
    verifyConditions(config, context);
    prepare(config, context);
    publish(config, context);
    ```

2. Simply run the "Debug" VS Code Task
