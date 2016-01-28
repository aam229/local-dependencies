const localDependencies = require('../lib');
const ProjectConfig = localDependencies.ProjectConfig;
const ProjectFinder = localDependencies.ProjectFinder;
const ProjectDependenciesFinder = localDependencies.ProjectDependenciesFinder;
const ProjectInstaller = localDependencies.ProjectInstaller;

const config = new ProjectConfig(process.cwd()).parse();
const projFinder = new ProjectFinder(config.getLookupPaths());
const depsFinder = new ProjectDependenciesFinder(config.getProjectRoot(), projFinder.getProjects());
new ProjectInstaller(config.getProjectRoot(), depsFinder.getProjects()).install();
