import inquirer from 'inquirer';
import path from 'path';
import chalk from 'chalk';

import { PathPrompt } from 'inquirer-path';
import Package from './../Package';
import { isDirectory, exists } from './../helpers';

inquirer.prompt.registerPrompt('path', PathPrompt);

export function promptConfirmation(message, skip) {
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

export function promptProjectPath(rootPath) {
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

export function promptDependenciesPaths(rootPath) {
  return new Promise((resolve) => {
    const questions = [ {
      type: 'path',
      name: 'paths',
      message: 'Enter a path to a directory',
      directoryOnly: true,
      multi: true,
      default: rootPath,
      validate: (answer) => {
        const potentialPath = path.isAbsolute(answer) ? answer : path.join(rootPath, answer);
        if (!exists(potentialPath)) return `The path ${potentialPath} does not exist`;
        else if (!isDirectory(potentialPath)) return `The path ${potentialPath} does not point to a directory`;
        return true;
      },
      validateMulti: (answers) => {
        return answers.length > 0 ? true : 'You must select at least one path';
      }
    } ];
    console.log(`Enter paths to directories that contain local dependencies. Hit ${chalk.grey('ctrl+C')} once you are done.`);
    inquirer.prompt(questions, (result) => {
      resolve(result.paths);
    });
  });
}

export function promptDependencies(dependencies) {
  return new Promise((resolve) => {
    const choices = dependencies.map((project) => project.toString());
    const questions = [ {
      type: 'checkbox',
      name: 'watches',
      message: 'Please select the local dependencies you would like to install:',
      default: choices,
      choices
    } ];

    inquirer.prompt(questions, (result) => {
      resolve(dependencies.filter((dependency) => {
        return !! result.watches.find((name) => {
          return dependency.toString() === name;
        });
      }));
    });
  });
}

export function promptWatches(projects) {
  return new Promise((resolve) => {
    const choices = projects.map((project) => project.toString());
    const questions = [ {
      type: 'checkbox',
      name: 'watches',
      message: 'Please select the dependencies you would like to watch by default:',
      default: choices,
      choices
    } ];

    inquirer.prompt(questions, (result) => {
      resolve(result.watches.map((name) => name.substr(0, name.lastIndexOf('@'))));
    });
  });
}
