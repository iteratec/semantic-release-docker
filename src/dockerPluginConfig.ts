export interface DockerPluginConfig {
  imageName: string;
  movingTags?: string[];
  registryUrl?: string;
  repositoryName?: string;
}
