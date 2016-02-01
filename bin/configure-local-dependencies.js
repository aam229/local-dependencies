const chalk = require('chalk');
const localDependencies = require('../lib');
const uiHelpers = require('../lib/ui/helpers');

const Project = localDependencies.Project;
const ProjectConfigWriter = localDependencies.ProjectConfigWriter;
const ProjectDependenciesFinder = localDependencies.ProjectDependenciesFinder;
const ProjectFinder = localDependencies.ProjectFinder;
const ProjectInstaller = localDependencies.ProjectInstaller;

const rootPath = process.cwd();
const config = new ProjectConfigWriter();
const noConfirmation = true;

function wrapStep(stepExecutor) {
  return (error) => {
    if (error) console.error(chalk.red(error.stack));
    return stepExecutor();
  };
}

function createConfig() {
  console.log('=> Writing config');
  config.write();
  console.log(`   ${chalk.green('OK!')}`);
}

function installNPM() {
  const installer = new ProjectInstaller(config.getProject(), config.getDependencies());
  return uiHelpers.getConfirmation('Do you want to install the remote dependencies?', noConfirmation)
    .then(
      () => {
        console.log(`=> Checking remote dependencies`);
        const missingDependencies = installer.getMissingDependencies();
        if (missingDependencies.length > 0) {
          const sample = missingDependencies.splice(0, 5);
          console.log(`   Missing ${missingDependencies.length} dependencies`);
          sample.forEach((missingDependency) => {
            console.log(`    - ${chalk.yellow(missingDependency)}`);
          });
          if (sample.length < missingDependencies.length) {
            console.log(`    - ... ${missingDependencies.length - sample.length} more`);
          }
          console.log(`=> Installing remote dependencies`);
          installer.installRemote(missingDependencies);
        }
        console.log(`   ${chalk.green('OK!')}`);
        return createConfig();
      },
      wrapStep(() => createConfig())
    );
}

function installLocal() {
  const installer = new ProjectInstaller(config.getProject(), config.getDependencies());
  return uiHelpers.getConfirmation('Do you want to install the local dependencies?', noConfirmation)
    .then(
      () => {
        console.log(`=> Installing local dependencies`);
        installer.installLocal();
        console.log(`   ${chalk.green('OK!')}`);
        return installNPM();
      },
      wrapStep(() => installNPM())
    );
}

function getWatches() {
  return uiHelpers.getWatches(config.getDependencies())
    .then((watches) => {
      return uiHelpers.getConfirmation('Are you OK with the selected watches?', noConfirmation)
        .then(() => config.setDependenciesWatches(watches));
    })
    .then(() => installLocal(), wrapStep(() => installLocal()));
}


function getPaths() {
  return uiHelpers.getPaths(rootPath)
    .then((dependencyPaths) => {
      const projects = new ProjectFinder(dependencyPaths).getProjects();
      const dependencies = new ProjectDependenciesFinder(config.getProject(), projects).getProjectDependencies();

      if (!noConfirmation) {
        console.log('=> Found dependencies:');
        dependencies.forEach((dependency) => console.log(`   - ${chalk.yellow(dependency)}`));
      }
      return uiHelpers.getConfirmation('Did we find all the dependencies you expected?', noConfirmation)
        .then(() => config.setDependencies(dependencies));
    })
    .then(() => getWatches(), wrapStep(() => getPaths()));
}

function getProjectPath() {
  return uiHelpers.getProjectPath(rootPath)
    .then((projectPath) => {
      const project = Project.create(projectPath);
      return uiHelpers.getConfirmation('The config will be built for ' + chalk.yellow(project), noConfirmation)
        .then(() => config.setProject(project));
    })
    .then(() => getPaths(), wrapStep(() => getProjectPath()));
}

getProjectPath()
  .catch((error) => console.error(chalk.red(error.stack)));
