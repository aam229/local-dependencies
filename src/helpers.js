import fs from 'fs-extra';
import path from 'path';

export function exists(fullPath) {
  try {
    fs.accessSync(fullPath, fs.R_OK);
    return true;
  } catch (error) {
    return false;
  }
}

export function isFile(fullPath) {
  return exists(fullPath) && fs.statSync(fullPath).isFile();
}

export function isDirectory(fullPath) {
  return exists(fullPath) && fs.statSync(fullPath).isDirectory();
}

export function fsForEachRecursive(fullPath, directoryCallback, fileCallback, relativePath = '') {
  fs.readdirSync(path.join(fullPath, relativePath))
    .forEach((childName) => {
      const childRelativePath = path.join(relativePath, childName);
      const childAbsolutePath = path.join(fullPath, childRelativePath);
      if (isFile(childAbsolutePath)) {
        fileCallback(childName, childRelativePath, childAbsolutePath);
      } else if (directoryCallback(childName, childRelativePath, childAbsolutePath)) {
        fsForEachRecursive(fullPath, directoryCallback, fileCallback, childRelativePath );
      }
    });
}
