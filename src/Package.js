import path from 'path';
import fs from 'fs';

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

    const packageConfig = fs.readFileSync(path.join(rootPath, PACKAGE_JSON), 'utf8');
    const {
      name,
      version,
      dependencies,
      devDependencies,
      scripts,
      bin
    } = JSON.parse(packageConfig);

    return {
      name,
      version,
      scripts: scripts ? Object.keys(scripts) : [],
      bin: bin ? bin : {},
      path: rootPath,
      dependencies: Package.parseDependencies(dependencies),
      devDependencies: Package.parseDependencies(devDependencies)
    };
  }

  static create(rootPath) {
    return new Package(Package.parse(rootPath));
  }

  constructor(data) {
    super({});
    this.reset(data);
  }

  getBinaries() {
    return this.bin;
  }

  getDependencies(dev = false) {
    return dev ? [].concat(this.dependencies, this.devDependencies) : this.dependencies;
  }

  getScripts() {
    return this.scripts;
  }

  getPath() {
    return this.path;
  }

  refresh() {
    this.reset(Package.parse(this.getPath()));
  }

  reset({ ...packageReferenceData, path: packagePath, dependencies = [], devDependencies = [], scripts = [], bin = {} }) {
    super.reset(packageReferenceData);
    this.dependencies = dependencies;
    this.devDependencies = devDependencies;
    this.path = packagePath;
    this.scripts = scripts;
    this.bin = bin;
  }
}
