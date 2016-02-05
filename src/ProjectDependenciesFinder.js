export default class ProjectDependenciesFinder {
  constructor(project, projects) {
    this.project = project;
    this.projects = projects.reduce((projectsMap, proj) => {
      projectsMap.set(proj.getName(), proj);
      return projectsMap;
    }, new Map());
  }

  getProjectDependencies() {
    if (!this.dependencies) {
      this.dependencies = this.buildDependenciesList();
    }
    return this.dependencies;
  }

  buildDependenciesList() {
    const projects = new Map();
    this.buildDependenciesListRecursively(this.project, projects);
    return Array.from(projects.values());
  }

  buildDependenciesListRecursively(project, projects) {
    // Find the project's dependencies that are available as projects
    project.getDependencies(project === this.project).forEach((dependencyReference) => {
      const dependencyProject = this.projects.get(dependencyReference.getName());
      if (!dependencyProject) {
        return;
      }
      // Find other project dependencies within the found project
      this.buildDependenciesListRecursively(dependencyProject, projects);
    });

    // We could check the node_modules folder for any available project dependencies. That would allow
    // support for external dependencies that have a dependency on a local project.

    if (project !== this.project) {
      projects.set(project.getName(), project);
    }
  }
}
