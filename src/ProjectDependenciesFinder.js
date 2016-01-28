import { getPackageSummary } from './helpers';


export default class ProjectDependenciesFinder {
  constructor(rootPath, availableProjects) {
    this.print = true;
    this.rootPath = rootPath;
    this.availableProjects = availableProjects.reduce((projectsMap, project) => {
      projectsMap.set(project.name, project);
      return projectsMap;
    }, new Map());
  }

  getProjects() {
    if (!this.dependencies) {
      this.dependencies = this.buildProjectsList();
    }
    return this.dependencies;
  }

  buildProjectsList() {
    const projects = new Map();
    if (this.print) console.log(`=> Building project dependencies in '${this.rootPath}':`);
    this.buildProjectsListRecursively(this.rootPath, projects);
    return Array.from(projects.values());
  }

  buildProjectsListRecursively(projectPath, projects) {
    const projectPackage = getPackageSummary(projectPath);

    // Find the project's dependencies that are available as projects
    Object.keys(projectPackage.dependencies).forEach((projectDependency) => {
      const availableProject = this.availableProjects.get(projectDependency);
      if (!availableProject) {
        return;
      }
      // Find other project dependencies within the found project
      this.buildProjectsListRecursively(availableProject.path, projects);
    });

    // We could check the node_modules folder for any available project dependencies. That would allow
    // support for external dependencies that have a dependency on a local project.

    if (projectPath !== this.rootPath) {
      if (this.print) console.log(`   - ${projectPackage.name}@${projectPackage.version}`);
      projects.set(projectPackage.name, projectPackage);
    }
  }

  printSummary(projectsList) {
    projectsList.map((project) => project.name)
      .sort()
      .forEach((name) => {
        console.log('   - ' + name);
      });
  }
}
