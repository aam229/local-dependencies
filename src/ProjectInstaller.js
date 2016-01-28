import path from 'path';
import { NODE_MODULES } from './constants';
import { isDirectory, copyPackage, installPackage, getPackageSummary } from './helpers';

export default class ProjectInstaller {
  constructor(rootPath, dependenciesProjects) {
    this.print = true;
    this.rootPath = rootPath;
    this.dependenciesProjects = dependenciesProjects;
  }

  install() {
    if (this.print) console.log(`=> Installing ${this.rootPath}`);

    // Copy all the local dependencies into the project
    this.dependenciesProjects.forEach((depProject) => this.copy(depProject));

    // Find any missing dependencies
    const rootPackage = getPackageSummary(this.rootPath);

    // TODO: Check for the external dependencies defined by the local dependencies.
    const missingDependency = Object.keys(rootPackage.dependencies).find((depName) => {
      return !isDirectory(path.join(rootPackage.path, NODE_MODULES, depName));
    });
    if (!missingDependency) return this;

    // Install missing dependencies
    if (this.print) console.log(`   - NPM install`);
    installPackage(this.rootPath);
    return this;
  }

  copy(dependencyProject) {
    if (this.print) console.log(`   - Copying ${dependencyProject.path}`);
    copyPackage(dependencyProject, this.rootPath);
  }
}
