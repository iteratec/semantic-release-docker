import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Dockerode from 'dockerode';

import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { DockerPluginConfig } from '../models';
import { prepare } from './index';
import { setVerified } from '../verifyConditions';

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

    before(function() {
      use(chaiAsPromised);
      setVerified();
    });

    before(async function() {
      this.timeout(10000);
      const docker = new Dockerode();
      await docker.buildImage(
        {
          context: './',
          src: ['Dockerfile']
        },
        {
          t: testImage1
        },
        function(error, output) {
          if (error) {
            return console.error(error);
          }
        }
      );
      await docker.buildImage(
        {
          context: './',
          src: ['Dockerfile']
        },
        {
          t: testImage2
        },
        function(error, output) {
          if (error) {
            return console.error(error);
          }
        }
      );
      process.env.DOCKER_REGISTRY_USER = 'username';
      process.env.DOCKER_REGISTRY_PASSWORD = 'password';
    });

    it('should tag an image', function() {
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
      return expect(prepare(config, context)).to.eventually.deep.equal([[testImage1]]);
    });

    it('should add multiple tags to an image', function() {
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

    it('should add multiple images', function() {
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
      docker.getImage(testImage1).remove();
      docker.getImage(testImage2).remove();
    });
  });
});
