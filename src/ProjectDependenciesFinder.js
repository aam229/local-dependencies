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

  getProjects(includeRoot = false){
    if (!this.dependencies) {
      this.dependencies = this.buildProjectsList()
    }
    if (includeRoot) {
      return this.dependencies;
    }
    return this.dependencies.filter((dep) => dep.path !== this.rootPath);
  }

  buildProjectsList() {
    const projects = new Map();
    this.print && console.log(`=> Building project dependencies in '${this.rootPath}':`);
    this.buildProjectsListRecursively(this.rootPath, projects);
    return Array.from(projects.values());
  }

  buildProjectsListRecursively(projectPath, projects) {
    const projectPackage = getPackageSummary(projectPath);
    const projectsDependencies = [];

    // Find the project's dependencies that are available as projects
    Object.keys(projectPackage.dependencies).forEach((projectDependency) => {
      const availableProject = this.availableProjects.get(projectDependency);
      if (!availableProject) {
        return;
      }
      projectsDependencies.push(availableProject);
      // Find other project dependencies within the found project
      this.buildProjectsListRecursively(availableProject.path, projects);
    });

    // We could check the node_modules folder for any available project dependencies. That would allow
    // support for external dependencies that have a dependency on a local project.

    const projectID = projectPackage.name + projectPackage.version;
    if (!projects.has(projectID)){
      this.print && console.log(`   - ${projectPackage.name}@${projectPackage.version}`);
      projectPackage.projectsDependencies = projectsDependencies;
      projects.set(projectID, {
        ...projectPackage,
        projectsDependencies
      });
    }
  }

  printSummary(projectsList){
    projectsList.map((project) => project.name)
      .sort()
      .forEach((name) => {
        console.log('   - ' + name);
      });
  }
}