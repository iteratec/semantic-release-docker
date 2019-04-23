import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Dockerode from 'dockerode';
import {
  SemanticReleaseConfig,
  SemanticReleaseContext,
} from 'semantic-release';
import { createStubInstance } from 'sinon';

import { DockerPluginConfig } from '../dockerPluginConfig';
import { initDocker, prepare } from './index';

// declare var docker: any;

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

    before(function() {
      this.timeout(10000);
      // const docker = new Dockerode();
      // return await docker.pull('hello-world', {});
      const rs = {} as NodeJS.ReadableStream;
      const iii = {} as Dockerode.ImageInspectInfo;
      const stub = createStubInstance(Dockerode);
      stub.getImage.returns({
        get(
          callback?: (error?: any, result?: NodeJS.ReadableStream) => void,
        ): any {
          if (callback) {
            return;
          }
          return new Promise<NodeJS.ReadableStream>(() => rs);
        },
        history(callback?: (error?: any, result?: any) => void): any {
          if (callback) {
            return;
          }
          return new Promise<any>(() => '');
        },
        inspect(
          callback?: (error?: any, result?: Dockerode.ImageInspectInfo) => void,
        ): any {
          if (callback) {
            return;
          }
          return new Promise<Dockerode.ImageInspectInfo>(() => iii);
        },
        modem: '',
        push(
          options?: {},
          callback?: (error?: any, result?: NodeJS.ReadableStream) => void,
        ): any {
          if (callback) {
            return;
          }
          return new Promise<NodeJS.ReadableStream>(() => rs);
        },
        remove(
          options?: {},
          callback?: (error?: any, result?: Dockerode.ImageRemoveInfo) => void,
        ): any {
          if (callback) {
            return;
          }
          return new Promise<any>(() => '');
        },
        tag(options?: {}, callback?: () => void): any {
          if (callback) {
            return;
          }
          return new Promise<any>((resolve) => {
            resolve({ name: stub.getImage.args[0] });
          });
        },
      });
      initDocker(stub);
    });

    it('should throw if no imagename is provided', function() {
      return expect(prepare(config, context)).to.be.rejectedWith(
        '\'imageName\' is not set in plugin configuration',
      );
    });

    it('should tag an image', function() {
      const expected = 'hello-world';
      (context.options.prepare![0] as DockerPluginConfig).imageName = expected;
      const actual = prepare(config, context);
      return expect(actual).to.eventually.not.be.rejected;
    });

    it('should add multiple tags to an image', function() {
      (context.options.prepare![0] as DockerPluginConfig).imageName =
        'hello-world';
      (context.options.prepare![0] as DockerPluginConfig).additionalTags = [
        'tag1',
        'tag2',
      ];
      return expect(prepare(config, context)).to.eventually.have.length(3);
    });
  });
});
