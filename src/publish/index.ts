import Dockerode from 'dockerode';

import { DockerPluginConfig } from '../dockerPluginConfig';
import { Auth } from '../model/auth';
import { prepare } from '../prepare';
import { PrepareParams } from '../prepare/prepareParams';

declare var prepared: boolean;

interface PushOptions extends Auth {
  tag: string;
}

export async function publish(pluginConfig: DockerPluginConfig, params: PrepareParams) {
  if (!prepared) {
    prepare(pluginConfig, params);
  }
  const docker = new Dockerode();
  const tags = [params.nextRelease.version];
  if (pluginConfig.prepare.additionalTags && pluginConfig.prepare.additionalTags.length > 0) {
    tags.concat(pluginConfig.prepare.additionalTags);
  }
  const image = docker.getImage(
    `${pluginConfig.prepare.registryUrl ? `${pluginConfig.prepare.registryUrl}/` : ''}` +
    `${pluginConfig.prepare.repositoryName ? `${pluginConfig.prepare.repositoryName}/` : ''}` +
    `${pluginConfig.prepare.imageName}`);
  const options: PushOptions = {
    password: process.env.DOCKER_REGISTRY_PASSWORD!,
    serveraddress: process.env.DOCKER_REGISTRY_URL ?
      process.env.DOCKER_REGISTRY_URL : pluginConfig.prepare.registryUrl ? pluginConfig.prepare.registryUrl : '',
    tag: '',
    username: process.env.DOCKER_REGISTRY_USER!,
  };
  return Promise.all(tags.map((imageTag: string) => {
    options.tag = imageTag;
    return image.push(options);
  }))
    .then((data) => {
      return true;
    })
    .catch((error) => {
      throw new Error(error);
    });
}
