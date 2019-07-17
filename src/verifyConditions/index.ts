import Dockerode from 'dockerode';
import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { Authentication, DockerPluginConfig } from '../models';
import { pluginSettings } from '../plugin-settings';
import { getCredentials, getRegistryUrlFromConfig } from '../shared-logic';

export var verified = false;
/**
 * Just for test purposes.
 * @param val
 */
export function setVerified() {
  verified = true;
}

/**
 * First Step
 * Verify all conditions in order to proceed with the release
 */
export async function verifyConditions(
  pluginConfig: SemanticReleaseConfig,
  context: SemanticReleaseContext,
  dockerode?: Dockerode,
): Promise<any> {
  // Check if Username and Password are set if not reject Promise with Error Message
  const cred = getCredentials();

  // Check if plugin is configured in prepare step
  if (!context.options.prepare || !context.options.prepare!.find((p) => p.path === pluginSettings.path)) {
    throw new Error('\'prepare\' is not configured');
  }

  const preparePlugins = context.options.prepare!.filter((p) => p.path === pluginSettings.path) as DockerPluginConfig[];
  const docker = dockerode ? dockerode : new Dockerode();

  return Promise.all(
    preparePlugins.map(async (preparePlugin) => {
      // Check if imagename is set
      if (preparePlugin.imageName == null || preparePlugin.imageName.length === 0) {
        throw new Error('\'imageName\' is not set in plugin configuration');
      }

      // Check if image exists on machine
      const imagelist = await docker.listImages({ filters: { reference: [preparePlugin.imageName] } });
      if (imagelist.length === 0) {
        throw new Error(`Image with name '${preparePlugin.imageName}' does not exist on this machine.`);
      }

      // Check Authentication
      const auth: Authentication = {
        ...cred,
        serveraddress: getRegistryUrlFromConfig(preparePlugin),
      };

      return docker.checkAuth(auth).then((data) => {
        verified = true;
      });
    }),
  );
}
