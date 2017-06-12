// @flow
import path from 'path';
import fs from 'fs';

import LocalPackage from '../model/LocalPackage';
import PackageReference from '../model/PackageReference';
import FSUtil from './FSUtil';

import { PACKAGE_JSON } from '../constants';

/**
 * Utility method to read/parse npm modules
 */
export default class PackageReader {
  /**
   * Parse the package.json file in the provided package path and
   * create an instance of {@link LocalPackage}
   */
  static read(packagePath: string): LocalPackage {
    if (!PackageReader.exists(packagePath)) {
      throw new Error(`There is no package in ${packagePath}`);
    }

    const packageConfig = fs.readFileSync(path.join(packagePath, PACKAGE_JSON), 'utf8');
    const {
      name,
      version,
      dependencies,
      devDependencies,
      scripts,
      bin,
    } = JSON.parse(packageConfig);

    return new LocalPackage({
      name,
      version,
      scripts: scripts ? Object.keys(scripts) : [],
      bin: bin || {},
      path: packagePath,
      dependencies: PackageReader.parseDependencies(dependencies),
      devDependencies: PackageReader.parseDependencies(devDependencies),
    });
  }

  /**
   * Determines if the provided path contains a valid npm module
   */
  static exists(projectPath: string): boolean {
    return FSUtil.isFile(path.join(projectPath, PACKAGE_JSON));
  }

  /**
   * Create an array of {@link PackageReference} from the 'devDependencies' or 'children' entry of
   * a package.json file.
   * @param {Object.<string, string>} dependencies An object in which the keys are the package names
   * and the values are the package version
   */
  static parseDependencies(dependencies: {[string]: string}): Array<PackageReference> {
    if (!dependencies) {
      return [];
    }
    return Object.keys(dependencies)
      .map(dependencyName => new PackageReference({
        name: dependencyName,
        version: dependencies[dependencyName],
      }));
  }
}
