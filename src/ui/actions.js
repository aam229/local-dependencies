import chalk from 'chalk';
import Project from '../Project';
import ProjectDependenciesFinder from '../ProjectDependenciesFinder';
import ProjectFinder from '../ProjectFinder';
import ProjectInstaller from '../ProjectInstaller';

import {
  promptProjectPath,
  promptDependenciesPaths,
  promptDependencies,
  promptWatches,
  promptConfirmation
} from './helpers';

function wrapStepForErrors(stepExecutor) {
  return (error) => {
    if (error) console.error(chalk.red(error.stack));
    return stepExecutor();
  };
}

export function getProjectPath(cwd, yesToAll = true) {
  return promptProjectPath(cwd)
    .then((projectPath) => {
      const project = Project.create(projectPath);
      if (yesToAll) {
        return project;
      }
      return promptConfirmation(`The config will be built for ${chalk.yellow(project)}`)
        .then(() => project);
    })
    .then(project => project)
    .catch(wrapStepForErrors(() => getProjectPath()));
}

export function getDependencyProjects(cwd, project, yesToAll = true) {
  return promptDependenciesPaths(cwd)
    .then((dependencyPaths) => {
      console.log('=> Searching for projects...');
      const projectsFinder = new ProjectFinder(dependencyPaths);
      const dependenciesFinder = new ProjectDependenciesFinder(project, projectsFinder.getProjects());
      const dependencies = dependenciesFinder.getProjectDependencies();

      return yesToAll ? dependencies : promptDependencies(dependencies);
    })
    .catch(wrapStepForErrors(() => getDependencyProjects()));
}

export function getWatches(dependencies, yesToAll = true) {
  return promptWatches(dependencies)
    .then((watches) => {
      if (yesToAll) {
        return watches;
      }
      return promptConfirmation('Are you OK with the selected watches?')
        .then(() => watches);
    })
    .catch(wrapStepForErrors(() => getWatches()));
}

export function installLocal(project, dependencies, yesToAll = true) {
  const installer = new ProjectInstaller(project, dependencies);
  let promise = Promise.resolve();
  if (!yesToAll) {
    promise = promptConfirmation('Do you want to install the local dependencies?');
  }
  return promise.then(
      () => {
        console.log('=> Installing local dependencies');
        installer.installLocal();
        console.log(`   ${chalk.green('OK!')}`);
        return true;
      },
      wrapStepForErrors(() => true)
    );
}

export function installNPM(project, dependencies, yesToAll = true) {
  const installer = new ProjectInstaller(project, dependencies);
  let promise = Promise.resolve();
  if (!yesToAll) {
    promise = promptConfirmation('Do you want to install the remote dependencies?');
  }
  return promise.then(
      () => {
        console.log('=> Checking remote dependencies');
        const missingDependencies = installer.getMissingDependencies();
        if (missingDependencies.length > 0) {
          const sample = missingDependencies.splice(0, 5);
          console.log(`   Missing ${(missingDependencies.length + sample.length)} dependencies`);
          sample.forEach((missingDependency) => {
            console.log(`    - ${chalk.yellow(missingDependency)}`);
          });
          if (sample.length < missingDependencies.length) {
            console.log(`    - ... ${missingDependencies.length - sample.length} more`);
          }
          console.log('=> Installing remote dependencies');
          installer.installRemote(missingDependencies);
        }
        console.log(`   ${chalk.green('OK!')}`);
        return true;
      },
      wrapStepForErrors(() => true)
    );
}

export function writeConfig(config) {
  console.log('=> Writing config');
  config.write();
  console.log(`   ${chalk.green('OK!')}`);
  return true;
}
