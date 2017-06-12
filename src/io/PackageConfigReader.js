// @flow
import path from 'path';
import fs from 'fs';
import PackageReader from './PackageReader';
import LocalPackageConfig from '../model/LocalPackageConfig';
import {
  CONFIG,
} from '../constants';

/**
 * Utility methods to interact with the .ucrc file
 */
export default class PackageConfigReader {
  /**
   * Read the .ucrc file and instantiate an array of {@link LocalPackageConfig}
   */
  static read(projectPath: string): Array<LocalPackageConfig> {
    const configPath = path.join(projectPath, CONFIG);
    const configContent = fs.readFileSync(configPath, { encoding: 'utf-8' });
    const config = JSON.parse(configContent);

    return Object.keys(config).map((dependencyName) => {
      const dependencyConfig = config[dependencyName];
      const localPackage = PackageReader.read(dependencyConfig.path);
      return new LocalPackageConfig(Object.assign({}, localPackage.toObject(), {
        watchEnabled: dependencyConfig.watch,
      }));
    });
  }
}
