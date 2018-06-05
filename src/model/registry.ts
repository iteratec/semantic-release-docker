import Docker from 'dockerode';

import { Auth } from './auth';

export class Registry {
  private docker = new Docker();

  constructor(readonly url?: string) {}

  public login(username: string, password: string) {
    const auth: Auth = {
      password: `${password}`,
      serveraddress: `${this.url ? `${this.url}` : ''}`,
      username: `${username}`,
    };

    return this.docker.checkAuth(auth)
      .then((data) => {
        return true;
      })
      .catch((error) => {
        throw new Error(error);
      });
  }
}
