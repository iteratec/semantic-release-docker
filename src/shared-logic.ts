import { Credentials, DockerPluginConfig } from './models';
import { SemanticReleaseContext } from 'semantic-release';

export function constructImageName(config: DockerPluginConfig): string {
  return (
    `${config.registryUrl ? `${config.registryUrl}/` : ''}` +
    `${config.repositoryName ? `${config.repositoryName}/` : ''}` +
    `${config.imageName}`
  );
}

export function getRegistryUrlFromConfig(config: DockerPluginConfig): string {
  return process.env.DOCKER_REGISTRY_URL
    ? process.env.DOCKER_REGISTRY_URL
    : config.registryUrl
    ? config.registryUrl
    : '';
}

export function getImageTagsFromConfig(config: DockerPluginConfig, context: SemanticReleaseContext): string[] {
  let tags = [];
  tags.push(context.nextRelease!.version!);
  if (config.additionalTags && config.additionalTags.length > 0) {
    tags = tags.concat(config.additionalTags);
  }
  return tags;
}

/**
 * Get Authentication object from Environment Variables
 * Throws Error if Variables are not set.
 */
export function getCredentials(): Credentials {
  // Check DOCKER_REGISTRY_USER Environment Variable
  if (!process.env.DOCKER_REGISTRY_USER) {
    throw new Error('Environment variable DOCKER_REGISTRY_USER must be set in order to login to the registry.');
  }

  // Check DOCKER_REGISTRY_PASSWORD Environment Variable
  if (!process.env.DOCKER_REGISTRY_PASSWORD) {
    throw new Error('Environment variable DOCKER_REGISTRY_PASSWORD must be set in order to login to the registry.');
  }

  return {
    username: process.env.DOCKER_REGISTRY_USER,
    password: process.env.DOCKER_REGISTRY_PASSWORD
  };
}
