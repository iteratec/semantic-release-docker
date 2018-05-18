import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Dockerode from 'dockerode';
import { DockerPluginConfig } from '../dockerPluginConfig';

import { prepare } from './index';
import { PrepareParams } from './prepareParams';

describe('prepare plugin', function() {

  before(function() {
    use(chaiAsPromised);
  });

  before(async function() {
    this.timeout(10000);
    const docker = new Dockerode();
    return await docker.pull('hello-world', {});
  });

  it('should throw if no imagename is provided', function() {
    const config: DockerPluginConfig = {
      prepare: {
        imageName: '',
      },
    };
    const params: PrepareParams = {
      // tslint:disable-next-line:no-empty
      logger: {log: (message: string) => {}},
      nextRelease: {version: 'next'},
    };
    return expect(prepare(config, params)).to.be.rejectedWith('\'imageName\' is not set in plugin configuration');
  });

  it('should tag an image', function() {
    const config: DockerPluginConfig = {
      prepare: {
        imageName: 'hello-world',
      },
    };
    const params: PrepareParams = {
      // tslint:disable-next-line:no-empty
      logger: {log: (message: string) => {}},
      nextRelease: {version: 'next'},
    };
    return expect(prepare(config, params)).to.eventually.deep.equal(['hello-world']);
  });

});
