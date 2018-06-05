import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { DockerPluginConfig } from '../dockerPluginConfig';
import { Registry } from '../model/registry';

export var verified = false;

export async function verifyConditions(pluginConfig: SemanticReleaseConfig, context: SemanticReleaseContext) {
  if (!process.env.DOCKER_REGISTRY_USER) {
    throw new Error('Environment variable DOCKER_REGISTRY_USER must be set in order to login to the registry.');
  }
  if (!process.env.DOCKER_REGISTRY_PASSWORD) {
    throw new Error('Environment variable DOCKER_REGISTRY_PASSWORD must be set in order to login to the registry.');
  }
  let preparePlugin: DockerPluginConfig;
  if (!context.options.prepare ||
      !context.options.prepare!.find((p) => p.path === '@iteratec/semantic-release-docker')) {
    throw new Error('\'prepare\' is not configured');
  }
  preparePlugin = context.options.prepare
    .find((p) => p.path === '@iteratec/semantic-release-docker') as DockerPluginConfig;
  let registryUrl: string;
  if (process.env.DOCKER_REGISTRY_URL || preparePlugin.registryUrl) {
    registryUrl = process.env.DOCKER_REGISTRY_URL ? process.env.DOCKER_REGISTRY_URL : preparePlugin.registryUrl!;
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
