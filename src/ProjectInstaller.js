import path from 'path';
import childProcess from 'child_process';
import fs from 'fs-extra';

import ProjectDependenciesFinder from './ProjectDependenciesFinder';
import { NODE_MODULES, GIT, PREPUBLISH_SCRIPT, NPM_BIN } from './constants';
import { isDirectory, fsForEachRecursive } from './helpers';

export default class ProjectInstaller {
  constructor(project, dependencies) {
    this.project = project;
    this.dependencies = dependencies;
  }

  installLocal() {
    // Copy all the local dependencies into the project
    this.dependencies.forEach((dependencyProject) => {
      this.prepublishDependency(dependencyProject);
      this.copyDependency(dependencyProject);
    });
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

  prepublishDependency(dependencyProject, update = false) {
    const hasPrepublish = dependencyProject.getScripts().find((script) => script === PREPUBLISH_SCRIPT);
    if (!hasPrepublish) {
      return;
    }
    if (!update && !dependencyProject.isPrepared()) {
      this.prepareDependency(dependencyProject);
    }
    if (update || !dependencyProject.isPrepared()) {
      childProcess.execSync(`npm run ${PREPUBLISH_SCRIPT}`, { cwd: dependencyProject.getPath() });
    }
    dependencyProject.setPrepared(true);
  }

  prepareDependency(dependencyProject) {
    // Find the dependency's dependencies
    const finder = new ProjectDependenciesFinder(dependencyProject, this.dependencies);
    // Install the dependencies for the dependency project so that the prepublish script can run.
    const installer = new ProjectInstaller(dependencyProject, finder.getProjectDependencies());
    installer.installLocal();
    installer.installRemote();
  }

  copyDependency(dependencyProject, update = false) {
    const destPath = path.join(this.project.getPath(), NODE_MODULES, dependencyProject.getName());

    if (!update) {
      // Empty the destination directory.
      fs.emptyDirSync(destPath);
    }

    fsForEachRecursive(
      dependencyProject.getPath(),
      (directoryName) => {
        return directoryName !== NODE_MODULES && directoryName !== GIT;
      },
      (childName, relativePath, absolutePath) => {
        fs.copySync(absolutePath, path.join(destPath, relativePath));
      }
    );

    const commands = dependencyProject.getBinaries();
    Object.keys(commands).forEach((command) => {
      const linkPath = path.join(destPath, NODE_MODULES, NPM_BIN, command);
      const commandPath = path.join(destPath, commands[command]);
      fs.ensureSymlinkSync(commandPath, linkPath);
    });
  }
}
