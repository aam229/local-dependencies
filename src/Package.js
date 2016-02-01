import path from 'path';

import PackageReference from './PackageReference';
import { isFile } from './helpers';
import { PACKAGE_JSON } from './constants';

export default class Package extends PackageReference {
  static exists(projectPath) {
    return isFile(path.join(projectPath, PACKAGE_JSON));
  }

  static parseDependencies(dependencies) {
    if (!dependencies) {
      return [];
    }
    return Object.keys(dependencies).map((dependencyName) => {
      return new PackageReference({
        name: dependencyName,
        version: dependencies[dependencyName]
      });
    });
  }

  static parse(rootPath) {
    if (!Package.exists(rootPath)) {
      throw new Error(`There is no package in ${rootPath}`);
    }
    const {
      name,
      version,
      dependencies,
      devDependencies
    } = require(path.join(rootPath, PACKAGE_JSON));

    return {
      name,
      version,
      path: rootPath,
      dependencies: Package.parseDependencies(dependencies),
      devDependencies: Package.parseDependencies(devDependencies)
    };
  }

  static create(rootPath) {
    return new Package(Package.parse(rootPath));
  }

  constructor({ ...packageReferenceConfig, path: packagePath, dependencies, devDependencies }) {
    super(packageReferenceConfig);
    this.dependencies = dependencies;
    this.devDependencies = devDependencies;
    this.path = packagePath;
  }

  getDependencies(dev = false) {
    return dev ? this.dependencies : [].concat(this.dependencies, this.devDependencies);
  }

  getPath() {
    return this.path;
  }
}
