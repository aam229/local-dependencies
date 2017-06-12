// @flow
import fs from 'fs-extra';
import path from 'path';

import FSUtil from './FSUtil';
import PackageReader from './PackageReader';
import LocalPackage from '../model/LocalPackage';
import { NODE_MODULES } from '../constants';

/**
 * Contains utility methods to find local packages
 */
export default class PackageFinder {
  /**
   * Recursively search the provided paths for valid npm packages.
   * It ignores any 'node_modules' folder.
   *
   * @param searchPaths {Array<string>} The paths in which npm packages will be looked up
   * @returns {Array<LocalPackage>} The local packages found
   */
  static findPackages(searchPaths: Array<string>): Array<LocalPackage> {
    const projects = [];
    searchPaths.forEach(searchPath =>
      PackageFinder.buildProjectsListRecursively(searchPath, projects),
    );
    return projects;
  }

  /**
   * Recursively search the provided path for valid npm packages.
   * It ignores any 'node_modules' folder
   * @private
   * @param currentPath {string} The path to test as a valid package or
   * in which to search otherwise
   * @param projects {Array<LocalPackage>} The list of packages to which
   * found packages are added
   */
  static buildProjectsListRecursively(currentPath: string, projects: Array<LocalPackage>) {
    if (PackageReader.exists(currentPath)) {
      projects.push(PackageReader.read(currentPath));
    }

    fs.readdirSync(currentPath)
      // Do not dig into node_modules folders
      .filter(childName => childName !== NODE_MODULES)
      // Turn folder/file names into full paths
      .map(childName => path.join(currentPath, childName))
      // Only keep directories
      .filter(childPath => FSUtil.isDirectory(childPath))
      // Go dig into the directory
      .forEach(childPath => PackageFinder.buildProjectsListRecursively(childPath, projects));
  }
}
