// @flow
import LocalPackage from './LocalPackage';
import PackageReference from './PackageReference';

/**
 * A configured local package
 * @param {Object} params
 * @param {string} params.name The package's name
 * @param {string} params.version The package's version
 * @param {string} params.path The package's path
 * @param {Array<PackageReference>} [params.children=[]] The package's children
 * @param {Array<PackageReference>} [params.devDependencies=[]] The package's development children
 * @param {Array<string>} [params.script=[]] An array of scripts that can be run via NPM
 * @param {Object.<string, string>} [params.bin={}] An object in which the keys are command name
 * @param {boolean} params.watchEnabled If set to true, the package will be watched for changes
 * and the values are paths to the local file name
 */
export default class LocalPackageConfig extends LocalPackage {
  watchEnabled: boolean;

  constructor(params: {
    name: string,
    version: string,
    path: string,
    dependencies: ?Array<PackageReference>,
    devDependencies: ?Array<PackageReference>,
    scripts: ?Array<string>,
    bin: ?{[string]: string},
    watchEnabled: boolean
  }) {
    super({
      name: params.name,
      version: params.version,
      path: params.path,
      dependencies: params.dependencies,
      devDependencies: params.devDependencies,
      scripts: params.scripts,
      bin: params.bin,
    });
    this.watchEnabled = params.watchEnabled;
  }

  /**
   * True if the package should be watched
   * @returns {boolean}
   */
  isWatchEnabled(): boolean {
    return this.watchEnabled;
  }
}
