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
    const installer = new ProjectInstaller(config.getProject(), config.getDependencies());
    const watcher = new ProjectWatcher(config.getDependencies());
    watcher.on('change', (dependency) => {
      watcher.unwatchProject(dependency);
      console.log('   Resinstalling ' + chalk.yellow(dependency));
      installer.installProject(dependency);
      // Sometimes the installer will still be doing work
      setTimeout(() => watcher.watchProject(dependency), 10);
    });
    watcher.watch();
  })
  .catch((error) => console.error(chalk.red(error.stack)));
