import { SemanticReleasePlugin } from 'semantic-release';
export interface DockerPluginConfig extends SemanticReleasePlugin {
    additionalTags?: string[];
    imageName: string;
    registryUrl?: string;
    repositoryName?: string;
}
