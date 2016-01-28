import fs from 'fs-extra';
import path from 'path';

import { NODE_MODULES } from './constants';
import { isPackage, getPackageSummary, isDirectory } from './helpers';

export default class ProjectFinder {
  constructor(rootPaths) {
    this.print = true;
    this.rootPaths = rootPaths;
  }

  getProjects() {
    if (this.projects) {
      return this.projects;
    }
    this.projects = this.buildProjectsList();
    return this.projects;
  }

  buildProjectsList() {
    const projects = [];
    if (this.print) console.log(`=> Looking for local projects in '${this.rootPaths}':`);
    this.rootPaths.forEach((rootPath) => this.buildProjectsListRecursively(rootPath, projects));
    return projects;
  }

  buildProjectsListRecursively(currentPath, projects) {
    if (isPackage(currentPath)) {
      const project = getPackageSummary(currentPath);
      if (this.print) console.log(`   - ${project.name}@${project.version}`);
      projects.push(project);
    }

    fs.readdirSync(currentPath)
      // Do not dig into node_modules folders
      .filter((childName) => childName !== NODE_MODULES)
      // Turn folder/file names into full paths
      .map((childName) => path.join(currentPath, childName))
      // Only keep directories
      .filter((childPath) => isDirectory(childPath))
      // Go dig into the directory
      .forEach((childPath) => this.buildProjectsListRecursively(childPath, projects));
  }
}
