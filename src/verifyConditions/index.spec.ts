import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { DockerPluginConfig } from '../models';
import { verifyConditions } from './index';

describe('@iteratec/semantic-release-docker', function() {
  describe('verifyConditions', function() {
    const config: SemanticReleaseConfig = {
      branch: '',
      noCi: true,
      repositoryUrl: '',
      tagFormat: '',
    };
    const context: SemanticReleaseContext = {
      logger: {
        // tslint:disable-next-line:no-empty
        log: (message: string) => {},
      },
      options: {
        branch: '',
        noCi: true,
        prepare: [
          {
            imageName: 'test',
            path: '@iteratec/semantic-release-docker',
          } as DockerPluginConfig,
        ],
        repositoryUrl: '',
        tagFormat: '',
      },
    };

    before(function() {
      use(chaiAsPromised);
    });

    it('should throw when the username is not set', function() {
      delete process.env.DOCKER_REGISTRY_USER;
      return expect(verifyConditions(config, context)).to.eventually.be.rejectedWith(
        'Environment variable DOCKER_REGISTRY_USER must be set in order to login to the registry.',
      );
    });

    it('should NOT throw when the username is set', function() {
      process.env.DOCKER_REGISTRY_USER = 'username';
      return expect(verifyConditions(config, context)).to.not.eventually.be.rejectedWith(
        'Environment variable DOCKER_REGISTRY_USER must be set in order to login to the registry.',
      );
    });

    it('should throw when the password is not set', function() {
      process.env.DOCKER_REGISTRY_USER = 'username';
      delete process.env.DOCKER_REGISTRY_PASSWORD;
      return expect(verifyConditions(config, context)).to.eventually.be.rejectedWith(
        'Environment variable DOCKER_REGISTRY_PASSWORD must be set in order to login to the registry.',
      );
    });

    it('should NOT throw when the password is set', function() {
      process.env.DOCKER_REGISTRY_PASSWORD = 'password';
      return expect(verifyConditions(config, context)).to.not.eventually.be.rejectedWith(
        'Environment variable DOCKER_REGISTRY_PASSWORD must be set in order to login to the registry.',
      );
    });

    it('should default to docker hub if no registry is specified', function() {
      this.timeout(10000);
      (context.options.prepare![0] as DockerPluginConfig).registryUrl = '';
      process.env.DOCKER_REGISTRY_USER = 'badusername';
      process.env.DOCKER_REGISTRY_PASSWORD = 'pass@w0rd';
      return expect(verifyConditions(config, context)).to.eventually.be.rejectedWith(
        /(?:index.docker.com|registry-1.docker.io)/,
      );
    });
  });
});
