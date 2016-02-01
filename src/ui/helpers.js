import inquirer from 'inquirer';
import path from 'path';

import { PathPrompt } from 'inquirer-path';
import Package from './../Package';
import { isDirectory, exists } from './../helpers';

inquirer.prompt.registerPrompt('path', PathPrompt);

export function getConfirmation(message, skip) {
  return new Promise((resolve, reject) => {
    if (skip) {
      return resolve();
    }
    const questions = [ {
      type: 'confirm',
      name: 'continue',
      message: message,
      default: true
    } ];
    inquirer.prompt(questions, (result) => {
      if (result.continue) resolve(result.path);
      else reject();
    });
  });
}

export function getProjectPath(rootPath) {
  return new Promise((resolve) => {
    const questions = [ {
      type: 'path',
      name: 'path',
      message: 'Enter the path to your project',
      directoryOnly: true,
      default: rootPath,
      validate: (answer) => {
        const potentialPath = path.isAbsolute(answer) ? answer : path.join(rootPath, answer);
        if (!exists(potentialPath)) return `The path ${potentialPath} does not exist`;
        else if (!isDirectory(potentialPath)) return `The path ${potentialPath} does not point to a directory`;
        else if (!Package.exists(potentialPath)) return `The path ${potentialPath} does not seem to be a node project`;
        return true;
      }
    } ];

    inquirer.prompt(questions, (result) => resolve(result.path));
  });
}

export function getPaths(rootPath, paths = []) {
  return new Promise((resolve, reject) => {
    const questions = [ {
      type: 'path',
      name: 'path',
      message: 'Enter a path containing local dependencies',
      directoryOnly: true,
      multi: true,
      default: rootPath,
      validate: (answer) => {
        const potentialPath = path.isAbsolute(answer) ? answer : path.join(rootPath, answer);
        if (!exists(potentialPath)) return `The path ${potentialPath} does not exist`;
        else if (!isDirectory(potentialPath)) return `The path ${potentialPath} does not point to a directory`;
        return true;
      }
    } ];
    inquirer.prompt(questions, (result) => {
      const allPaths = [ ...paths, result.path ];
      if (result.morePaths) {
        getPaths(rootPath, allPaths).then(resolve, reject);
      } else {
        resolve(allPaths);
      }
    });
  });
}

export function getWatches(projects) {
  return new Promise((resolve) => {
    const choices = projects.map((project) => `${project.name}@${project.version}`);
    const questions = [ {
      type: 'checkbox',
      name: 'watches',
      message: 'Please select the dependencies you would like to watch by default:',
      default: choices,
      choices
    } ];

    inquirer.prompt(questions, (result) => {
      resolve(result.watches.map((name) => name.split('@').shift()));
    });
  });
}
