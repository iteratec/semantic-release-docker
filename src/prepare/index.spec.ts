import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Dockerode from 'dockerode';

import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { DockerPluginConfig } from '../models';
import { prepare } from './index';

describe('@iteratec/semantic-release-docker', function() {
  describe('prepare', function() {
    const config: SemanticReleaseConfig = {
      branch: '',
      noCi: true,
      repositoryUrl: '',
      tagFormat: '',
    };

    before(function() {
      use(chaiAsPromised);
    });

    before(async function() {
      this.timeout(10000);
      const docker = new Dockerode();
      docker.buildImage(
        {
          context: './',
          src: ['Dockerfile'],
        },
        {
          t: 'test1:latest',
        },
        function(error, output) {
          if (error) {
            return console.error(error);
          }
        },
      );
      docker.buildImage(
        {
          context: './',
          src: ['Dockerfile'],
        },
        {
          t: 'test2:latest',
        },
        function(error, output) {
          if (error) {
            return console.error(error);
          }
        },
      );
      process.env.DOCKER_REGISTRY_USER = 'username';
      process.env.DOCKER_REGISTRY_PASSWORD = 'password';
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
      return expect(prepare(config, context)).to.be.rejectedWith('\'imageName\' is not set in plugin configuration');
    });

    //   it('should tag an image', function() {
    //     const context = {
    //       // tslint:disable-next-line:no-empty
    //       logger: { log: (message: string) => {} },
    //       nextRelease: {
    //         gitTag: '',
    //         notes: '',
    //         version: 'next',
    //       },
    //       options: {
    //         branch: '',
    //         noCi: true,
    //         prepare: [
    //           {
    //             imageName: 'test1',
    //             path: '@iteratec/semantic-release-docker',
    //           } as DockerPluginConfig,
    //         ],
    //         repositoryUrl: '',
    //         tagFormat: '',
    //       },
    //     } as SemanticReleaseContext;
    //     return expect(prepare(config, context)).to.eventually.deep.equal([['test1']]);
    //   });

    //   it('should add multiple tags to an image', function() {
    //     const context = {
    //       // tslint:disable-next-line:no-empty
    //       logger: { log: (message: string) => {} },
    //       nextRelease: {
    //         gitTag: '',
    //         notes: '',
    //         version: 'next',
    //       },
    //       options: {
    //         branch: '',
    //         noCi: true,
    //         prepare: [
    //           {
    //             imageName: 'test1',
    //             path: '@iteratec/semantic-release-docker',
    //             additionalTags: ['tag1', 'tag2'],
    //           } as DockerPluginConfig,
    //         ],
    //         repositoryUrl: '',
    //         tagFormat: '',
    //       },
    //     } as SemanticReleaseContext;
    //     return expect(prepare(config, context).then((data) => data[0])).to.eventually.have.length(3);
    //   });

    //   it('should add multiple images', function() {
    //     const context = {
    //       // tslint:disable-next-line:no-empty
    //       logger: { log: (message: string) => {} },
    //       nextRelease: {
    //         gitTag: '',
    //         notes: '',
    //         version: 'next',
    //       },
    //       options: {
    //         branch: '',
    //         noCi: true,
    //         prepare: [
    //           {
    //             imageName: 'test1',
    //             path: '@iteratec/semantic-release-docker',
    //           } as DockerPluginConfig,
    //           {
    //             imageName: 'test2',
    //             path: '@iteratec/semantic-release-docker',
    //           } as DockerPluginConfig,
    //         ],
    //         repositoryUrl: '',
    //         tagFormat: '',
    //       },
    //     } as SemanticReleaseContext;
    //     return expect(prepare(config, context)).to.eventually.have.length(2);
    //   });
  });
});
