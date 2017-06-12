// @flow
/**
 * A reference to an external npm package
 * @param {Object} params
 * @param {string} params.name The package's name
 * @param {string} params.version The package's version
 */
export default class PackageReference {
  name: string;
  version: string;

  constructor(params: {name: string, version: string}) {
    this.name = params.name;
    this.version = params.version;
  }

  /**
   * Get the package's name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get the package's version
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Convert the package reference to a descriptive string including its name and version.
   * @returns {string}
   */
  toString(): string {
    return `${this.getName()}@${this.getVersion()}`;
  }

  toObject(): {
    name: string,
    version: string
  } {
    return {
      name: this.name,
      version: this.version,
    };
  }
}
