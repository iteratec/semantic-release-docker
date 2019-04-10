import { SemanticReleaseConfig, SemanticReleaseContext } from 'semantic-release';
import { prepare, publish, verifyConditions } from './src';
import { DockerPluginConfig } from './src/models';

const config: SemanticReleaseConfig = {
  branch: '',
  noCi: true,
  repositoryUrl: '',
  tagFormat: '',
};
const context: SemanticReleaseContext = {
  logger: {
    // tslint:disable-next-line:no-empty
    log: (message: string) => {},
  },
  options: {
    branch: '',
    noCi: true,
    prepare: [
      {
        additionalTags: ['latest'],
        imageName: 'phonebook',
        repositoryName: 'danielhabenicht',
        path: '@iteratec/semantic-release-docker',
      } as DockerPluginConfig,
      {
        additionalTags: ['latest'],
        imageName: 'otherimage',
        repositoryName: 'danielhabenicht',
        path: '@iteratec/semantic-release-docker',
      } as DockerPluginConfig,
    ],
    repositoryUrl: '',
    tagFormat: '',
  },
  nextRelease: {
    version: '1.0.3',
    gitHead: 'sdfsdfsdfsdf',
    gitTag: 'v.1.0.3',
    notes: 'Nothin special',
  },
};
context.logger.log = (string: string) => {
  console.log(string);
};
verifyConditions(config, context);
prepare(config, context);
publish(config, context);
