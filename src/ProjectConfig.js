import { CONFIG } from './constants';
import fs from 'fs-extra';
import path from 'path';

export default class ProjectConfig {
  constructor(project, dependencies){
    this.project = project;
    this.dependencies = dependencies;
  }

  getProject() {
    return this.project;
  }

  getDependencies() {
    return this.dependencies;
  }
}
