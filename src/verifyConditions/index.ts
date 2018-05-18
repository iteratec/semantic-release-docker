import { Logger } from '../../typings/semantic-release';
import { DockerPluginConfig } from '../dockerPluginConfig';
import { Registry } from '../model/registry';

var verified = false;

export async function verifyConditions(pluginConfig: DockerPluginConfig, logger: Logger) {
  if (!process.env.DOCKER_REGISTRY_USER) {
    throw new Error('Environment variable DOCKER_REGISTRY_USER must be set in order to login to the registry.');
  }
  if (!process.env.DOCKER_REGISTRY_PASSWORD) {
    throw new Error('Environment variable DOCKER_REGISTRY_PASSWORD must be set in order to login to the registry.');
  }
  let registryUrl: string;
  if (process.env.DOCKER_REGISTRY_URL || pluginConfig.prepare.registryUrl) {
    registryUrl = process.env.DOCKER_REGISTRY_URL ? process.env.DOCKER_REGISTRY_URL : pluginConfig.prepare.registryUrl!;
  } else {
    registryUrl = '';
  }
  const registry = new Registry(registryUrl);
  return registry.login(process.env.DOCKER_REGISTRY_USER, process.env.DOCKER_REGISTRY_PASSWORD)
    .then((result) => {
      if (!verified) {
        verified = true;
      }
  });
}
