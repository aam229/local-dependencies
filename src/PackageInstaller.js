// @flow
import path from 'path';
import childProcess from 'child_process';
import fs from 'fs-extra';

import FSUtil from './io/FSUtil';
import LocalPackage from './model/LocalPackage';
import PackageReference from './model/PackageReference';
import LocalPackageState from './model/LocalPackageState';
import LocalPackageDependencyTreeNode from './model/LocalPackageDependencyTreeNode';
import {
  NODE_MODULES,
  GIT,
  PREPUBLISH_SCRIPT,
  NPM_BIN,
} from './constants';

/**
 * Method to prepare and install local packages into other local packages
 */
export default class PackageInstaller {
  /**
   * Copy all the files of a local dependency to the node_modules folder of the targeted package
   * @param currentPackage
   * @param dependencyPackage
   * @param clearDirectory If set to true, the directory in which the dependency
   * is installed is cleared
   */
  static installLocalDependency(
    currentPackage: LocalPackage,
    dependencyPackage: LocalPackage,
    clearDirectory: boolean = true,
  ): void {
    const destPath = path.join(
      currentPackage.getPath(),
      NODE_MODULES,
      dependencyPackage.getName(),
    );
    if (clearDirectory) {
      // Empty the destination directory.
      fs.emptyDirSync(destPath);
    }
    FSUtil.fsForEachRecursive(
      dependencyPackage.getPath(),
      directoryName => directoryName !== NODE_MODULES && directoryName !== GIT,
      (childName, relativePath, absolutePath) => {
        fs.copySync(absolutePath, path.join(destPath, relativePath));
      },
    );
  }

  /**
   * Create symlinks for the binary commands defined by a local dependency to the
   * node_modules/.bin folder of the targeted package
   */
  static installLocalDependencyBinaries(
    currentPackage: LocalPackage,
    dependencyPackage: LocalPackage,
  ): void {
    const binRootPath = path.join(
      currentPackage.getPath(),
      NODE_MODULES,
      NPM_BIN,
    );
    const targetRootPath = path.join(
      currentPackage.getPath(),
      NODE_MODULES,
      dependencyPackage.getName(),
    );
    const commands = dependencyPackage.getBinaries();
    Object.keys(commands).forEach((command) => {
      const linkPath = path.join(binRootPath, command);
      const commandPath = path.join(targetRootPath, commands[command]);
      fs.ensureSymlinkSync(commandPath, linkPath);
    });
  }

  /**
   * Find all the missing dependencies for the targeted node by checking if the corresponding
   * directory exists in its node_module folder. When computing a list of required
   * dependencies, it also includes the dependencies defined by all of the node's
   * children packages.
   */
  static getMissingRemoteDependencies<T: LocalPackage>(
    node: LocalPackageDependencyTreeNode<T>,
  ): Array<PackageReference> {
    const currentPackage = node.getPackage();
    const nodeModulesPath = path.join(currentPackage.getPath(), NODE_MODULES);
    // Build a list of all the dependency references that should be present
    return Array.from(node.iterator())
      .reduce((dependencies, childNode) => {
        const nodeDependencies = childNode.getPackage().getDependencies(false);
        return [...dependencies, ...nodeDependencies];
      }, [...currentPackage.getDependencies(true)])
      // Filter the dependency for which a folder does not exist within the targeted node_modules
      .filter(dependency => !FSUtil.isDirectory(path.join(
        nodeModulesPath,
        dependency.getName(),
      )));
  }

  /**
   * Install the remote dependencies via NPM for the targeted package
   */
  static installRemoteDependencies(currentPackage: LocalPackage): void {
    childProcess.execSync('npm install', { cwd: currentPackage.getPath() });
  }

  /**
   * Run the prepublish script (if it exists) via NPM for the targeted package
   */
  static prepublish(currentPackage: LocalPackageState) {
    const hasPrepublish = currentPackage.getScripts()
      .find(script => script === PREPUBLISH_SCRIPT);

    if (!hasPrepublish) {
      return;
    }
    childProcess.execSync(`npm run ${PREPUBLISH_SCRIPT}`, { cwd: currentPackage.getPath() });
  }
}
