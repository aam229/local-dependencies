// @flow
import PackageReference from './PackageReference';

/**
 * Contains the information from a parsed npm package
 * @param {Object} params
 * @param {string} params.name The package's name
 * @param {string} params.version The package's version
 * @param {string} params.path The package's path
 * @param {Array<PackageReference>} [params.children=[]] The package's children
 * @param {Array<PackageReference>} [params.devDependencies=[]] The package's development children
 * @param {Array<string>} [params.script=[]] An array of scripts that can be run via NPM
 * and the values are paths to the local file name
 * @param {Object.<string, string>} [params.bin={}] An object in which the keys are command name
 */
export default class LocalPackage extends PackageReference {
  path: string;
  dependencies: Array<PackageReference>;
  devDependencies: Array<PackageReference>;
  scripts: Array<string>;
  bin: {[string]: string};

  constructor(params: {
      name: string,
      version: string,
      path: string,
      dependencies: ?Array<PackageReference>,
      devDependencies: ?Array<PackageReference>,
      scripts: ?Array<string>,
      bin: ?{[string]: string}
  }) {
    super({
      name: params.name,
      version: params.version,
    });
    const {
      path: packagePath,
      dependencies,
      devDependencies,
      scripts,
      bin,
    } = params;
    this.path = packagePath;
    this.dependencies = dependencies || [];
    this.devDependencies = devDependencies || [];
    this.scripts = scripts || [];
    this.bin = bin || {};
  }

  /**
   * Get the available command name and their mapping to the local file name
   * @returns {Object.<string, string>}
   */
  getBinaries(): {[string]: string} {
    return this.bin;
  }

  /**
   * Get the children for the package.
   * @param {boolean} dev If set to true, also include the development children
   * @returns {Array<PackageReference>}
   */
  getDependencies(dev: boolean = false): Array<PackageReference> {
    return dev ? [].concat(this.dependencies, this.devDependencies) : this.dependencies;
  }

  /**
   * Get the scripts that can be run via NPM
   * @returns {Array.<string>}
   */
  getScripts(): Array<string> {
    return this.scripts;
  }

  /**
   * Get the package's path
   * @returns {string}
   */
  getPath(): string {
    return this.path;
  }

  /**
   * Convert the instance properties to an object
   * @returns
   */
  toObject(): {
    name: string,
    version: string,
    path: string,
    dependencies: ?Array<PackageReference>,
    devDependencies: ?Array<PackageReference>,
    scripts: ?Array<string>,
    bin: ?{[string]: string}
  } {
    return {
      name: this.name,
      version: this.version,
      path: this.path,
      dependencies: this.dependencies,
      devDependencies: this.devDependencies,
      scripts: this.scripts,
      bin: this.bin,
    };
  }
}
