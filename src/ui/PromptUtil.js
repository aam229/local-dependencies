// @flow
import inquirer from 'inquirer';
import path from 'path';
import chalk from 'chalk';
import {
  PathPrompt,
} from 'inquirer-path';

import FSUtil from '../io/FSUtil';
import LocalPackage from '../model/LocalPackage';
import PackageReader from '../io/PackageReader';

inquirer.prompt.registerPrompt('path', PathPrompt);

/**
 * Utility methods to interact with the user via command line prompts
 */
export default class PromptUtil {
  /**
   * Prompt the user to confirm a message. If the message is accepted,
   * the returned promise resolves successfully otherwise it is
   * rejected.
   *
   * @param {string} message The message to be displayed to the user
   * @param {boolean} skip If set to true, the prompt is not be displayed
   * and the message is accepted
   * @returns {Promise}
   */
  static confirm(message: string, skip: boolean): Promise<> {
    if (skip) {
      return Promise.resolve();
    }
    const questions = [{
      type: 'confirm',
      name: 'continue',
      message,
      default: true,
    }];
    return inquirer.prompt(questions)
      .then((result) => {
        if (!result.continue) {
          throw new Error('User rejected confirmation');
        }
      });
  }

  /**
   * Prompt the user to select a valid package path.
   *
   * @param defaultPath {string} The default path to the package
   * @returns {Promise<string>} A promise that resolves to a valid npm package path
   */
  static getPackagePath(defaultPath: string): Promise<string> {
    const questions = [{
      type: 'path',
      name: 'path',
      message: 'Enter the path to your project',
      directoryOnly: true,
      default: defaultPath,
      validate: (answer) => {
        const potentialPath = path.isAbsolute(answer) ? answer : path.join(defaultPath, answer);
        if (!FSUtil.exists(potentialPath)) return `The path ${potentialPath} does not exist`;
        else if (!FSUtil.isDirectory(potentialPath)) return `The path ${potentialPath} does not point to a directory`;
        else if (!PackageReader.exists(potentialPath)) return `The path ${potentialPath} does not seem to be an npm package`;
        return true;
      },
    }];
    return inquirer.prompt(questions).then(result => result.path);
  }

  /**
   * Prompt the user to select 1 or more directories in which local project will be located
   * @param defaultPath {string} The default path
   * @returns {Promise<Array<string>>} A promise that resolves to 1 or more existing directories
   */
  static getPackageSearchPath(defaultPath: string): Promise<> {
    const questions = [{
      type: 'path',
      name: 'paths',
      message: 'Enter a path to a directory',
      directoryOnly: true,
      multi: true,
      default: defaultPath,
      validate: (answer) => {
        if (typeof answer !== 'string') {
          return true;
        }
        const potentialPath = path.isAbsolute(answer) ? answer : path.join(defaultPath, answer);
        if (!FSUtil.exists(potentialPath)) return `The path ${potentialPath} does not exist`;
        else if (!FSUtil.isDirectory(potentialPath)) return `The path ${potentialPath} does not point to a directory`;
        return true;
      },
      validateMulti: answers => answers.length > 0 ? true : 'You must select at least one path',
    }];
    console.log(`Enter paths to directories that contain local dependencies. Hit ${chalk.grey('ctrl+C')} or ${chalk.grey('ESC')} once you are done.`);
    return inquirer.prompt(questions).then(results => results.paths);
  }

  /**
   * Show a prompt allowing the user to select a list of local packages that will
   * be installed by this module.
   * @param dependencies {Array<LocalPackage>}
   * @returns {Promise<Array<LocalPackage>}
   */
  static confirmDependencyPackages(
    dependencies: Array<LocalPackage>,
  ): Promise<Array<LocalPackage>> {
    const uniqueDependencies = Array.from(new Set(dependencies));
    const dependenciesByName = uniqueDependencies
      .reduce((m, d) => m.set(d.toString(), d), new Map());
    const choices = uniqueDependencies.map(d => d.toString());
    const questions = [{
      type: 'checkbox',
      name: 'dependencies',
      message: 'Please select the local dependencies you would like to install:',
      default: choices,
      choices,
    }];

    return inquirer.prompt(questions)
      .then(result => result.dependencies.map(name => dependenciesByName.get(name)));
  }

  /**
   * Show a prompt allowing the user to select a list of local packages that will
   * be watched by this module.
   * @param dependencies {Array<LocalPackage>}
   * @returns {Promise<Array<LocalPackage>}
   * @returns {Promise}
   */
  static selectWatchedPackages(dependencies: Array<LocalPackage>): Promise<Array<LocalPackage>> {
    const dependenciesByName = dependencies.reduce((m, d) => m.set(d.toString(), d), new Map());
    const choices = dependencies.map(d => d.toString());
    const questions = [{
      type: 'checkbox',
      name: 'watches',
      message: 'Please select the dependencies you would like to watch:',
      default: choices,
      choices,
    }];

    return inquirer.prompt(questions)
      .then(result => result.watches.map(name => dependenciesByName.get(name)));
  }
}
