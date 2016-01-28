const localDependencies = require('../lib');
const uiHelpers = require('../lib/helpers-ui');
const helpers = require('../lib/helpers');

const ProjectFinder = localDependencies.ProjectFinder;
const ProjectDependenciesFinder = localDependencies.ProjectDependenciesFinder;
const ProjectConfigWriter = localDependencies.ProjectConfigWriter;

const rootPath = process.cwd();
const config = new ProjectConfigWriter();

function createConfig(){
  console.log('=> Writing the config file');
  config.write();
  console.log('=> Config file has been written to ' + config.getProject().path);
}


//function installDependencies(){
//  uiHelpers.getConfirmation('Do you want to install the project dependencies?')
//    .then(
//      () => {
//        new ProjectInstaller(rootPath, config.dependencies).install();
//        return createConfig();
//      },
//      () => createConfig()
//    );
//}

function getWatches(){
  return uiHelpers.getWatches(config.getDependencies())
    .then((watches) => {
      config.setDependenciesWatches(watches);
      return uiHelpers.getConfirmation('Are you OK with the selected watches?');
    })
    .then(() => createConfig(), () => getWatches())
}


function getPaths(){
  return uiHelpers.getPaths(rootPath)
    .then((dependencyPaths) => {
      const localProjects = new ProjectFinder(dependencyPaths).getProjects();
      const dependencies = new ProjectDependenciesFinder(config.getProject().path, localProjects).getProjects();
      config.setDependencies(dependencies);
      return uiHelpers.getConfirmation('Did we find all the dependencies you expected?');
    })
    .then(() => getWatches(), () => getPaths())
}

function getProjectPath(){
  return uiHelpers.getProjectPath(rootPath)
    .then((projectPath) => {
      config.setProject(helpers.getPackageSummary(projectPath));
      return uiHelpers.getConfirmation('The config will be built for ' + config.getProject().name + '@' + config.getProject().version)
    })
    .then(() => getPaths(), () => getProjectPath())
}

getProjectPath()
  .catch((err) => console.error(err, err.stack));





