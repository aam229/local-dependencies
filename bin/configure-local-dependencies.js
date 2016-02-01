#!/usr/bin/env node

const chalk = require('chalk');
const uiActions = require('../lib/ui/actions');
const ProjectConfigWriter = require('../lib/ProjectConfigWriter').default;

const rootPath = process.cwd();
const config = new ProjectConfigWriter();

uiActions.getProjectPath(rootPath)
  .then((project) => {
    config.setProject(project);
    return uiActions.getDependencyProjects(rootPath, project, false);
  })
  .then((dependencyProjects) => {
    config.setDependencies(dependencyProjects);
    return uiActions.getWatches(dependencyProjects);
  })
  .then((watches) => {
    config.setDependenciesWatches(watches);
    return uiActions.installLocal(config.getProject(), config.getDependencies());
  })
  .then(() => {
    return uiActions.installNPM(config.getProject(), config.getDependencies());
  })
  .then(() => {
    return uiActions.writeConfig(config);
  })
  .catch((error) => console.error(chalk.red(error.stack)));
