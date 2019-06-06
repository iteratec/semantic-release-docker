import Dockerode from 'dockerode';
import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { Authentication, Credentials, DockerPluginConfig } from '../models';
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
  let cred: Credentials;

  // Check if Username and Password are set if not reject Promise with Error Message
  try {
    cred = getCredentials();
  } catch (err) {
    return Promise.reject(err.message);
  }

  // Check if plugin is configured in prepare step
  if (!context.options.prepare || !context.options.prepare!.find((p) => p.path === pluginSettings.path)) {
    throw new Error('\'prepare\' is not configured');
  }

  const preparePlugins = context.options.prepare!.filter((p) => p.path === pluginSettings.path) as DockerPluginConfig[];

  for (let i = 0; i < preparePlugins.length; i++) {
    const preparePlugin = preparePlugins[i];

    // Check if imagename is set
    if (preparePlugin.imageName == null || preparePlugin.imageName.length === 0) {
      throw new Error('\'imageName\' is not set in plugin configuration');
    }

    const docker = dockerode ? dockerode : new Dockerode();

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

    return docker
      .checkAuth(auth)
      .then((data) => {
        if (!verified) {
          verified = true;
        }
      })
      .catch((error) => {
        throw new Error(error);
      });
  }
}
