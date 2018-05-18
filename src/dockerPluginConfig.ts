export interface DockerPluginConfig {
  prepare: {
    additionalTags?: string[];
    imageName: string;
    registryUrl?: string;
    repositoryName?: string;
  };
}
