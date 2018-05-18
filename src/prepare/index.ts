import Dockerode from 'dockerode';

import { DockerPluginConfig } from '../dockerPluginConfig';
import { PrepareParams } from './prepareParams';

var prepared = false;

export async function prepare(pluginConfig: DockerPluginConfig, params: PrepareParams): Promise<string[]> {
  if (!pluginConfig.prepare.imageName) {
    throw new Error('\'imageName\' is not set in plugin configuration');
  }
  const docker = new Dockerode();
  const image = docker.getImage(pluginConfig.prepare.imageName);
  const tags = [params.nextRelease.version];
  if (pluginConfig.prepare.additionalTags && pluginConfig.prepare.additionalTags.length > 0) {
    tags.concat(pluginConfig.prepare.additionalTags);
  }
  return Promise.all(tags.map((imagetag) => {
    return image.tag({
      repo: `${pluginConfig.prepare.registryUrl ? `${pluginConfig.prepare.registryUrl}/` : ''}` +
      `${pluginConfig.prepare.repositoryName ? `${pluginConfig.prepare.repositoryName}/` : ''}` +
      `${pluginConfig.prepare.imageName}`,
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
