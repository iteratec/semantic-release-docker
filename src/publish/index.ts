import Dockerode from 'dockerode';

import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { DockerPluginConfig } from '../dockerPluginConfig';
import { Auth } from '../model/auth';
import { prepare, prepared } from '../prepare';

interface PushOptions extends Auth {
  tag: string;
}

export interface PublishedRelease {
  completeImageName: string[];
}

export async function publish(pluginConfig: SemanticReleaseConfig, context: SemanticReleaseContext) {
  if (!prepared) {
    prepare(pluginConfig, context);
  }
  const docker = new Dockerode();

  const preparePlugins = context.options.prepare!.filter(
    (p) => p.path === '@iteratec/semantic-release-docker',
  ) as DockerPluginConfig[];

  return Promise.all(
    preparePlugins.map((preparePlugin) => {
      let tags = [context.nextRelease!.version!];
      if (preparePlugin.additionalTags && preparePlugin.additionalTags.length > 0) {
        tags = tags.concat(preparePlugin.additionalTags);
      }
      const imageName =
        `${preparePlugin.registryUrl ? `${preparePlugin.registryUrl}/` : ''}` +
        `${preparePlugin.repositoryName ? `${preparePlugin.repositoryName}/` : ''}` +
        `${preparePlugin.imageName}`;
      const image = docker.getImage(imageName);
      const options: PushOptions = {
        password: process.env.DOCKER_REGISTRY_PASSWORD!,
        serveraddress: process.env.DOCKER_REGISTRY_URL
          ? process.env.DOCKER_REGISTRY_URL
          : preparePlugin.registryUrl
          ? preparePlugin.registryUrl
          : '',
        tag: '',
        username: process.env.DOCKER_REGISTRY_USER!,
      };
      return Promise.all(
        tags.map((imageTag: string) => {
          options.tag = imageTag;
          context.logger.log(`pushing image ${imageName}:${imageTag}`);
          return image.push(options);
        }),
      )
        .then((streams) =>
          Promise.all(
            streams.map(
              (stream) =>
                new Promise((resolve, reject) => {
                  stream.on('data', (chunk) => context.logger.log(chunk.toString()));
                  stream.on('end', () => resolve());
                  stream.on('error', (error) => {
                    reject(error);
                  });
                }),
            ),
          ),
        )
        .then(() => {
          return {
            completeImageName: tags.map((tag: string) => `${imageName}:${tag}`),
          } as PublishedRelease;
        })
        .catch((error) => {
          throw new Error(error);
        });
    }),
  );
}
