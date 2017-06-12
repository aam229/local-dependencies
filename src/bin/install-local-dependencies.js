#!/usr/bin/env node
// @flow

import chalk from 'chalk';
import prettyTime from 'pretty-time';
import notifier from 'node-notifier';

import PackageReader from '../io/PackageReader';
import PackageConfigReader from '../io/PackageConfigReader';
import LocalPackageState from '../model/LocalPackageState';
import LocalPackageDependencyTree from '../model/LocalPackageDependencyTree';
import PackageInstaller from '../PackageInstaller';

const rootPackage = PackageReader.read(process.cwd());
const localPackages = PackageConfigReader.read(process.cwd());

const rootPackageState = new LocalPackageState(rootPackage.toObject());
const localPackageStates = localPackages
  .map(p => new LocalPackageState(p.toObject()));

const dependencyTree = LocalPackageDependencyTree.create(rootPackageState, localPackageStates);
const overallStart = process.hrtime();

function depthLog(message: string, depth: number) {
  let spaces = '';
  for (let i = 0; i < depth; i += 1) {
    spaces += '  ';
  }
  console.log(spaces + message);
}

Array.from(dependencyTree.iterator(true))
  .forEach((node) => {
    const packageStart = process.hrtime();
    let taskStart;
    const currentPackage = node.getPackage();
    depthLog(`Prepublishing ${chalk.green(currentPackage.toString())}`, node.getDepth());
    if (currentPackage.isReady()) {
      depthLog('Already done', node.getDepth() + 1);
      return;
    }
    node.getChildren()
      .map(n => n.getPackage())
      .forEach((dependencyPackage) => {
        if (!dependencyPackage.isReady()) {
          throw new Error(`Expected the dependency ${dependencyPackage.getName()} to be ready when installing ${currentPackage.getName()}`);
        }
        depthLog(`Installing ${chalk.green(dependencyPackage.toString())}`, node.getDepth() + 1);

        taskStart = process.hrtime();
        PackageInstaller.installLocalDependency(currentPackage, dependencyPackage, true);
        depthLog(`Copied project files in ${prettyTime(process.hrtime(taskStart))}`, node.getDepth() + 2);

        taskStart = process.hrtime();
        PackageInstaller.installLocalDependencyBinaries(currentPackage, dependencyPackage);
        depthLog(`Created binary symlinks in ${prettyTime(process.hrtime(taskStart))}`, node.getDepth() + 2);
      });


    const missingDependencies = PackageInstaller.getMissingRemoteDependencies(node);
    if (missingDependencies.length > 0) {
      taskStart = process.hrtime();
      PackageInstaller.installRemoteDependencies(currentPackage);
      depthLog(`Installed remote dependencies in ${prettyTime(process.hrtime(taskStart))}`, node.getDepth() + 1);
    }
    PackageInstaller.prepublish(currentPackage);
    currentPackage.setReady(true);
    depthLog(`Prepublished ${chalk.green(currentPackage.toString())} in ${prettyTime(process.hrtime(packageStart))}`, node.getDepth());
  });

const message = `Done installing all dependencies in ${prettyTime(process.hrtime(overallStart))}`;
console.log(chalk.green.bold(message));
notifier.notify({
  title: 'install-local-children',
  message,
});

