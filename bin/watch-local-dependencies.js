#!/usr/bin/env node
require('./transpile');

const chalk = require('chalk');
const ProjectConfigReader = require('../lib/ProjectConfigReader').default;
const ProjectWatcher = require('../lib/ProjectWatcher').default;
const ProjectInstaller = require('../lib/ProjectInstaller').default;

const config = new ProjectConfigReader(process.cwd()).read();

Promise.resolve()
  .then(() => {
    console.log('=> Watching ' + chalk.yellow(config.getProject()));
    const installer = new ProjectInstaller(config.getProject(), config.getDependencies());
    const watcher = new ProjectWatcher(config.getDependencies());
    watcher.on('change', (dependency) => {
      watcher.muteProject(dependency);
      console.log('   Resinstalling ' + chalk.yellow(dependency));
      installer.installProject(dependency);
      // Sometimes the installer will still be doing work.
      setTimeout(() => {
        console.log('   => ' + chalk.green('OK!'));
        watcher.unmuteProject(dependency);
      }, 100);
    });
    watcher.watch();
  })
  .catch((error) => console.error(chalk.red(error.stack)));
