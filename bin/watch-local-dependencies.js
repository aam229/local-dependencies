#!/usr/bin/env node
require('./transpile');

const chalk = require('chalk');
const uiActions = require('../lib/ui/actions');
const ProjectConfigReader = require('../lib/ProjectConfigReader').default;
const ProjectWatcher = require('../lib/ProjectWatcher').default;
const ProjectInstaller = require('../lib/ProjectInstaller').default;

const config = new ProjectConfigReader(process.cwd()).read();

Promise.resolve()
  .then(() => {
    return uiActions.installLocal(config.getProject(), config.getDependencies());
  })
  .then(() => {
    return uiActions.installNPM(config.getProject(), config.getDependencies());
  })
  .then(() => {
    console.log('=> Watching ' + chalk.yellow(config.getProject()));
    const watcher = new ProjectWatcher(config.getDependencies());
    const installer = new ProjectInstaller(config.getProject(), config.getDependencies());

    watcher.on('change', (dependency) => {
      console.log('   Resinstalling ' + chalk.yellow(dependency));
      installer.installProject(dependency);
    });
    watcher.watch();
  })
  .catch((error) => console.error(chalk.red(error.stack)));
