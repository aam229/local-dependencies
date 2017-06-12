#!/usr/bin/env node
// @flow

import chalk from 'chalk';
import prettyTime from 'pretty-time';
import PackageReader from '../io/PackageReader';
import PackageConfigReader from '../io/PackageConfigReader';
import PackageWatcher from '../PackageWatcher';
import PackageInstaller from '../PackageInstaller';

const rootPackage = PackageReader.read(process.cwd());
const localPackages = PackageConfigReader.read(process.cwd());
const watcher = new PackageWatcher(localPackages);

console.log(`Watching ${chalk.green(rootPackage)}`);
watcher.registerOnChange((localPackage) => {
  const installStart = process.hrtime();
  console.log(`   Resinstalling ${chalk.green(localPackage)}`);
  try {
    // Disable watch while the package is reinstalled
    localPackage.setWatchEnabled(false);
    let start = process.hrtime();
    PackageInstaller.prepublish(localPackage);
    console.log(`  Prepublished in ${prettyTime(process.hrtime(start))}`);

    start = process.hrtime();
    PackageInstaller.installLocalDependency(rootPackage, localPackage, true);
    console.log(`  Installed package in ${prettyTime(process.hrtime(start))}`);

    start = process.hrtime();
    PackageInstaller.installLocalDependencyBinaries(rootPackage, localPackage);
    console.log(`  Installed package binaries in ${prettyTime(process.hrtime(start))}`);

    console.log(`Done installing in ${prettyTime(process.hrtime(installStart))}`);
    setTimeout(() => {
      localPackage.setWatchEnabled(true);
    }, 100);
  } catch (error) {
    console.log(`   - ${chalk.red('Error')}`);
    localPackage.setWatchEnabled(true);
  }
});

