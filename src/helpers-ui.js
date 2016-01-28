import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import { isDirectory, exists, isPackage } from './helpers';

export function getConfirmation(message) {
  return new Promise((resolve, reject) => {
    const questions = [{
      type: 'confirm',
      name: 'continue',
      message: message,
      default: true
    }];
    inquirer.prompt(questions, (result) => {
      result.continue ? resolve(result.path) : reject();
    });
  });
}

export function getProjectPath(rootPath) {
  return new Promise((resolve, reject) => {
    const questions = [{
      type: 'input',
      name: 'path',
      message: 'Please enter the path to your project',
      default: rootPath,
      validate: (answer) => {
        const potentialPath = path.isAbsolute(answer) ? answer : path.join(rootPath, answer);
        if (!exists(potentialPath)) return `The path ${potentialPath} does not exist`;
        else if (!isDirectory(potentialPath)) return `The path ${potentialPath} does not point to a directory`;
        else if (!isPackage(potentialPath)) return `The path ${potentialPath} does not seem to be a node project`;
        else return true
      }
    }];

    inquirer.prompt(questions, (result) => resolve(result.path));
  });
}

export function getPaths(rootPath, paths = []) {
  return new Promise((resolve, reject) => {
    const questions = [{
      type: 'input',
      name: 'path',
      message: 'Please enter a path containing local dependencies',
      validate: (answer) => {
        const potentialPath = path.isAbsolute(answer) ? answer : path.join(rootPath, answer);
        if (!exists(potentialPath)) return `The path ${potentialPath} does not exist`;
        else if (!isDirectory(potentialPath)) return `The path ${potentialPath} does not point to a directory`;
        else return true
      }
    }, {
      type: 'confirm',
      name: 'morePaths',
      message: 'Would you like to add another path?',
      default: true
    }];

    inquirer.prompt(questions, (result) => {
      const allPaths = [...paths, result.path];
      if(result.morePaths){
        getPaths(rootPath, allPaths).then(resolve, reject);
      } else {
        resolve(allPaths);
      }
    });
  });
}

export function getWatches(projects) {
  return new Promise((resolve, reject) => {
    const choices = projects.map((project) => `${project.name}@${project.version}`);
    const questions = [{
      type: 'checkbox',
      name: 'watches',
      message: 'Please select the dependencies you would like to watch by default:',
      default: choices,
      choices
    }];

    inquirer.prompt(questions, (result) => {
      resolve(result.watches.map((name) => name.split('@').shift()));
    });
  });
}
