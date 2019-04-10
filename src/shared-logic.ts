import { Credentials, DockerPluginConfig } from "./models";

export function constructImageName(config: DockerPluginConfig): string {
  return (
    `${config.registryUrl ? `${config.registryUrl}/` : ""}` +
    `${config.repositoryName ? `${config.repositoryName}/` : ""}` +
    `${config.imageName}`
  );
}

export function getRegistryUrlFromConfig(config: DockerPluginConfig): string {
  return process.env.DOCKER_REGISTRY_URL
    ? process.env.DOCKER_REGISTRY_URL
    : config.registryUrl
    ? config.registryUrl
    : "";
}

/**
 * Get Authentication object from Environment Variables
 * Throws Error if Variables are not set.
 */
export function getCredentials(): Credentials {
  // Check DOCKER_REGISTRY_USER Environment Variable
  if (!process.env.DOCKER_REGISTRY_USER) {
    throw new Error("Environment variable DOCKER_REGISTRY_USER must be set in order to login to the registry.");
  }

  // Check DOCKER_REGISTRY_PASSWORD Environment Variable
  if (!process.env.DOCKER_REGISTRY_PASSWORD) {
    throw new Error("Environment variable DOCKER_REGISTRY_PASSWORD must be set in order to login to the registry.");
  }

  return {
    username: process.env.DOCKER_REGISTRY_USER,
    password: process.env.DOCKER_REGISTRY_PASSWORD
  };
}
