import { expect } from 'chai';
import { Credentials, DockerPluginConfig } from './models';
import { constructImageName, getCredentials, getRegistryUrlFromConfig } from './shared-logic';

describe('@iteratec/semantic-release-docker', function() {
  describe('shared-logic', function() {
    afterEach(function() {
      process.env.DOCKER_REGISTRY_USER = '';
      process.env.DOCKER_REGISTRY_PASSWORD = '';
      process.env.DOCKER_REGISTRY_URL = '';
    });

    it('should use only image name', function() {
      const config: DockerPluginConfig = {
        path: '@iteratec/semantic-release-docker',
        imageName: 'test',
      };
      expect(constructImageName(config)).to.be.equal('test');
    });

    it('should use image name and repository', function() {
      const config: DockerPluginConfig = {
        path: '@iteratec/semantic-release-docker',
        imageName: 'test',
        repositoryName: 'repo',
      };
      expect(constructImageName(config)).to.be.equal('repo/test');
    });

    it('should use image name, repository and registry', function() {
      const config: DockerPluginConfig = {
        path: '@iteratec/semantic-release-docker',
        imageName: 'test',
        repositoryName: 'repo',
        registryUrl: 'registry',
      };
      expect(constructImageName(config)).to.be.equal('registry/repo/test');
    });

    it('should use the registry from the config', function() {
      const config: DockerPluginConfig = {
        path: '@iteratec/semantic-release-docker',
        imageName: 'test',
        registryUrl: 'registry',
      };
      expect(getRegistryUrlFromConfig(config)).to.be.equal('registry');
    });

    it('should prefer the registry from the environment variable over the one from the config', function() {
      process.env.DOCKER_REGISTRY_URL = 'my_other_private_registry';
      const config: DockerPluginConfig = {
        path: '@iteratec/semantic-release-docker',
        imageName: 'test',
        registryUrl: 'registry',
      };
      expect(getRegistryUrlFromConfig(config)).to.be.equal('my_other_private_registry');
    });

    it('should default to empty string if no registry is specified', function() {
      const config: DockerPluginConfig = {
        path: '@iteratec/semantic-release-docker',
        imageName: 'test',
      };
      expect(getRegistryUrlFromConfig(config)).to.be.equal('');
    });

    it('should get Credentials', function() {
      process.env.DOCKER_REGISTRY_USER = 'username';
      process.env.DOCKER_REGISTRY_PASSWORD = 'password';
      expect(getCredentials()).to.eql({ password: 'password', username: 'username' } as Credentials);
    });
  });
});
