import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { DockerPluginConfig } from '../dockerPluginConfig';
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
            imageName: '',
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

    afterEach(function() {
      process.env.DOCKER_REGISTRY_USER = '';
      process.env.DOCKER_REGISTRY_PASSWORD = '';
      process.env.DOCKER_REGISTRY_URL = '';
    });

    it('should throw when the username is not set', function() {
      return expect(verifyConditions(config, context)).to.eventually.be
        .rejectedWith('Environment variable DOCKER_REGISTRY_USER must be set in order to login to the registry.');
    });

    it('should throw when the password is not set', function() {
      process.env.DOCKER_REGISTRY_USER = 'username';
      return expect(verifyConditions(config, context)).to.eventually.be
        .rejectedWith('Environment variable DOCKER_REGISTRY_PASSWORD must be set in order to login to the registry.');
    });

    it('should use the registry from the config', function() {
      this.timeout(5000);
      process.env.DOCKER_REGISTRY_USER = 'username';
      process.env.DOCKER_REGISTRY_PASSWORD = 'password';
      (context.options.prepare![0] as DockerPluginConfig).registryUrl = 'my_private_registry';
      return expect(verifyConditions(config, context))
        .to.eventually.be.rejectedWith(/(?:my_private_registry)/);
    });

    it('should prefer the registry from the environment variable over the one from the config', function() {
      this.timeout(5000);
      process.env.DOCKER_REGISTRY_USER = 'username';
      process.env.DOCKER_REGISTRY_PASSWORD = 'password';
      process.env.DOCKER_REGISTRY_URL = 'my_other_private_registry';
      (context.options.prepare![0] as DockerPluginConfig).registryUrl = 'my_private_registry';
      return expect(verifyConditions(config, context))
        .to.eventually.be.rejectedWith(/(?:my_other_private_registry)/);
    });

    it('should default to docker hub if no registry is specified', function() {
      this.timeout(10000);
      (context.options.prepare![0] as DockerPluginConfig).registryUrl = '';
      (context.options.prepare![0] as DockerPluginConfig).imageName = '';
      process.env.DOCKER_REGISTRY_USER = 'badusername';
      process.env.DOCKER_REGISTRY_PASSWORD = 'pass@w0rd';
      return expect(verifyConditions(config, context)).to.eventually.be
        .rejectedWith(/(?:index.docker.com|registry-1.docker.io)/);
    });

  });

});
