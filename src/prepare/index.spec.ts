import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Dockerode from 'dockerode';

import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { DockerPluginConfig } from '../models';
import { prepare } from './index';
import { setVerified } from '../verifyConditions';
import { buildImage } from '../test/test-helpers';
import { afterEach } from 'mocha';

describe('@iteratec/semantic-release-docker', function() {
  describe('prepare', function() {
    const config: SemanticReleaseConfig = {
      branch: '',
      noCi: true,
      repositoryUrl: '',
      tagFormat: ''
    };

    const testImage1 = 'test1';
    const testImage2 = 'test2';

    const docker = new Dockerode();

    before(async function() {
      use(chaiAsPromised);
      setVerified();

      process.env.DOCKER_REGISTRY_USER = 'username';
      process.env.DOCKER_REGISTRY_PASSWORD = 'password';
    });

    beforeEach(async function() {
      await buildImage(testImage1);
      await buildImage(testImage2);
    });

    it('should tag image with next version', async function() {
      const context = {
        // tslint:disable-next-line:no-empty
        logger: { log: (message: string) => {} },
        nextRelease: {
          gitTag: '',
          notes: '',
          version: 'next'
        },
        options: {
          branch: '',
          noCi: true,
          prepare: [
            {
              imageName: testImage1,
              path: '@iteratec/semantic-release-docker'
            } as DockerPluginConfig
          ],
          repositoryUrl: '',
          tagFormat: ''
        }
      } as SemanticReleaseContext;
      let prepareResult = await prepare(config, context);

      expect(prepareResult).to.deep.equal([[testImage1]]);

      let imagelist2 = await docker.listImages({ filters: { reference: [`${testImage1}:next`] } });
      expect(imagelist2.length).to.equal(1);
    });

    it('should tag image without next tag', async function() {
      const context = {
        // tslint:disable-next-line:no-empty
        logger: { log: (message: string) => {} },
        nextRelease: {
          gitTag: '',
          notes: '',
          version: 'next'
        },
        options: {
          branch: '',
          noCi: true,
          prepare: [
            {
              pushVersionTag: false,
              imageName: testImage1,
              path: '@iteratec/semantic-release-docker'
            } as DockerPluginConfig
          ],
          repositoryUrl: '',
          tagFormat: ''
        }
      } as SemanticReleaseContext;
      let prepareResult = await prepare(config, context);

      expect(prepareResult).to.deep.equal([[]]);

      let imagelist2 = await docker.listImages({ filters: { reference: [`${testImage1}:next`] } });
      expect(imagelist2.length).to.equal(0);
    });

    it('should add multiple tags to an image (with next version)', async function() {
      const context = {
        // tslint:disable-next-line:no-empty
        logger: { log: (message: string) => {} },
        nextRelease: {
          gitTag: '',
          notes: '',
          version: 'next'
        },
        options: {
          branch: '',
          noCi: true,
          prepare: [
            {
              imageName: testImage1,
              path: '@iteratec/semantic-release-docker',
              additionalTags: ['tag1', 'tag2']
            } as DockerPluginConfig
          ],
          repositoryUrl: '',
          tagFormat: ''
        }
      } as SemanticReleaseContext;

      let prepareResult = await prepare(config, context).then(data => data[0]);

      expect(prepareResult).to.have.length(3);

      let imagelist = await docker.listImages({ filters: { reference: [`${testImage1}:next`] } });
      expect(imagelist.length).to.equal(1);

      let imagelist1 = await docker.listImages({ filters: { reference: [`${testImage1}:tag1`] } });
      expect(imagelist1.length).to.equal(1);

      let imagelist2 = await docker.listImages({ filters: { reference: [`${testImage1}:tag2`] } });
      expect(imagelist2.length).to.equal(1);
    });

    it('should add multiple tags to an image (without next version)', async function() {
      const context = {
        // tslint:disable-next-line:no-empty
        logger: { log: (message: string) => {} },
        nextRelease: {
          gitTag: '',
          notes: '',
          version: 'next'
        },
        options: {
          branch: '',
          noCi: true,
          prepare: [
            {
              pushVersionTag: false,
              imageName: testImage1,
              path: '@iteratec/semantic-release-docker',
              additionalTags: ['tag1', 'tag2']
            } as DockerPluginConfig
          ],
          repositoryUrl: '',
          tagFormat: ''
        }
      } as SemanticReleaseContext;

      let prepareResult = await prepare(config, context).then(data => data[0]);

      expect(prepareResult).to.have.length(2);

      let imagelist1 = await docker.listImages({ filters: { reference: [`${testImage1}:tag1`] } });
      expect(imagelist1.length).to.equal(1);

      let imagelist2 = await docker.listImages({ filters: { reference: [`${testImage1}:tag2`] } });
      expect(imagelist2.length).to.equal(1);
    });

    it('should add multiple images', async function() {
      const context = {
        // tslint:disable-next-line:no-empty
        logger: { log: (message: string) => {} },
        nextRelease: {
          gitTag: '',
          notes: '',
          version: 'next'
        },
        options: {
          branch: '',
          noCi: true,
          prepare: [
            {
              imageName: testImage1,
              path: '@iteratec/semantic-release-docker'
            } as DockerPluginConfig,
            {
              imageName: testImage2,
              path: '@iteratec/semantic-release-docker'
            } as DockerPluginConfig
          ],
          repositoryUrl: '',
          tagFormat: ''
        }
      } as SemanticReleaseContext;
      let prepareResult = await prepare(config, context);

      expect(prepareResult).to.have.length(2);

      let imagelist1 = await docker.listImages({ filters: { reference: [`${testImage1}:next`] } });
      expect(imagelist1.length).to.equal(1);

      let imagelist2 = await docker.listImages({ filters: { reference: [`${testImage2}:next`] } });
      expect(imagelist2.length).to.equal(1);
    });

    afterEach(async function() {
      const imagelist1 = await docker.listImages({ filters: { reference: [testImage1] } });
      await Promise.all(
        imagelist1.map(image => {
          return docker.getImage(image.Id).remove({
            force: true
          });
        })
      );
      const imagelist2 = await docker.listImages({ filters: { reference: [testImage2] } });
      await Promise.all(
        imagelist2.map(image => {
          return docker.getImage(image.Id).remove({
            force: true
          });
        })
      );
    });
  });
});
