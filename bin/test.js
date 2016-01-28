const localDependencies = require("../lib");
const ProjectDependenciesFinder = localDependencies.ProjectDependenciesFinder;
const ProjectFinder = localDependencies.ProjectFinder;
const ProjectInstaller = localDependencies.ProjectInstaller;
const ProjectWatcher = localDependencies.ProjectWatcher;

const projectsPaths = ['/var/apps/external/'];
const projectPath = '/var/apps/external/universal-redux-plugins/example';

const projFinder = new ProjectFinder(projectsPaths);
const depsFinder = new ProjectDependenciesFinder(projectPath, projFinder.getProjects());
const projInstaller = new ProjectInstaller(depsFinder.getProjects(true));
projInstaller.install();

const projWatchers = depsFinder.getProjects().map((project) => {
  const watcher = new ProjectWatcher(project, projectPath);
  watcher.watch();
  return watcher;
});




