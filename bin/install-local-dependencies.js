const localDependencies = require('../lib');
const ProjectConfigReader = localDependencies.ProjectConfigReader;
const ProjectInstaller = localDependencies.ProjectInstaller;

const config = new ProjectConfigReader().parse(process.cwd());
new ProjectInstaller(config.getProject().path, config.getDependencies()).install();
