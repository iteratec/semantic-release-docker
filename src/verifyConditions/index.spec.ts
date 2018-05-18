import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { Logger } from '../../typings/semantic-release';
import { verifyConditions } from "./index";

describe('docker verifyConditions plugin', function() {

  before(function() {
    use(chaiAsPromised);
  });

  afterEach(function() {
    process.env.DOCKER_REGISTRY_USER = '';
    process.env.DOCKER_REGISTRY_PASSWORD = '';
    process.env.DOCKER_REGISTRY_URL = '';
  });

  it('should throw when the username is not set', function() {
    // tslint:disable-next-line:no-empty
    const logger: Logger = {log: () => {}};
    return expect(verifyConditions({registryUrl: '', imageName: ''}, logger)).to.eventually.be
      .rejectedWith('Environment variable DOCKER_REGISTRY_USER must be set in order to login to the registry.');
  });

  it('should throw when the password is not set', function() {
    // tslint:disable-next-line:no-empty
    const logger: Logger = {log: () => {}};
    process.env.DOCKER_REGISTRY_USER = 'username';
    return expect(verifyConditions({registryUrl: '', imageName: ''}, logger)).to.eventually.be
      .rejectedWith('Environment variable DOCKER_REGISTRY_PASSWORD must be set in order to login to the registry.');
  });

  it('should use the registry from the config', function() {
    // tslint:disable-next-line:no-empty
    const logger: Logger = {log: () => {}};
    process.env.DOCKER_REGISTRY_USER = 'username';
    process.env.DOCKER_REGISTRY_PASSWORD = 'password';
    return expect(verifyConditions({registryUrl: 'my_private_registry', imageName: ''}, logger)).to.eventually.be
      .rejectedWith(/(?:my_private_registry)/);
  });

  it('should prefer the registry from the environment variable over the one from the config', function() {
    // tslint:disable-next-line:no-empty
    const logger: Logger = {log: () => {}};
    process.env.DOCKER_REGISTRY_USER = 'username';
    process.env.DOCKER_REGISTRY_PASSWORD = 'password';
    process.env.DOCKER_REGISTRY_URL = 'my_other_private_registry';
    return expect(verifyConditions({registryUrl: 'my_private_registry', imageName: ''}, logger)).to.eventually.be
      .rejectedWith(/(?:my_other_private_registry)/);
  });

  it('should default to docker hub if no registry is specified', function() {
    this.timeout(10000);
    // tslint:disable-next-line:no-empty
    const logger: Logger = {log: () => {}};
    process.env.DOCKER_REGISTRY_USER = 'badusername';
    process.env.DOCKER_REGISTRY_PASSWORD = 'pass@w0rd';
    return expect(verifyConditions({registryUrl: '', imageName: ''}, logger)).to.eventually.be
      .rejectedWith(/(?:index.docker.com|registry-1.docker.io)/);
  });

});
