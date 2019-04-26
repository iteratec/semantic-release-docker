import { PluginSettings } from "./models/PluginSettings";

export const pluginSettings: PluginSettings = {
  path: "@iteratec/semantic-release-docker",
  defaultValues: {
    additionalTags: [],
    imageName: "",
    path: "@iteratec/semantic-release-docker",
    pushVersionTag: true,
    registryUrl: "",
    repositoryName: ""
  }
};
