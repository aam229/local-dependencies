#!/usr/bin/env node

const chalk = require('chalk');
const uiActions = require('../lib/ui/actions');
const ProjectConfigReader = require('../lib/ProjectConfigReader').default;

const config = new ProjectConfigReader(process.cwd()).read();

Promise.resolve()
  .then(() => uiActions.installLocal(config.getProject(), config.getDependencies()))
  .then(() => uiActions.installNPM(config.getProject(), config.getDependencies()))
  .catch(error => console.error(chalk.red(error.stack)));
