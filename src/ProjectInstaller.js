import path from 'path';
import childProcess from 'child_process';
import fs from 'fs-extra';

import { NODE_MODULES, GIT, PREPUBLISH_SCRIPT } from './constants';
import { isDirectory, fsForEachRecursive } from './helpers';

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
      return this.getMissingProjectDependencies(project, this.project);
    }));
  }

  getMissingProjectDependencies(srcProject, dstProject) {
    return srcProject.getDependencies(srcProject === dstProject).filter((dependencyReference) => {
      if (isDirectory(path.join(dstProject.getPath(), NODE_MODULES, dependencyReference.getName()))) {
        return false;
      }
      return true;
    });
  }

  installProject(dependencyProject) {
    const destPath = path.join(this.project.getPath(), NODE_MODULES, dependencyProject.getName());
    // Find any prepublish script
    if (dependencyProject.getScripts().find((script) => script === PREPUBLISH_SCRIPT)) {
      // Find missing dependencies that would be needed to run prepublish
      const missingDependencies = this.getMissingProjectDependencies(dependencyProject, dependencyProject);
      if (missingDependencies.length > 0) {
        // Install missing dependencies if any
        childProcess.execSync('npm install', { cwd: dependencyProject.getPath() });
      }
      // run the prepublish script
      childProcess.execSync(`npm run ${PREPUBLISH_SCRIPT}`, { cwd: dependencyProject.getPath() });
    }
    fs.emptyDirSync(destPath);
    fsForEachRecursive(
      dependencyProject.getPath(),
      (directoryName) => {
        return directoryName !== NODE_MODULES && directoryName !== GIT;
      },
      (childName, relativePath, absolutePath) => {
        fs.copySync(absolutePath, path.join(destPath, relativePath));
      }
    );
  }
}
