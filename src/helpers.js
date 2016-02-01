import fs from 'fs-extra';

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
