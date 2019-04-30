import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Dockerode from 'dockerode';
import {
  SemanticReleaseConfig,
  SemanticReleaseContext,
} from 'semantic-release';
import { createStubInstance, mock, stub } from 'sinon';

import { DockerPluginConfig } from '../dockerPluginConfig';
import { prepare } from './index';

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
    const rs = {} as NodeJS.ReadableStream;
    const iii = {} as Dockerode.ImageInspectInfo;
    const fakeImage = {
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
          resolve({});
        });
      },
    } as Dockerode.Image;
    let dockerStub: any;

    before(function() {
      use(chaiAsPromised);
    });

    before(function() {
      dockerStub = createStubInstance(Dockerode);
      dockerStub.getImage.returns(fakeImage);
    });

    it('should throw if no imagename is provided', function() {
      return expect(prepare(config, context)).to.eventually.be.rejectedWith(
        '\'imageName\' is not set in plugin configuration',
      );
    });

    it('should tag an image', async function() {
      const imageMock = mock(fakeImage);
      const fakeImageName = 'fakeTestImage';
      const expected = {
        repo: fakeImageName,
        tag: context.nextRelease!.version,
      };
      (context.options
        .prepare![0] as DockerPluginConfig).imageName = fakeImageName;
      // setup the mock with expectations
      imageMock
        .expects('tag')
        .once()
        .withExactArgs(expected)
        .resolves({ name: fakeImageName });
      await prepare(config, context, dockerStub);
      // tslint:disable-next-line: no-unused-expression
      expect(imageMock.verify()).to.not.throw;
    });

    it('should add multiple tags to an image', async function() {
      const imageStub = stub(fakeImage);
      const fakeImageName = 'fakeTestImage';
      const expected = [context.nextRelease!.version!, 'tag1', 'tag2'];
      (context.options
        .prepare![0] as DockerPluginConfig).imageName = fakeImageName;
      (context.options.prepare![0] as DockerPluginConfig).additionalTags = [
        expected[1],
        expected[2],
      ];
      // setup the mock with expectations
      imageStub.tag.resolves({ name: fakeImageName });

      await prepare(config, context, dockerStub);
      // tslint:disable-next-line: no-unused-expression
      expect(imageStub.tag.calledThrice).to.be.true;
      expect(imageStub.tag.firstCall.args[0]).to.deep.equal({
        repo: fakeImageName,
        tag: expected[0],
      });
      expect(imageStub.tag.secondCall.args[0]).to.deep.equal({
        repo: fakeImageName,
        tag: expected[1],
      });
      expect(imageStub.tag.thirdCall.args[0]).to.deep.equal({
        repo: fakeImageName,
        tag: expected[2],
      });
    });
  });
});
