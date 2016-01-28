import { CONFIG } from './constants';
import fs from 'fs-extra';
import path from 'path';

export default class ProjectConfigWriter {
  setProject(project) {
    this.project = project;
    return this;
  }

  getProject() {
    return this.project;
  }

  setDependencies(dependencies) {
    this.dependencies = dependencies;
    return this;
  }

  getDependencies() {
    return this.dependencies;
  }

  setDependenciesWatches(dependencyNames) {
    this.dependencies.forEach((dependency) => {
      if(dependencyNames.find((dependencyName) => dependencyName === dependency.name)) {
        dependency.watch = true;
      }
    });
    return this;
  }

  write() {
     const config = this.dependencies.reduce((conf, dependency) => {
       config[dependency.name] = {
         name: dependency.name,
         path: dependency.path,
         watch: dependency.watch
       }
     }, {});
    const configPath = path.join(this.project.path, CONFIG);
    fs.writeFileSync(configPath, JSON.stringify(config), 'utf8');
  }
}
