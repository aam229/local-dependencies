import path from 'path';
import childProcess from 'child_process';
import fs from 'fs-extra';

import { NODE_MODULES, GIT } from './constants';
import { isDirectory } from './helpers';

export default class ProjectInstaller {
  constructor(project, dependencies) {
    this.project = project;
    this.dependencies = dependencies;
  }

  installLocal() {
    // Copy all the local dependencies into the project
    this.dependencies.forEach((dependencyProject) => this.installProject(dependencyProject));
    return this;
  }

  installRemote(missingDependencies) {
    if (missingDependencies || this.getMissingDependencies().length > 0) {
      // Install missing dependencies
      childProcess.execSync('npm install', { cwd: this.project.getPath() });
    }
    return this;
  }

  getMissingDependencies() {
    // Find any missing dependencies
    const allProjects = [ this.project, ...this.dependencies ];
    return [].concat(...allProjects.map((project) => {
      return this.getMissingProjectDependencies(project);
    }));
  }

  getMissingProjectDependencies(project) {
    return project.getDependencies(project === this.project).filter((dependencyReference) => {
      if (isDirectory(path.join(this.project.getPath(), NODE_MODULES, dependencyReference.getName()))) {
        return false;
      }
      return true;
    });
  }

  installProject(dependencyProject) {
    const destPath = path.join(this.project.getPath(), NODE_MODULES, dependencyProject.getName());
    fs.emptyDirSync(destPath);
    fs.readdirSync(dependencyProject.getPath())
      .filter((childName) => childName !== NODE_MODULES && childName !== GIT)
      .forEach((childName) => {
        fs.copySync(path.join(dependencyProject.getPath(), childName), path.join(destPath, childName));
      });
  }
}
