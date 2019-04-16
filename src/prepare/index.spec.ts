import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Dockerode from 'dockerode';

import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { DockerPluginConfig } from '../models';
import { prepare } from './index';
import { setVerified } from '../verifyConditions';
import { buildImage } from '../test/test-helpers';

describe('@iteratec/semantic-release-docker', function() {
  describe('prepare', function() {
    const config: SemanticReleaseConfig = {
      branch: '',
      noCi: true,
      repositoryUrl: '',
      tagFormat: ''
    };

    const testImage1 = 'test1:latest';
    const testImage2 = 'test2:latest';

    before(async function() {
      use(chaiAsPromised);
      setVerified();

      await buildImage(testImage1);
      await buildImage(testImage2);

      process.env.DOCKER_REGISTRY_USER = 'username';
      process.env.DOCKER_REGISTRY_PASSWORD = 'password';
    });

    it('should tag an image', async function() {
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
      const docker = new Dockerode();
      let prepareResult = await prepare(config, context);

      expect(prepareResult).to.deep.equal([[testImage1]]);

      let imagelist = await docker.listImages({ filters: { reference: [testImage1] } });
      expect(imagelist.length).to.equal(1);
    });

    it('should add multiple tags to an image', async function() {
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
      return expect(prepare(config, context).then(data => data[0])).to.eventually.have.length(3);
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
              imageName: 'test2',
              path: '@iteratec/semantic-release-docker'
            } as DockerPluginConfig
          ],
          repositoryUrl: '',
          tagFormat: ''
        }
      } as SemanticReleaseContext;
      return expect(prepare(config, context)).to.eventually.have.length(2);
    });

    after(async function() {
      const docker = new Dockerode();
      await docker.getImage(testImage1).remove();
      await docker.getImage(testImage2).remove();
    });
  });
});

// describe('test', function() {
//   before(async function() {
//     console.log('before');
//   });

//   it('should be true', async function() {
//     await expect(delayed(100)).to.eventually.be.equal(1);

//     return expect(delayed(100)).to.eventually.be.equal(1);
//   });

//   after(async function() {
//     console.log('after');
//   });
// });

// function delayed(delay: number) {
//   return new Promise<number>(resolve => {
//     setTimeout(() => {
//       resolve(1);
//       console.log('delayed');
//     }, delay);
//   });
// }
