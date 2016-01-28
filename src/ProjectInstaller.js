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
    const missingDependency = this.findMissingDependency(rootPackage) || this.dependenciesProjects.find((depProject) => {
      return this.findMissingDependency(depProject);
    });

    if (!missingDependency) return this;
    // Install missing dependencies
    if (this.print) console.log(`   - NPM install due to missing dependency`);
    installPackage(this.rootPath);
    return this;
  }

  findMissingDependency(project) {
    return Object.keys(project.dependencies).find((depName) => {
      if (!isDirectory(path.join(this.rootPath, NODE_MODULES, depName))) {
        console.log(`   - Missing dependency ${depName}@${project.dependencies[depName]} from ${project.name}`);
        return true;
      }
      return false;
    });
  }

  copy(dependencyProject) {
    if (this.print) console.log(`   - Copying ${dependencyProject.path}`);
    copyPackage(dependencyProject, this.rootPath);
  }
}
