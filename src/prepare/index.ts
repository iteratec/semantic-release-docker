import Dockerode from 'dockerode';

import { DockerPluginConfig } from '../dockerPluginConfig';
import { PrepareParams } from './prepareParams';

var prepared = false;

export async function prepare(pluginConfig: DockerPluginConfig, params: PrepareParams): Promise<string[]> {
  if (!pluginConfig.imageName) {
    throw new Error('\'imageName\' is not set in plugin configuration');
  }
  const docker = new Dockerode();
  const image = docker.getImage(pluginConfig.imageName);
  const tags = [params.nextRelease.version];
  if (pluginConfig.movingTags && pluginConfig.movingTags.length > 0) {
    tags.concat(pluginConfig.movingTags);
  }
  return Promise.all(tags.map((imagetag) => {
    return image.tag({
      repo: `${pluginConfig.registryUrl ? `${pluginConfig.registryUrl}/` : ''}` +
      `${pluginConfig.repositoryName ? `${pluginConfig.repositoryName}/` : ''}` +
      `${pluginConfig.imageName}`,
      tag: imagetag,
    });
  }))
  .then((data) => {
    if (!prepared) {
      prepared = true;
    }
    return data.map((result) => result.name);
  })
  .catch((error) => {
    throw new Error(error);
  });
}
