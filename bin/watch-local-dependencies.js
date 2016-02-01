const chalk = require('chalk');
const constants = require('../lib/constants');
const localDependencies = require('../lib');
const ProjectConfigReader = localDependencies.ProjectConfigReader;
const ProjectInstaller = localDependencies.ProjectInstaller;
const ProjectWatcher = localDependencies.ProjectWatcher;

try {
  const config = new ProjectConfigReader(process.cwd()).parse();
  new ProjectInstaller(config.getProject(), config.getDependencies())
    .installLocal()
    .installRemote();

  new ProjectWatcher(config.getProject(), config.getDependencies())
    .watch();
} catch (err) {
  console.log(chalk.red(`Could not parse the ${constants.CONFIG} file.`));
  console.log(chalk.red(`Run 'npm run configure-local-dependencies' to generate a valid ${constants.CONFIG} file.`));
  console.log();
  console.log(chalk.red(err.stack));
  return;
}
