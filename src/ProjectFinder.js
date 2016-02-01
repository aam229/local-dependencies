import fs from 'fs-extra';
import path from 'path';

import Project from './Project';
import { NODE_MODULES } from './constants';
import { isDirectory } from './helpers';

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
    this.rootPaths.forEach((rootPath) => this.buildProjectsListRecursively(rootPath, projects));
    return projects;
  }

  buildProjectsListRecursively(currentPath, projects) {
    if (Project.exists(currentPath)) {
      projects.push(Project.create(currentPath));
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
