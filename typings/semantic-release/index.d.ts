// Type definitions for semantic-release
// Project: semantic-release-docker
// Definitions by: Christoph Murczek <christoph.murczek@iteratec.at>

declare module 'semantic-release' {

  interface Logger {
    log: (message: string) => void;
  }

  interface NextRelease {
    gitTag: string;
    gitHead?: string;
    notes: string;
    version?: string;
  }

  export interface SemanticReleaseConfig {
    branch: string;
    repositoryUrl: string;
    tagFormat: string;
    noCi: boolean;
  }

  export interface SemanticReleasePlugin {
    path: string;
  }

  interface SemanticReleasePluginConfig {
    analyzeCommits?: SemanticReleasePlugin[];
    fail?: SemanticReleasePlugin[];
    generateNotes?: SemanticReleasePlugin[];
    prepare?: SemanticReleasePlugin[];
    publish?: SemanticReleasePlugin[];
    success?: SemanticReleasePlugin[];
    verifyConditions?: SemanticReleasePlugin[] | string[];
  }

  export interface SemanticReleaseContext {
    options: SemanticReleaseConfig & SemanticReleasePluginConfig;
    nextRelease?: NextRelease;
    logger: Logger;
  }

}
