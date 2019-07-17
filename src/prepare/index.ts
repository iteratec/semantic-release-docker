import Dockerode from 'dockerode';
import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { DockerPluginConfig } from '../models';
import { pluginSettings } from '../plugin-settings';
import { constructImageName, getImageTagsFromConfig } from '../shared-logic';
import { verified, verifyConditions } from '../verifyConditions';

export var prepared = false;

export async function prepare(
  pluginConfig: SemanticReleaseConfig,
  context: SemanticReleaseContext,
  dockerode?: Dockerode,
): Promise<any[]> {
  if (!verified) {
    await verifyConditions(pluginConfig, context).then(
      () => {},
      (reject) => {
        return Promise.reject(reject);
      },
    );
  }

  const preparePlugins = context.options.prepare!.filter((p) => p.path === pluginSettings.path) as DockerPluginConfig[];

  return Promise.all(
    preparePlugins.map((preparePlugin) => {
      const docker = dockerode ? dockerode : new Dockerode();
      const image = docker.getImage(preparePlugin.imageName);
      const tags = getImageTagsFromConfig(preparePlugin, context);
      return Promise.all(
        tags.map((imagetag) => {
          return image.tag({
            repo: constructImageName(preparePlugin),
            tag: imagetag,
          });
        }),
      )
        .then((data) => {
          return data.map((result) => result.name);
        })
        .catch((error) => {
          throw new Error(error);
        });
    }),
  )
    .then((data) => {
      prepared = true;
      return data.map((result) => result);
    })
    .catch((error) => {
      throw new Error(error);
    });
}
