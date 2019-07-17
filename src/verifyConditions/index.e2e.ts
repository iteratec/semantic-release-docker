import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Docker from 'dockerode';
import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { DockerPluginConfig } from '../models';
import { buildImage } from '../test/test-helpers';
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

    before(function() {
      use(chaiAsPromised);
    });

    it('should throw if image with imagename does not exist', async function() {
      const docker = new Docker();
      await docker.getImage(imageName).remove();

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
      return expect(verifyConditions(config, context)).to.eventually.be.rejectedWith(
        `Image with name '${imageName}' does not exist on this machine.`,
      );
    });

    it('should NOT throw if image with imagename does exist', async function() {
      this.timeout(5000);
      await buildImage(imageName);
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

      return expect(verifyConditions(config, context)).to.not.eventually.be.rejectedWith(
        `Image with name '${imageName}' does not exist on this machine.`,
      );
    });

    after(async function() {
      const docker = new Docker();
      await docker.getImage(imageName).remove();
    });
  });
});
