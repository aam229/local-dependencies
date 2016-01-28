import fs from 'fs-extra';
import semver from 'semver';
import path from 'path';

import { PACKAGE_JSON, NODE_MODULES, GIT } from './constants';

export function isFile(fullPath) {
  return exists(fullPath) && fs.statSync(fullPath).isFile();
}

export function isDirectory(fullPath) {
  return exists(fullPath) && fs.statSync(fullPath).isDirectory();
}

export function exists(fullPath) {
  try {
    fs.accessSync(fullPath, fs.R_OK);
    return true;
  } catch (error) {
    return false;
  }
}

export function copyPackage(srcPackage, destPackagePath){
  const destPath = path.join(destPackagePath, NODE_MODULES, srcPackage.name);
  fs.emptyDirSync(destPath);
  fs.readdirSync(srcPackage.path)
    .filter((childName) => childName !== NODE_MODULES && childName !== GIT)
    .forEach((childName) => {
      fs.copySync(path.join(srcPackage.path, childName), path.join(destPath, childName))
    });
}

export function isPackage(fullPath) {
  return isFile(path.join(fullPath, PACKAGE_JSON));
}

export function getPackageSummary(fullPath){
  const {
    name,
    version,
    dependencies,
    devDependencies,
    peerDependencies
  } = require(path.join(fullPath, PACKAGE_JSON));

  return {
    name,
    version,
    path: fullPath,
    dependencies: Object.assign({}, dependencies, devDependencies),
    peerDependencies
  };
}