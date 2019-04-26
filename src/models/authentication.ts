import { Credentials } from './credentials';

/**
 * Authentication
 * From: https://docs.docker.com/engine/api/v1.37/#section/Authentication
 */
export interface Authentication extends Credentials {
  serveraddress: string;
}
