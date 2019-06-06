import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Dockerode from 'dockerode';
import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { createStubInstance, mock, stub } from 'sinon';
import { DockerPluginConfig } from '../models';
import { constructImageName } from '../shared-logic';
import { buildImage } from '../test/test-helpers';
import { setVerified } from '../verifyConditions';
import { prepare } from './index';

describe('@iteratec/semantic-release-docker', function() {
  describe('prepare', function() {
    const config: SemanticReleaseConfig = {
      branch: '',
      noCi: true,
      repositoryUrl: '',
      tagFormat: '',
    };

    const testImage1 = 'test1';
    const testImage2 = 'test2';

    before(async function() {
      use(chaiAsPromised);
      setVerified();

      process.env.DOCKER_REGISTRY_USER = 'username';
      process.env.DOCKER_REGISTRY_PASSWORD = 'password';
    });

    beforeEach(async function() {
      this.timeout(20000);
      await buildImage(testImage1);
      await buildImage(testImage2);
    });

    it('should tag image with next version', async function() {
      const image = new Dockerode.Image('', testImage1);
      const imageMock = mock(image);
      const dockerStub = createStubInstance(Dockerode);
      dockerStub.getImage.returns(image);

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
              imageName: testImage1,
              path: '@iteratec/semantic-release-docker',
            } as DockerPluginConfig,
          ],
          repositoryUrl: '',
          tagFormat: '',
        },
      } as SemanticReleaseContext;

      // setup the mock with expectations
      imageMock
        .expects('tag')
        .once()
        .withExactArgs({
          repo: constructImageName(context.options.prepare![0] as DockerPluginConfig),
          tag: 'next',
        })
        .resolves({ name: testImage1 });

      const prepareResult = await prepare(config, context, (dockerStub as unknown) as Dockerode);
      // tslint:disable-next-line: no-unused-expression
      expect(imageMock.verify()).to.not.throw;
      expect(prepareResult).to.deep.equal([[testImage1]]);
    });

    it('should tag image with next version and repositoryName', async function() {
      const image = new Dockerode.Image('', testImage1);
      const imageMock = mock(image);
      const dockerStub = createStubInstance(Dockerode);
      dockerStub.getImage.returns(image);

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
              imageName: testImage1,
              repositoryName: 'repository',
              path: '@iteratec/semantic-release-docker',
            } as DockerPluginConfig,
          ],
          repositoryUrl: '',
          tagFormat: '',
        },
      } as SemanticReleaseContext;

      // setup the mock with expectations
      imageMock
        .expects('tag')
        .once()
        .withExactArgs({
          repo: constructImageName(context.options.prepare![0] as DockerPluginConfig),
          tag: 'next',
        })
        .resolves({ name: testImage1 });

      const prepareResult = await prepare(config, context, (dockerStub as unknown) as Dockerode);
      // tslint:disable-next-line: no-unused-expression
      expect(imageMock.verify()).to.not.throw;
      expect(prepareResult).to.deep.equal([[testImage1]]);
    });

    it('should tag image with next version and repositoryName and url', async function() {
      const image = new Dockerode.Image('', testImage1);
      const imageMock = mock(image);
      const dockerStub = createStubInstance(Dockerode);
      dockerStub.getImage.returns(image);

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
              imageName: testImage1,
              repositoryName: 'repository',
              registryUrl: 'repositoryurl',
              path: '@iteratec/semantic-release-docker',
            } as DockerPluginConfig,
          ],
          repositoryUrl: '',
          tagFormat: '',
        },
      } as SemanticReleaseContext;

      // setup the mock with expectations
      imageMock
        .expects('tag')
        .once()
        .withExactArgs({
          repo: constructImageName(context.options.prepare![0] as DockerPluginConfig),
          tag: 'next',
        })
        .resolves({ name: testImage1 });

      const prepareResult = await prepare(config, context, (dockerStub as unknown) as Dockerode);
      expect(imageMock.verify()).to.not.throw;

      expect(prepareResult).to.deep.equal([[testImage1]]);
    });

    it('should add multiple tags to an image (with next version)', async function() {
      const image = new Dockerode.Image('', testImage1);
      const imageStub = stub(image);
      const dockerStub = createStubInstance(Dockerode);
      dockerStub.getImage.returns(image);

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
              imageName: testImage1,
              path: '@iteratec/semantic-release-docker',
              additionalTags: ['tag1', 'tag2'],
            } as DockerPluginConfig,
          ],
          repositoryUrl: '',
          tagFormat: '',
        },
      } as SemanticReleaseContext;

      imageStub.tag.resolves({ name: testImage1 });

      const prepareResult = await prepare(config, context, (dockerStub as unknown) as Dockerode).then((data) => data[0]);

      // tslint:disable-next-line: no-unused-expression
      expect(imageStub.tag.calledThrice).to.be.true;
      expect(prepareResult).to.have.length(3);

      expect(imageStub.tag.firstCall.args[0]).to.deep.equal({
        repo: testImage1,
        tag: 'next',
      });
      expect(imageStub.tag.secondCall.args[0]).to.deep.equal({
        repo: testImage1,
        tag: 'tag1',
      });
      expect(imageStub.tag.thirdCall.args[0]).to.deep.equal({
        repo: testImage1,
        tag: 'tag2',
      });
    });

    it('should add multiple images', async function() {
      const image1 = new Dockerode.Image('', testImage1);
      const image1Mock = mock(image1);
      const image2 = new Dockerode.Image('', testImage2);
      const image2Mock = mock(image2);
      // const imageMock = mock(image);
      const dockerStub = createStubInstance(Dockerode);
      dockerStub.getImage.onCall(0).returns(image1);
      dockerStub.getImage.onCall(1).returns(image2);

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
              imageName: testImage1,
              path: '@iteratec/semantic-release-docker',
            } as DockerPluginConfig,
            {
              imageName: testImage2,
              path: '@iteratec/semantic-release-docker',
            } as DockerPluginConfig,
          ],
          repositoryUrl: '',
          tagFormat: '',
        },
      } as SemanticReleaseContext;

      image1Mock
        .expects('tag')
        .once()
        .withExactArgs({
          repo: constructImageName(context.options.prepare![0] as DockerPluginConfig),
          tag: 'next',
        })
        .resolves({ name: testImage1 });

      image2Mock
        .expects('tag')
        .once()
        .withExactArgs({
          repo: constructImageName(context.options.prepare![1] as DockerPluginConfig),
          tag: 'next',
        })
        .resolves({ name: testImage2 });

      const prepareResult = await prepare(config, context, (dockerStub as unknown) as Dockerode);

      expect(prepareResult).to.deep.equal([[testImage1], [testImage2]]);
      expect(image1Mock.verify()).to.not.throw;
      expect(image2Mock.verify()).to.not.throw;
    });
  });
});
