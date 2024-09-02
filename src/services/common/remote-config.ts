/*import { remoteConfig } from "../../helpers/firebase";
class RemoteConfigController {
  constructor() {
    remoteConfig.settings = {
      fetchTimeoutMillis: 3600000,
      minimumFetchIntervalMillis: 3600000,
    };
    remoteConfig.defaultConfig = {
      development: "false",
    };
    remoteConfig
      .fetchAndActivate()
      .then(async (fetch) => {
        console.log("fetch", fetch);
        console.log(
          "remote1",
          await RemoteConfigService.getValue("development")
        );
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async getValue(key) {
    return await remoteConfig.getValue(key);
  }
}

export const RemoteConfigService = new RemoteConfigController();*/
