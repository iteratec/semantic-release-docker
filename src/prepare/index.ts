import Dockerode from "dockerode";

import { SemanticReleaseConfig, SemanticReleaseContext } from "semantic-release";
import { DockerPluginConfig } from "../dockerPluginConfig";

export var prepared = false;

export async function prepare(pluginConfig: SemanticReleaseConfig, context: SemanticReleaseContext): Promise<any[]> {
  const preparePlugins = context.options.prepare!.filter(
    p => p.path === "@iteratec/semantic-release-docker"
  ) as DockerPluginConfig[];

  return Promise.all(
    preparePlugins.map(preparePlugin => {
      if (!preparePlugin.imageName) {
        throw new Error("'imageName' is not set in plugin configuration");
      }
      const docker = new Dockerode();
      const image = docker.getImage(preparePlugin.imageName);
      let tags = [context.nextRelease!.version!];
      if (preparePlugin.additionalTags && preparePlugin.additionalTags.length > 0) {
        tags = tags.concat(preparePlugin.additionalTags);
      }
      return Promise.all(
        tags.map(imagetag => {
          return image.tag({
            repo:
              `${preparePlugin.registryUrl ? `${preparePlugin.registryUrl}/` : ""}` +
              `${preparePlugin.repositoryName ? `${preparePlugin.repositoryName}/` : ""}` +
              `${preparePlugin.imageName}`,
            tag: imagetag
          });
        })
      )
        .then(data => {
          if (!prepared) {
            prepared = true;
          }
          return data.map(result => result.name);
        })
        .catch(error => {
          throw new Error(error);
        });
    })
  )
    .then(data => {
      if (!prepared) {
        prepared = true;
      }
      return data.map(result => result);
    })
    .catch(error => {
      throw new Error(error);
    });
}
