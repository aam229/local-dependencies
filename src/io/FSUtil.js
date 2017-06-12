// @flow
import fs from 'fs-extra';
import path from 'path';

/**
 * Utility methods to interact with the local file system
 */
export default class FSUtil {
  /**
   * Check if a file or directory exists
   * @param absolutePath {string} The absolute path to the file or directory
   * @returns {boolean} True if the file or directory exists
   */
  static exists(absolutePath: string): boolean {
    try {
      fs.accessSync(absolutePath, fs.R_OK);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if a file exists
   * @param absolutePath {string} The absolute path to the file
   * @returns {boolean} True if the file exists
   */
  static isFile(absolutePath: string): boolean {
    return FSUtil.exists(absolutePath) && fs.statSync(absolutePath).isFile();
  }

  /**
   * Check if a directory exists
   * @param absolutePath {string} The absolute path to the directory
   * @returns {boolean} True if the directory exists
   */
  static isDirectory(absolutePath: string): boolean {
    return FSUtil.exists(absolutePath) && fs.statSync(absolutePath).isDirectory();
  }

  static fsForEachRecursive(fullPath, directoryCallback, fileCallback, relativePath = '') {
    fs.readdirSync(path.join(fullPath, relativePath))
      .forEach((childName) => {
        const childRelativePath = path.join(relativePath, childName);
        const childAbsolutePath = path.join(fullPath, childRelativePath);
        if (FSUtil.isFile(childAbsolutePath)) {
          fileCallback(childName, childRelativePath, childAbsolutePath);
        } else if (directoryCallback(childName, childRelativePath, childAbsolutePath)) {
          FSUtil.fsForEachRecursive(fullPath, directoryCallback, fileCallback, childRelativePath);
        }
      });
  }
}
