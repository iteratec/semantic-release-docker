import Dockerode from 'dockerode';

import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { DockerPluginConfig } from '../models';
import { pluginSettings } from '../plugin-settings';
import { constructImageName } from '../shared-logic';
import { verified, verifyConditions } from '../verifyConditions';

export var prepared = false;

export async function prepare(pluginConfig: SemanticReleaseConfig, context: SemanticReleaseContext): Promise<any[]> {
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
      const docker = new Dockerode();
      const image = docker.getImage(preparePlugin.imageName);
      let tags = [context.nextRelease!.version!];
      if (preparePlugin.additionalTags && preparePlugin.additionalTags.length > 0) {
        tags = tags.concat(preparePlugin.additionalTags);
      }
      return Promise.all(
        tags.map((imagetag) => {
          return image.tag({
            repo: constructImageName(preparePlugin),
            tag: imagetag,
          });
        }),
      )
        .then((data) => {
          if (!prepared) {
            prepared = true;
          }
          return data.map((result) => result.name);
        })
        .catch((error) => {
          throw new Error(error);
        });
    }),
  )
    .then((data) => {
      if (!prepared) {
        prepared = true;
      }
      return data.map((result) => result);
    })
    .catch((error) => {
      throw new Error(error);
    });
}
