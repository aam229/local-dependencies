const localDependencies = require('../lib');
const ProjectConfig = localDependencies.ProjectConfig;
const ProjectFinder = localDependencies.ProjectFinder;
const ProjectDependenciesFinder = localDependencies.ProjectDependenciesFinder;
const ProjectWatcher = localDependencies.ProjectWatcher;

const config = new ProjectConfig(process.cwd()).parse();
const projFinder = new ProjectFinder(config.getLookupPaths());
const depsFinder = new ProjectDependenciesFinder(config.getProjectRoot(), projFinder.getProjects());
new ProjectWatcher(config.getProjectRoot(), depsFinder.getProjects()).watch();
