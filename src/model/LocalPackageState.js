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
 * and the values are paths to the local file name
 */
export default class LocalPackageState extends LocalPackage {
  ready: boolean;
  watchEnabled: boolean;
  timeoutHandle: ?number;

  constructor(params: {
    name: string,
    version: string,
    path: string,
    dependencies: ?Array<PackageReference>,
    devDependencies: ?Array<PackageReference>,
    scripts: ?Array<string>,
    bin: ?{[string]: string},
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
    this.ready = false;
    this.watchEnabled = false;
    this.timeoutHandle = null;
  }

  /**
   * True if the package is ready to be installed
   */
  isReady(): boolean {
    return this.ready;
  }

  /**
   * Update the ready state of the package
   */
  setReady(ready: boolean): LocalPackageState {
    this.ready = ready;
    return this;
  }

  /**
   * True if watching the package for changes is enabled
   */
  isWatchEnabled(): boolean {
    return this.watchEnabled;
  }

  /**
   * Enable/disable watching the package
   */
  setWatchEnabled(enabled: boolean = true): LocalPackageState {
    this.watchEnabled = enabled;
    return this;
  }


  /**
   * Get the timeout handle
   */
  getTimeoutHandle(): ?number {
    return this.timeoutHandle;
  }

  /**
   * Set the timeout handle
   * @param handle
   */
  setTimeoutHandle(handle: ?number): LocalPackageState {
    this.timeoutHandle = handle;
    return this;
  }
}
