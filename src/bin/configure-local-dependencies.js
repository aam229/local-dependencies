#!/usr/bin/env node
// @flow
import chalk from 'chalk';
import PromptUtil from '../ui/PromptUtil';
import LocalPackage from '../model/LocalPackage';
import LocalPackageConfig from '../model/LocalPackageConfig';
import LocalPackageDependencyTree from '../model/LocalPackageDependencyTree';
import PackageFinder from '../io/PackageFinder';
import PackageReader from '../io/PackageReader';
import PackageConfigWriter from '../io/PackageConfigWriter';

const rootPath = process.cwd();

/**
 * This function is used as part of the catch clause of a promise in order to output the error
 * and call a function that will handle the error.
 *
 * @private
 * @param {function} errorHandler The error handling function
 * @returns {function} The function to pass as the argument to the catch clause
 */
function wrapStepForErrors(errorHandler: (any) => any) {
  return (error) => {
    if (error) console.error(chalk.red(error.stack));
    return errorHandler();
  };
}

/**
 * Prompt the user for the root path of the project via the command line
 *
 * @private
 * @param {string} cwd The working directory (default root path)
 * @param {boolean} yesToAll If set to true, no confirmation will be asked
 * @returns {Promise.<LocalPackage>} A promise that resolves to a valid
 */
function getRootPackage(cwd: string, yesToAll: boolean = true): Promise<LocalPackage> {
  return PromptUtil.getPackagePath(cwd)
    .then((projectPath) => {
      const localPackage = PackageReader.read(projectPath);
      if (yesToAll) {
        return localPackage;
      }
      return PromptUtil.confirm(`The config will be built for ${chalk.yellow(localPackage)}`, yesToAll)
        .then(() => localPackage);
    })
    // start over if there is any error (ie confirmation refused)
    .catch(wrapStepForErrors(getRootPackage));
}

/**
 * Prompt the user to enter a list of path in which to look for packages and search
 * the selected directories for dependencies of the root package. If some of the
 * packages found have dependencies that are also available locally, they will be
 * returned as well. Once the search is done the user is prompt to select which ones
 * should be included.
 *
 * @private
 * @param defaultPath {string}
 * @param rootPackage {LocalPackage} The package for which dependencies are searched
 * @param yesToAll {boolean} If set to true, no confirmation prompt will be shown and all
 * matched packages will be installed
 * @returns {Promise.<Array.<LocalPackage>>} A list of local dependencies for the root package
 */
function getLocalPackages(
  defaultPath: string,
  rootPackage: LocalPackage,
  yesToAll: boolean = true,
): Promise<Array<LocalPackage>> {
  return PromptUtil.getPackageSearchPath(defaultPath)
    .then((dependencyPaths) => {
      console.log('=> Searching for packages...');
      const localPackages = PackageFinder.findPackages(dependencyPaths);
      const dependencyTree = LocalPackageDependencyTree.create(rootPackage, localPackages);
      const dependencies = Array.from(dependencyTree.iterator(false))
        .map(node => node.getPackage());

      return yesToAll ? dependencies : PromptUtil.confirmDependencyPackages(dependencies);
    })
    .catch(wrapStepForErrors(() => getLocalPackages(defaultPath, rootPackage, yesToAll)));
}

/**
 * Select a list of packages that will be watched when running 'watch-local-dependencies'
 *
 * @private
 * @param packages {Array<LocalPackage>}
 * @param yesToAll {boolean} If set to true, no prompt is shown and all dependencies
 * are selected.
 * @returns {Promise<Array<LocalPackageConfig>>}
 */
function getWatchedPackages(
  packages: Array<LocalPackage>,
  yesToAll: boolean = true,
): Promise<Array<LocalPackageConfig>> {
  return PromptUtil.selectWatchedPackages(packages)
    .then((watchedPackages) => {
      if (yesToAll) {
        return watchedPackages;
      }
      return PromptUtil.confirm('Are you OK with the selected watches?', yesToAll)
        .then(() => watchedPackages);
    })
    .catch(wrapStepForErrors(() => getWatchedPackages(packages, yesToAll)))
    .then((watchedPackages) => {
      const watchPackagesByName = watchedPackages
        .reduce((m, p) => m.set(p.getName(), p), new Map());

      return packages.map((p: LocalPackage) => new LocalPackageConfig(
        Object.assign({}, p.toObject(), {
          watchEnabled: watchPackagesByName.has(p.getName()),
        })),
      );
    });
}

const config = {};

getRootPackage(rootPath)
  .then((project) => {
    config.root = project;
    return getLocalPackages(rootPath, project, false);
  })
  .then((packages) => {
    config.packages = packages;
    return getWatchedPackages(packages);
  })
  .then((packageConfigs) => {
    console.log('=> Writing config to .ldrc');
    PackageConfigWriter.write(config.root.getPath(), packageConfigs);
    console.log(`   ${chalk.green('OK!')}`);
  })
  .catch(err => console.error(err.stack));
