import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Dockerode from 'dockerode';
import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { DockerPluginConfig } from '../models';
import { verifyConditions } from './index';

describe('@iteratec/semantic-release-docker', function() {
  describe('verifyConditions', function() {
    const imageName = 'abcdefghijklmnopqrstuvwxyz';
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
            imageName,
            path: '@iteratec/semantic-release-docker',
          } as DockerPluginConfig,
        ],
        repositoryUrl: '',
        tagFormat: '',
      },
    };
    let dockerStub: SinonStubbedInstance<Dockerode>;

    before(function() {
      use(chaiAsPromised);
      dockerStub = createStubInstance(Dockerode);
    });

    beforeEach(function() {
      dockerStub.checkAuth.resolves(true);
      dockerStub.listImages.resolves([
        {
          Id: '',
          ParentId: '',
          RepoTags: [],
          Created: 0,
          Size: 0,
          VirtualSize: 0,
          Labels: {},
        },
      ]);
    });

    it('should throw when the username is not set', function() {
      delete process.env.DOCKER_REGISTRY_USER;
      return expect(
        verifyConditions(config, context, (dockerStub as unknown) as Dockerode),
      ).to.eventually.be.rejectedWith(
        'Environment variable DOCKER_REGISTRY_USER must be set in order to login to the registry.',
      );
    });

    it('should NOT throw when the username is set', function() {
      process.env.DOCKER_REGISTRY_USER = 'username';
      return expect(
        verifyConditions(config, context, (dockerStub as unknown) as Dockerode),
      ).to.not.eventually.be.rejectedWith(
        'Environment variable DOCKER_REGISTRY_USER must be set in order to login to the registry.',
      );
    });

    it('should throw when the password is not set', function() {
      process.env.DOCKER_REGISTRY_USER = 'username';
      delete process.env.DOCKER_REGISTRY_PASSWORD;
      return expect(
        verifyConditions(config, context, (dockerStub as unknown) as Dockerode),
      ).to.eventually.be.rejectedWith(
        'Environment variable DOCKER_REGISTRY_PASSWORD must be set in order to login to the registry.',
      );
    });

    it('should NOT throw when the password is set', function() {
      process.env.DOCKER_REGISTRY_PASSWORD = 'password';
      return expect(
        verifyConditions(config, context, (dockerStub as unknown) as Dockerode),
      ).to.not.eventually.be.rejectedWith(
        'Environment variable DOCKER_REGISTRY_PASSWORD must be set in order to login to the registry.',
      );
    });

    it('should throw if no imagename is provided', function() {
      const context = {
        // tslint:disable-next-line:no-empty
        logger: { log: (message: string) => {} },
        nextRelease: {
          gitTag: '',
          notes: '',
          version: 'next',
        },
        options: {
          branch: '',
          noCi: true,
          prepare: [
            {
              path: '@iteratec/semantic-release-docker',
            } as DockerPluginConfig,
          ],
          repositoryUrl: '',
          tagFormat: '',
        },
      } as SemanticReleaseContext;
      return expect(
        verifyConditions(config, context, (dockerStub as unknown) as Dockerode),
      ).to.eventually.be.rejectedWith('\'imageName\' is not set in plugin configuration');
    });

    it('should throw if image with imagename does not exist', async function() {
      dockerStub.listImages.resolves([]);
      const context = {
        // tslint:disable-next-line:no-empty
        logger: { log: (message: string) => {} },
        nextRelease: {
          gitTag: '',
          notes: '',
          version: 'next',
        },
        options: {
          branch: '',
          noCi: true,
          prepare: [
            {
              imageName,
              path: '@iteratec/semantic-release-docker',
            } as DockerPluginConfig,
          ],
          repositoryUrl: '',
          tagFormat: '',
        },
      } as SemanticReleaseContext;
      return expect(
        verifyConditions(config, context, (dockerStub as unknown) as Dockerode),
      ).to.eventually.be.rejectedWith(`Image with name '${imageName}' does not exist on this machine.`);
    });

    it('should NOT throw if image with imagename does exist', async function() {
      const context = {
        // tslint:disable-next-line:no-empty
        logger: { log: (message: string) => {} },
        nextRelease: {
          gitTag: '',
          notes: '',
          version: 'next',
        },
        options: {
          branch: '',
          noCi: true,
          prepare: [
            {
              imageName,
              path: '@iteratec/semantic-release-docker',
            } as DockerPluginConfig,
          ],
          repositoryUrl: '',
          tagFormat: '',
        },
      } as SemanticReleaseContext;

      return expect(
        verifyConditions(config, context, (dockerStub as unknown) as Dockerode),
      ).to.not.eventually.be.rejectedWith(`Image with name '${imageName}' does not exist on this machine.`);
    });
  });
});
