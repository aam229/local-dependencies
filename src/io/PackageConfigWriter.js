// @flow
import fs from 'fs-extra';
import path from 'path';
import LocalPackageConfig from '../model/LocalPackageConfig';
import {
  CONFIG,
} from '../constants';

/**
 * Utility method for writing the .ldrc
 */
export default class PackageConfigWriter {
  /**
   * Write the configuration to the .ldrc file
   * @param {string} rootPath The directory in which the .ldrc file will be written
   * @param {Array<LocalPackageConfig>} dependencies The local package configurations
   */
  static write(rootPath: string, dependencies: Array<LocalPackageConfig>) {
    const config: {
      [string]: {
        path: string,
        watch: boolean
      }
    } = dependencies.reduce((m, d) => Object.assign(m, {
      [d.getName()]: {
        path: d.getPath(),
        watch: d.isWatchEnabled(),
      },
    }), {});
    const configPath = path.join(rootPath, CONFIG);
    const configTxt = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, configTxt, 'utf8');
  }
}
