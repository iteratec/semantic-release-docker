import Dockerode from 'dockerode';

import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { Authentication, DockerPluginConfig } from '../models';
import { pluginSettings } from '../plugin-settings';
import { prepare, prepared } from '../prepare';
import { constructImageName, getRegistryUrlFromConfig, getImageTagsFromConfig } from '../shared-logic';

interface PushOptions extends Authentication {
  tag: string;
}

export interface PublishedRelease {
  completeImageName: string[];
}

export async function publish(pluginConfig: SemanticReleaseConfig, context: SemanticReleaseContext) {
  if (!prepared) {
    await prepare(pluginConfig, context).then(
      () => {},
      reject => {
        return Promise.reject(reject);
      }
    );
  }

  const docker = new Dockerode();

  const preparePlugins = context.options.prepare!.filter(p => p.path === pluginSettings.path) as DockerPluginConfig[];

  return Promise.all(
    preparePlugins.map(preparePlugin => {
      const tags = getImageTagsFromConfig(preparePlugin, context);

      const imageName = constructImageName(preparePlugin);

      const image = docker.getImage(imageName);
      const options: PushOptions = {
        password: process.env.DOCKER_REGISTRY_PASSWORD!,
        serveraddress: getRegistryUrlFromConfig(preparePlugin),
        tag: '',
        username: process.env.DOCKER_REGISTRY_USER!
      };
      return Promise.all(
        tags.map((imageTag: string) => {
          options.tag = imageTag;
          context.logger.log(`pushing image ${imageName}:${imageTag}`);
          return image.push(options);
        })
      )
        .then(streams =>
          Promise.all(
            streams.map(
              stream =>
                new Promise((resolve, reject) => {
                  stream.on('data', chunk => context.logger.log(chunk.toString()));
                  stream.on('end', () => resolve());
                  stream.on('error', error => {
                    reject(error);
                  });
                })
            )
          )
        )
        .then(() => {
          return {
            completeImageName: tags.map((tag: string) => `${imageName}:${tag}`)
          } as PublishedRelease;
        })
        .catch(error => {
          throw new Error(error);
        });
    })
  ).then(publishedImages => {
    return {
      publishedImages: publishedImages
    };
  });
}
