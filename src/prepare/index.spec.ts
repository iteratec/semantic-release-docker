import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Dockerode from 'dockerode';

import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { DockerPluginConfig } from '../dockerPluginConfig';
import { prepare } from './index';

describe('@iteratec/semantic-release-docker', function() {

  describe('prepare', function() {
    const config: SemanticReleaseConfig = {
      branch: '',
      noCi: true,
      repositoryUrl: '',
      tagFormat: '',
    };
    const context: SemanticReleaseContext = {

      // tslint:disable-next-line:no-empty
      logger: { log: (message: string) => {}},
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

    before(async function() {
      this.timeout(10000);
      const docker = new Dockerode();
      return await docker.pull('hello-world', {});
    });

    it('should throw if no imagename is provided', function() {
      return expect(prepare(config, context)).to.be.rejectedWith('\'imageName\' is not set in plugin configuration');
    });

    it('should tag an image', function() {
      (context.options.prepare![0] as DockerPluginConfig).imageName = 'hello-world';
      return expect(prepare(config, context)).to.eventually.deep.equal(['hello-world']);
    });

  });
});
