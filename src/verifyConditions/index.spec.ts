import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Dockerode from 'dockerode';
import { createStubInstance } from 'sinon';

import {
  SemanticReleaseConfig,
  SemanticReleaseContext,
} from 'semantic-release';
import { DockerPluginConfig } from '../dockerPluginConfig';
import { Auth } from '../model/auth';
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
    let dockerStub: any;

    before(function() {
      use(chaiAsPromised);
      dockerStub = createStubInstance(Dockerode);
      dockerStub.checkAuth.resolves(true);
    });

    afterEach(function() {
      process.env.DOCKER_REGISTRY_USER = '';
      process.env.DOCKER_REGISTRY_PASSWORD = '';
      process.env.DOCKER_REGISTRY_URL = '';
    });

    it('should throw when the username is not set', function() {
      return expect(
        verifyConditions(config, context),
      ).to.eventually.be.rejectedWith(
        'Environment variable DOCKER_REGISTRY_USER must be set in order to login to the registry.',
      );
    });

    it('should throw when the password is not set', function() {
      process.env.DOCKER_REGISTRY_USER = 'username';
      return expect(
        verifyConditions(config, context),
      ).to.eventually.be.rejectedWith(
        'Environment variable DOCKER_REGISTRY_PASSWORD must be set in order to login to the registry.',
      );
    });

    it('should use the registry from the config', async function() {
      const expected = {
        password: 'password',
        serveraddress: 'my_private_registry',
        username: 'username',
      } as Auth;
      process.env.DOCKER_REGISTRY_USER = expected.username;
      process.env.DOCKER_REGISTRY_PASSWORD = expected.password;
      (context.options.prepare![0] as DockerPluginConfig).registryUrl =
        expected.serveraddress;
      await verifyConditions(config, context, dockerStub);
      // tslint:disable-next-line: no-unused-expression
      expect(dockerStub.checkAuth.calledOnce).to.be.true;
      expect(dockerStub.checkAuth.firstCall.args[0]).to.deep.equal(expected);
    });

    it('should prefer the registry from the environment variable over the one from the config', async function() {
      const expected = {
        password: 'topsecret',
        serveraddress: 'registry_from_env',
        username: 'me',
      } as Auth;
      process.env.DOCKER_REGISTRY_USER = expected.username;
      process.env.DOCKER_REGISTRY_PASSWORD = expected.password;
      process.env.DOCKER_REGISTRY_URL = expected.serveraddress;
      (context.options.prepare![0] as DockerPluginConfig).registryUrl =
        'registry_from_config';
      await verifyConditions(config, context, dockerStub);
      // tslint:disable-next-line: no-unused-expression
      expect(dockerStub.checkAuth.calledOnce).to.be.true;
      expect(dockerStub.checkAuth.firstCall.args[0]).to.deep.equal(expected);
    });

    it('should default to docker hub if no registry is specified', async function() {
      const expected = {
        password: 'topsecret',
        serveraddress: '',
        username: 'me',
      } as Auth;
      (context.options.prepare![0] as DockerPluginConfig).registryUrl = '';
      (context.options.prepare![0] as DockerPluginConfig).imageName = '';
      process.env.DOCKER_REGISTRY_USER = expected.username;
      process.env.DOCKER_REGISTRY_PASSWORD = expected.password;
      await verifyConditions(config, context, dockerStub);
      // tslint:disable-next-line: no-unused-expression
      expect(dockerStub.checkAuth.calledOnce).to.be.true;
      expect(dockerStub.checkAuth.firstCall.args[0]).to.deep.equal(expected);
    });

    afterEach(function() {
      dockerStub.checkAuth.resetHistory();
    });
  });
});
