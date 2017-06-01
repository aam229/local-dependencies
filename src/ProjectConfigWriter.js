import fs from 'fs-extra';
import path from 'path';
import { CONFIG } from './constants';

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
    this.dependencies.forEach((dependencyProject) => {
      if (dependencyNames.find(dependencyName => dependencyName === dependencyProject.getName())) {
        dependencyProject.setWatch(true);
      }
    });
    return this;
  }

  write() {
    const config = Object.assign(...this.dependencies.map(dependencyProject => ({
      [dependencyProject.getName()]: {
        path: dependencyProject.getPath(),
        watch: dependencyProject.getWatch()
      }
    })));
    const configPath = path.join(this.project.path, CONFIG);
    const configTxt = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, configTxt, 'utf8');
  }
}
